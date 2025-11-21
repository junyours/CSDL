<?php

namespace App\Http\Controllers;

use App\Models\EventSanctionSettlement;
use App\Models\Sanction;
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Str;
use Validator;

class EventSanctionSettlementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = EventSanctionSettlement::query();

        // Filter by settlement_logged_by (required)
        if ($request->filled('settlement_logged_by')) {
            $query->where('settlement_logged_by', $request->input('settlement_logged_by'));
        }

        // Filter by today's transactions if requested
        if ($request->input('today') === '1') {
            $query->whereDate('transaction_date_time', now()->toDateString());
        }

        // Get settlements with limited columns
        $settlements = $query->with([
            'event:id,event_name,event_date',
            'loggedBy:id,user_id,position'
        ])->get();

        // Records where is_void = 0
        $activeSettlements = $settlements->where('is_void', 0);

        // Records where is_void = 1
        $voidedSettlements = $settlements->where('is_void', 1);

        // Summary: Only active payments count to amount
        $totalAmountPaid = $activeSettlements->sum('amount_paid');

        // Count ALL transactions, void or not
        $totalTransactions = $settlements->unique('transaction_code')->count();

        // Count of voided transactions
        $voidedTransactionsCount = $voidedSettlements->unique('transaction_code')->count();

        return response()->json([
            'data' => $settlements,
            'voided_data' => $voidedSettlements,
            'summary' => [
                'total_amount_paid' => $totalAmountPaid,
                'total_transactions' => $totalTransactions, 
                'voided_transactions_count' => $voidedTransactionsCount,
            ],
        ]);
    }



    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $payload = $request->all();

        // Decide whether bulk or single
        if (isset($payload['settlements']) && is_array($payload['settlements'])) {
            $settlements = $payload['settlements'];

            if (empty($settlements)) {
                return response()->json(['message' => 'No settlements provided.'], 422);
            }

            $created = [];

            // Generate ONE transaction code for this bulk transaction
            $transactionCode = strtoupper(Str::random(12));

            DB::beginTransaction();
            try {
                foreach ($settlements as $index => $s) {

                    // validate per-settlement
                    $validator = Validator::make($s, [
                        'event_id' => ['required', 'exists:events,id'],
                        'user_id_no' => ['required', 'string', 'max:255'],
                        'sanction_id' => ['required', 'exists:sanctions,id'],
                        'settlement_type' => ['required', Rule::in(['monetary', 'service', 'waived'])],
                        'amount_paid' => ['nullable', 'numeric', 'min:0'],
                        'service_completed' => ['nullable', 'integer', 'min:0'],
                        'service_time_type' => ['nullable', Rule::in(['minutes', 'hours'])],
                        'settlement_logged_by' => ['required', 'numeric'],
                        'status' => ['nullable', Rule::in(['settled', 'waived'])],
                        'remarks' => ['nullable', 'string'],
                    ]);

                    if ($validator->fails()) {
                        DB::rollBack();
                        return response()->json([
                            'message' => "Validation failed for settlement index {$index}.",
                            'errors' => $validator->errors(),
                        ], 422);
                    }

                    // ensure sanction type matches
                    $sanction = Sanction::findOrFail($s['sanction_id']);
                    if ($sanction->sanction_type !== $s['settlement_type']) {
                        DB::rollBack();
                        return response()->json([
                            'message' => "Invalid settlement_type for index {$index}. Must match sanction type.",
                        ], 422);
                    }

                    // extra checks
                    if ($s['settlement_type'] === 'monetary' && !isset($s['amount_paid'])) {
                        DB::rollBack();
                        return response()->json([
                            'message' => "amount_paid is required for monetary settlement at index {$index}.",
                        ], 422);
                    }

                    if (
                        $s['settlement_type'] === 'service' &&
                        (!isset($s['service_completed']) || !isset($s['service_time_type']))
                    ) {
                        DB::rollBack();
                        return response()->json([
                            'message' => "service_completed and service_time_type required for service settlement at index {$index}.",
                        ], 422);
                    }

                    // create record
                    $new = EventSanctionSettlement::create([
                        'transaction_code' => $transactionCode,   // <── ADDED
                        'event_id' => $s['event_id'],
                        'user_id_no' => $s['user_id_no'],
                        'sanction_id' => $s['sanction_id'],
                        'settlement_type' => $s['settlement_type'],
                        'amount_paid' => $s['settlement_type'] === 'monetary' ? $s['amount_paid'] : null,
                        'service_completed' => $s['settlement_type'] === 'service' ? $s['service_completed'] : null,
                        'service_time_type' => $s['settlement_type'] === 'service' ? $s['service_time_type'] : null,
                        'settlement_logged_by' => $s['settlement_logged_by'],
                        'status' => $s['status'] ?? 'settled',
                        'remarks' => $s['remarks'] ?? null,
                        'transaction_date_time' => now(),
                    ]);

                    $created[] = $new;
                }

                DB::commit();

                return response()->json([
                    'message' => 'Sanction settlements recorded successfully.',
                    'transaction_code' => $transactionCode,
                    'count' => count($created),
                    'data' => $created,
                ], 201);

            } catch (\Throwable $th) {
                DB::rollBack();
                return response()->json([
                    'message' => 'An error occurred while recording settlements.',
                    'error' => $th->getMessage(),
                ], 500);
            }
        }

        // ===============================
        // SINGLE SETTLEMENT (legacy mode)
        // ===============================

        $validated = $request->validate([
            'event_id' => ['required', 'exists:events,id'],
            'user_id_no' => ['required', 'string', 'max:255'],
            'sanction_id' => ['required', 'exists:sanctions,id'],
            'settlement_type' => ['required', Rule::in(['monetary', 'service', 'waived'])],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
            'service_completed' => ['nullable', 'integer', 'min:0'],
            'service_time_type' => ['nullable', Rule::in(['minutes', 'hours'])],
            'settlement_logged_by' => ['required', 'numeric'],
            'status' => ['nullable', Rule::in(['settled', 'waived'])],
            'remarks' => ['nullable', 'string'],
        ]);

        $sanction = Sanction::findOrFail($validated['sanction_id']);
        if ($sanction->sanction_type !== $validated['settlement_type']) {
            return response()->json([
                'message' => 'Invalid settlement type. Must match sanction type.',
            ], 422);
        }

        // Generate its own transaction_code
        $transactionCode = strtoupper(Str::random(12));

        $settlement = EventSanctionSettlement::create([
            'transaction_code' => $transactionCode,   // <── ADDED
            'event_id' => $validated['event_id'],
            'user_id_no' => $validated['user_id_no'],
            'sanction_id' => $validated['sanction_id'],
            'settlement_type' => $validated['settlement_type'],
            'amount_paid' => $validated['amount_paid'] ?? null,
            'service_completed' => $validated['service_completed'] ?? null,
            'service_time_type' => $validated['service_time_type'] ?? null,
            'settlement_logged_by' => $validated['settlement_logged_by'],
            'status' => $validated['status'] ?? 'settled',
            'remarks' => $validated['remarks'] ?? null,
            'transaction_date_time' => now(),
        ]);

        return response()->json([
            'message' => 'Sanction settlement recorded successfully.',
            'transaction_code' => $transactionCode,
            'data' => $settlement,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(EventSanctionSettlement $eventSanctionSettlement)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EventSanctionSettlement $eventSanctionSettlement)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        // Validate that transaction_code is provided
        $request->validate([
            'transaction_code' => 'required|string',
        ]);

        $transactionCode = $request->input('transaction_code');

        // Update all matching records
        $updated = EventSanctionSettlement::where('transaction_code', $transactionCode)
            ->update(['is_void' => 1]);

        if ($updated) {
            return response()->json([
                'success' => true,
                'message' => "Transaction(s) with code {$transactionCode} have been voided.",
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => "No transactions found with code {$transactionCode}.",
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EventSanctionSettlement $eventSanctionSettlement)
    {
        //
    }
}

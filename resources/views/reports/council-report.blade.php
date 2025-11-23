<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Daily Collection Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
        }

        .header {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .header-left {
            text-align: left;
        }

        .header-left h1 {
            font-size: 22px;
            color: #2F5DCC;
            margin: 0;
        }

        .header-left h2 {
            font-size: 14px;
            color: #555;
            margin: 2px 0 0 0;
        }

        .header-right img {
            width: 120px;
            height: auto;
        }

        p {
            margin: 4px 0;
        }

        .date-section {
            margin-bottom: 20px;
        }

        .summary {
            margin-bottom: 20px;
        }

        .summary h3 {
            margin-bottom: 8px;
            color: #2F5DCC;
        }

        .summary ul {
            list-style-type: none;
            padding-left: 0;
        }

        .summary li {
            margin: 4px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        table,
        th,
        td {
            border: 1px solid #555;
        }

        th {
            background-color: #2F5DCC;
            color: white;
            padding: 8px;
            text-align: center;
        }

        td {
            padding: 6px;
            text-align: center;
        }

        .signature {
            margin-top: 50px;
            text-align: left;
        }

        .signature p {
            margin: 2px 0;
        }

        .footer {
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            font-size: 10px;
            color: #777;
            text-align: center;
        }

        .pagenum:before {
            content: counter(page);
        }

        .totalpages:before {
            content: counter(pages);
        }
    </style>
</head>

<body>
    <!-- HEADER -->
    <table width="100%" style="border: none; border-collapse: collapse;">
        <tr>
            <!-- Left side: Title -->
            <td style="text-align: left; vertical-align: top; border: none;">
                <h1 style="font-size:22px; color:#2F5DCC; margin:0;">Collection Report</h1>
                <h2 style="font-size:14px; color:#555; margin:2px 0 0 0;">{{ $department_name }}</h2>
            </td>

            <!-- Right side: Banner -->
            <td style="text-align: right; vertical-align: top; border: none;">
                <img src="{{ public_path('assets/images/banner-1.png') }}" alt="Banner"
                    style="width:200px; height:auto;">
            </td>
        </tr>
    </table>

    <!-- DATE -->
    <div class="date-section">
        <p><strong>Date:</strong> {{ now()->toFormattedDateString() }}</p>
    </div>

    <!-- SUMMARY -->
    <div class="summary">
        <h3>Summary</h3>
        <ul>
            <li><strong>Total Amount Collected:</strong> Php {{ number_format($summary['total_amount_paid'], 2) }}</li>
            <li><strong>Total Transactions:</strong> {{ $summary['total_transactions'] }}</li>
            <li><strong>Voided Transactions:</strong> {{ $summary['voided_transactions_count'] }}</li>
        </ul>
    </div>

    <!-- TRANSACTION LIST -->
    <h3>Transaction List</h3>
    <table>
        <thead>
            <tr>
                <th>Code</th>
                <th>User</th>
                <th>Amount (Php)</th>
                <th>Event</th>
                <th>Time</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($settlements as $s)
                <tr>
                    <td>{{ $s->transaction_code }}</td>
                    <td>{{ $s->user_id_no }}</td>
                    <td>{{ number_format($s->amount_paid, 2) }}</td>
                    <td>{{ $s->event->event_name }}</td>
                    <td>{{ \Carbon\Carbon::parse($s->transaction_date_time)->format('h:i A') }}</td>
                    <td>{{ $s->is_void ? 'VOID' : 'OK' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- COUNCIL IN CHARGE -->
    <div class="signature">
        <p><strong>{{ $council_member_name }}</strong></p>
        <p>Council in charge</p>
    </div>

    <!-- FOOTER -->
    <div class="footer">
        <p>This is a system generated report and does not require a signature.</p>
        <p>{{ now()->format('F d, Y h:i A') }}</p>
    </div>
</body>

</html>
<!DOCTYPE html>
<html>

<head>
    <title>CSDL Violation Report</title>
    <style>
        @page {
            margin: 0cm 0cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #334155;
            margin: 1.5cm;
            position: relative;
        }

        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(226, 232, 240, 0.4);
            font-weight: bold;
            z-index: -1000;
            width: 100%;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 10px;
        }

        /* Modern Header Layout */
        .header-container {
            width: 100%;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }

        .school-name {
            font-size: 18px;
            font-weight: 900;
            color: #1e3a8a;
            text-transform: uppercase;
        }

        .dept-name {
            font-size: 10px;
            color: #64748b;
            letter-spacing: 1px;
        }

        /* Digital ID Card Styling */
        .student-info-bar {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #1e3a8a;
            margin-bottom: 25px;
        }

        /* Table Styling */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th {
            background-color: #1e3a8a;
            color: white;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.5px;
            padding: 10px;
            text-align: left;
        }

        td {
            padding: 12px 10px;
            border-bottom: 1px solid #e2e8f0;
        }

        tr:nth-child(even) {
            background-color: #f1f5f9;
        }

        /* Status Badges */
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
        }

        .badge-violation {
            background-color: #dbeafe;
            color: #1e40af;
        }

        .badge-money {
            background-color: #fee2e2;
            color: #991b1b;
        }

        .badge-service {
            background-color: #fef9c3;
            color: #854d0e;
        }

        /* App Generated Badge */
        .verified-ribbon {
            position: absolute;
            top: 10px;
            right: -10px;
            background: #10b981;
            color: white;
            padding: 5px 15px;
            font-weight: bold;
            font-size: 9px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .footer {
            margin-top: 50px;
            width: 100%;
        }

        .qr-placeholder {
            font-size: 8px;
            color: #94a3b8;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="verified-ribbon">OFFICIALLY APP GENERATED</div>
    <div class="watermark">myOCC</div>
    <div class="header-container">
        <table style="width: 100%; border: none;">
            <tr>
                <td style="width: 70px; border: none; padding: 0;">
                    <img src="{{ public_path('assets/images/school-logo.png') }}" width="60">
                </td>
                <td style="border: none; padding: 0 15px;">
                    <div class="school-name">Opol Community College</div>
                    <div class="dept-name">Center for Student Development and Leadership</div>
                    <div style="font-weight: bold; font-size: 11px; margin-top: 5px;">OFFICE OF THE CSDL</div>
                </td>
                <td style="width: 70px; border: none; padding: 0; text-align: right;">
                    <img src="{{ public_path('assets/images/csdl-logo.jpg') }}" width="60">
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th>Ref #</th>
                <th>ID Number</th>
                <th>Violation</th>
                <th>Sanction</th>
                <th>Status</th>
                <th>Issued Date & Time</th>
            </tr>
        </thead>
        <tbody>
            @foreach($records as $row)
                <tr>
                    <td style="font-family: monospace; font-weight: bold; color: #475569;">{{ $row->reference_no }}</td>
                    <td>{{ $row->user?->user_id_no }}</td>
                    <td>{{ $row->formatted_codes }}</td>
                    <td>{{ $row->sanction_desc }}</td>
                    <td>
                        <span class="badge {{ $row->status === 'settled' ? 'badge-settled' : 'badge-pending' }}">
                            {{ strtoupper($row->status) }}
                        </span>
                    </td>
                    <td>{{ $row->issued_date_time->format('M d, Y h:i A') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <table style="width: 100%; border: none;">
            <tr style="background: transparent;">
                <td style="width: 50%; border: none; vertical-align: bottom;">
                    <div style="border-top: 1px solid #334155; width: 200px; padding-top: 5px; text-align: center;">
                        <span style="font-size: 9px; font-weight: bold; text-transform: uppercase;">Authorized
                            Personnel</span>
                    </div>
                </td>
                <td style="width: 50%; border: none; text-align: right;">
                    <div
                        style="display: inline-block; text-align: left; border: 1px dashed #cbd5e1; padding: 10px; border-radius: 8px;">
                        <span style="font-size: 8px; font-weight: bold; color: #10b981;">DIGITAL VERIFICATION</span><br>
                        <span style="font-size: 8px; color: #64748b;">Timestamp:
                            {{ now()->format('Ymd-His') }}</span><br>
                        <span style="font-size: 8px; color: #64748b;">ID: {{ md5($user->user_id_no . now()) }}</span>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>
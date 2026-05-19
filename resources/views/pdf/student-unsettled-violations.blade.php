<!DOCTYPE html>
<html>

<head>
    <title>CSDL Violation Report - {{ $user->user_id_no }}</title>

    <style>
        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #000;
            margin: 40px;
        }

        /* HEADER */
        .header {
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .header table {
            width: 100%;
        }

        .header img {
            width: 60px;
        }

        .school-name {
            font-size: 16px;
            font-weight: bold;
        }

        .dept {
            font-size: 11px;
        }

        /* INFO */
        .info {
            margin-bottom: 20px;
        }

        .info table {
            width: 100%;
        }

        .info td {
            padding: 5px;
            vertical-align: top;
        }

        .label {
            font-size: 9px;
            color: #555;
        }

        .value {
            font-size: 12px;
            font-weight: bold;
        }

        /* COUNT */
        .count {
            margin-bottom: 10px;
        }

        /* TABLE */
        table.data {
            width: 100%;
            border-collapse: collapse;
        }

        table.data th {
            border: 1px solid #000;
            padding: 6px;
            font-size: 10px;
            text-align: left;
            background: #eee;
        }

        table.data td {
            border: 1px solid #000;
            padding: 8px;
            vertical-align: top;
        }

        /* BADGE SIMPLIFIED */
        .badge {
            display: inline-block;
            border: 1px solid #000;
            padding: 2px 5px;
            font-size: 9px;
            margin: 1px;
        }

        /* FOOTER */
        .footer {
            margin-top: 40px;
        }

        .signature {
            margin-top: 40px;
        }

        .line {
            border-top: 1px solid #000;
            width: 200px;
            text-align: center;
            margin-top: 40px;
            padding-top: 5px;
        }

        .qr {
            text-align: right;
        }

        .qr img {
            width: 100px;
        }

        .qr-label {
            font-size: 9px;
        }
    </style>
</head>

<body>

    <!-- HEADER -->
    <div class="header">
        <table>
            <tr>
                <td width="70">
                    <img src="{{ public_path('assets/images/school-logo.png') }}">
                </td>

                <td>
                    <div class="school-name">Opol Community College</div>
                    <div class="dept">Center for Student Development and Leadership</div>
                    <div class="dept"><strong>OFFICE OF THE CSDL</strong></div>
                </td>

                <td width="70" align="right">
                    <img src="{{ public_path('assets/images/defaultMode-csdl-logo.png') }}">
                </td>
            </tr>
        </table>
    </div>

    <!-- INFO -->
    <div class="info">
        <table>
            <tr>
                <td>
                    <div class="label">Full Name</div>
                    <div class="value">
                        {{ $student['first_name'] }} {{ $student['middle_name'] }} {{ $student['last_name'] }}
                    </div>
                </td>

                <td>
                    <div class="label">ID Number</div>
                    <div class="value">{{ $user->user_id_no }}</div>
                </td>

                <td>
                    <div class="label">Generated</div>
                    <div class="value">{{ now()->format('M d, Y, h:i A') }}</div>
                </td>
            </tr>

            <tr>
                <td>
                    <div class="label">Year & Section</div>
                    <div class="value">
                        {{ data_get($student, 'current_enrollment.year_section.year_level.year_level', '-') }}
                        - {{ data_get($student, 'current_enrollment.year_section.section', '-') }}
                    </div>
                </td>

                <td>
                    <div class="label">Course</div>
                    <div class="value">
                        {{ data_get($student, 'current_enrollment.year_section.course.course_name_abbreviation', '-') }}
                    </div>
                </td>

                <td></td>
            </tr>
        </table>
    </div>

    <!-- COUNT -->
    <div class="count">
        Total Unsettled Violations:
        <strong>{{ $violations->count() }}</strong>
    </div>

    <!-- TABLE -->
    <table class="data">
        <thead>
            <tr>
                <th width="15%">Ref #</th>
                <th width="20%">Date</th>
                <th width="35%">Violations</th>
                <th width="30%">Sanction</th>
            </tr>
        </thead>

        <tbody>
            @forelse($violations as $row)
                <tr>
                    <td>#{{ $row->reference_no }}</td>

                    <td>
                        {{ \Carbon\Carbon::parse($row->issued_date_time)->format('M d, Y') }}<br>
                        <small>
                            {{ \Carbon\Carbon::parse($row->issued_date_time)->format('h:i A') }}
                        </small>
                    </td>

                    <td>
                        @foreach($row->violation_codes as $code)
                            <span class="badge">{{ $code }}</span>
                        @endforeach
                    </td>

                    <td>
                        @if($row->sanction)
                            {{ $row->sanction->sanction_name }}<br>

                            <small>
                                @if($row->sanction->sanction_type === 'monetary')
                                    ₱{{ number_format($row->sanction->monetary_amount, 2) }}
                                @else
                                    {{ $row->sanction->service_time }}
                                    {{ ucfirst($row->sanction->service_time_type) }}
                                @endif
                            </small>
                        @else
                            <span>Pending</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" align="center">
                        No unsettled violations found.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- FOOTER -->
    <div class="footer">
        <table width="100%">
            <tr>
                <td>
                    <div class="line">
                        Authorized Personnel
                    </div>
                </td>

                <td class="qr">
                    <img src="{{ $qr }}">
                </td>
            </tr>
        </table>
    </div>

</body>

</html>
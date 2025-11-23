<!-- HEADER -->
<table width="100%" style="border: none; border-collapse: collapse; margin-bottom: 15px;">
    <tr>
        <!-- Left side: Title -->
        <td style="text-align: left; vertical-align: top; border: none;">
            <h1 style="font-size:24px; color:#2F5DCC; margin:0; font-family: Arial, sans-serif;">Event Attendance Report
            </h1>
            <h2 style="font-size:16px; color:#555; margin:4px 0 0 0; font-family: Arial, sans-serif;">
                {{ $event->event_name }}
            </h2>
        </td>

        <!-- Right side: Banner -->
        <td style="text-align: right; vertical-align: top; border: none;">
            <img src="{{ public_path('assets/images/banner-1.png') }}" alt="Banner" style="width:180px; height:auto;">
        </td>
    </tr>
</table>

<!-- EVENT DETAILS -->
<div style="margin-bottom:15px; font-family: Arial, sans-serif; font-size:14px;">
    <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($event->event_date)->format('F d, Y') }}</p>
    <p><strong>Location:</strong> {{ $event->location->location_name }}, {{ $event->location->address }}</p>
    <p><strong>Sanction:</strong> {{ $event->sanction->sanction_name }} (Php {{ $event->sanction->monetary_amount }})
    </p>
    <p><strong>Attendance Time:</strong>
        @if ($event->attendance_type == 'single')
            {{ \Carbon\Carbon::parse($event->start_time)->format('h:i A') }} -
            {{ \Carbon\Carbon::parse($event->end_time)->format('h:i A') }}
        @elseif ($event->attendance_type == 'double')
            1st Shift: {{ \Carbon\Carbon::parse($event->first_start_time)->format('h:i A') }} -
            {{ \Carbon\Carbon::parse($event->first_end_time)->format('h:i A') }}<br>
            2nd Shift: {{ \Carbon\Carbon::parse($event->second_start_time)->format('h:i A') }} -
            {{ \Carbon\Carbon::parse($event->second_end_time)->format('h:i A') }}
        @endif
    </p>
</div>

<!-- SUMMARY -->
<div style="margin-bottom:20px; font-family: Arial, sans-serif;">
    <h3 style="background-color:#2F5DCC; color:#fff; padding:6px 10px; margin:0 0 8px 0; font-size:16px;">Summary</h3>
    @php
        $checkpointLabels = [
            'start_time' => 'Time In',
            'end_time' => 'Time Out',
            'first_start_time' => 'Time In',
            'first_end_time' => 'Time Out',
            'second_start_time' => 'Time In',
            'second_end_time' => 'Time Out',
        ];
    @endphp

    <table width="50%" style="border-collapse: collapse; font-size:14px;">
        <thead>
            <tr style="background-color:#f0f0f0;">
                <th style="padding:6px; border:1px solid #ccc; text-align:left;"></th>
                <th style="padding:6px; border:1px solid #ccc; text-align:center;">Present</th>
                <th style="padding:6px; border:1px solid #ccc; text-align:center;">Absent</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($data->valid_checkpoints as $cp)
                <tr>
                    <td style="padding:6px; border:1px solid #ccc;">{{ $checkpointLabels[$cp] ?? $cp }}</td>
                    <td style="padding:6px; border:1px solid #ccc; text-align:center;">
                        {{ $data->checkpoint_counts->$cp->attended }}
                    </td>
                    <td style="padding:6px; border:1px solid #ccc; text-align:center;">
                        {{ $data->checkpoint_counts->$cp->absent }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>

<!-- PARTICIPANTS -->
<h3
    style="background-color:#2F5DCC; color:#fff; padding:6px 10px; margin:0 0 8px 0; font-size:16px; font-family: Arial, sans-serif;">
    Participants</h3>
<table width="100%" border="1" cellspacing="0" cellpadding="5"
    style="border-collapse: collapse; font-family: Arial, sans-serif; font-size:13px;">
    <thead>
        <tr style="background-color:#f0f0f0;">
            <th style="padding:6px;">ID #</th>
            <th style="padding:6px;">Name</th>
            @foreach ($data->valid_checkpoints as $cp)
                <th style="padding:6px;">{{ $checkpointLabels[$cp] ?? $cp }}</th>
            @endforeach
        </tr>
    </thead>
    <tbody>
        @foreach ($data->participants as $p)
            <tr>
                <td style="padding:4px; text-align:center;">{{ $p->user_id_no }}</td>
                <td style="padding:4px;">{{ $p->last_name }}, {{ $p->first_name }}</td>
                @foreach ($p->attendance as $a)
                    <td style="padding:4px; text-align:center;">{{ $a->attended_at ?? 'ABSENT' }}</td>
                @endforeach
            </tr>
        @endforeach
    </tbody>
</table>

<!-- FOOTER -->
<div style="margin-top:20px; font-family: Arial, sans-serif; font-size:12px; color:#555;">
    <p style="margin:0;">This is a system-generated report and does not require a signature.</p>
    <p style="margin:0;">Generated: {{ now()->format('F d, Y h:i A') }}</p>
</div>

<!-- WATERMARK -->
<div style="
    position: fixed;
    top: 45%;
    left: 25%;
    width: 50%;
    text-align: center;
    opacity: 0.1;
    font-size: 80px;
    transform: rotate(-45deg);
    color: #000;
    z-index: -1000;
    font-family: Arial, sans-serif;
">
    {{ $event->event_name }} ATTENDANCE REPORT
</div>
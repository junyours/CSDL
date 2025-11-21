<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $event->event_name }} - Manage</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">

    <style>
        #qr-reader {
            width: 100%;
            max-width: 480px;
        }
    </style>
</head>

<body class="bg-light d-flex flex-column min-vh-100">
    <div class="container mt-4 flex-grow-1 mb-5">

        <h1 class="fw-bold">{{ $event->event_name }}</h1>
        <p class="text-muted">Date: {{ \Carbon\Carbon::parse($event->event_date)->format('F d, Y') }}</p>

        <!-- TWO COLUMNS -->
        <div class="row mt-4">

            <!-- LEFT: QR SCANNER -->
            <div class="col-12 col-lg-6">

                <div class="card shadow-sm">
                    <div class="card-header bg-dark text-white fw-bold text-center">
                        QR Code Scanner
                    </div>
                    <div class="card-body text-center">
                        <div id="qr-reader" class="mx-auto"></div>
                    </div>
                </div>

            </div>

            <!-- RIGHT: RESULT -->
            <div class="col-12 col-lg-6">
                <div class="card shadow-sm h-100">
                    <div class="card-header bg-primary text-white fw-bold">
                        Attendance Result
                    </div>
                    <div id="qr-result" class="alert alert-info text-center d-none m-3 fw-bold"></div>
                    <div class="card-body" id="attendance-results">
                        <p class="text-muted">Scan your QR code to view attendance...</p>
                    </div>
                </div>

            </div>

        </div>

    </div>

    <!-- Footer -->
    @include('layouts.footer')

    <!-- QR Scanner -->
    <script src="https://cdn.jsdelivr.net/npm/html5-qrcode/minified/html5-qrcode.min.js"></script>

    <script>
        document.addEventListener("DOMContentLoaded", function () {

            const resultBox = document.getElementById("qr-result");
            const resultsContainer = document.getElementById("attendance-results");

            const cam = new Html5Qrcode("qr-reader");
            let scanning = true;

            function onScanSuccess(decodedText) {
                if (!scanning) return; // Prevent multiple triggers
                scanning = false;

                resultBox.classList.remove("d-none");
                resultBox.innerText = decodedText;

                fetchAttendance(decodedText);

                // Pause for 3 seconds before scanning again
                setTimeout(() => {
                    scanning = true;
                }, 3000); // Adjust interval as needed (ms)
            }

            function fetchAttendance(userIdNo) {
                const eventId = "{{ $event->id }}";

                // Map checkpoint keys to display labels
                const checkpointLabels = {
                    'first_start_time': 'Time In',
                    'first_end_time': 'Time Out',
                    'second_start_time': 'Time In',
                    'second_end_time': 'Time Out',
                    'start_time': 'Time In',
                    'end_time': 'Time Out',
                };

                fetch(`/attendance/search?event_id=${eventId}&user_id_no=${userIdNo}`)
                    .then(res => res.json())
                    .then(data => {

                        if (!data.data || data.data.attendances.length === 0) {
                            resultsContainer.innerHTML = `
            <div class="alert alert-danger">No attendance found.</div>`;
                            return;
                        }

                        let html = `
        <table class="table table-bordered">
            <thead class="table-success">
                <tr>
                    <th></th>
                    <th>Time</th>
                    <th>Device</th>
                    <th>Location</th>
                </tr>
            </thead>
            <tbody>
        `;

                        data.data.attendances.forEach(a => {
                            const label = checkpointLabels[a.checkpoint] || a.checkpoint;

                            const [hours, minutes, seconds] = a.attended_at.split(':');

                            const date = new Date();
                            date.setHours(parseInt(hours));
                            date.setMinutes(parseInt(minutes));
                            date.setSeconds(parseInt(seconds));

                            const time = date.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true,
                            });

                            const lat = a.location.lat;
                            const lng = a.location.lng;
                            const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;

                            html += `
    <tr>
        <td>${label}</td>
        <td>${time}</td>
        <td>${a.device_model ?? 'N/A'}</td>
        <td><a href="${mapLink}" target="_blank">${lat}, ${lng}</a></td>
    </tr>
    `;
                        });

                        html += "</tbody></table>";

                        resultsContainer.innerHTML = html;
                    })
                    .catch(err => {
                        console.error(err);
                        resultsContainer.innerHTML =
                            `<div class="alert alert-danger mt-3">Error fetching data.</div>`;
                    });
            }

            Html5Qrcode.getCameras().then(cameras => {
                if (cameras.length) {
                    cam.start(
                        cameras[0].id,
                        { fps: 10, qrbox: 250 },
                        onScanSuccess,
                        (err) => { }
                    );
                } else {
                    alert("No camera found");
                }
            });

        });
    </script>

</body>

</html>
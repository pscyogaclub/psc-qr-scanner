// ==========================================================
// PSC QR Scanner
// app.js
// Version 3.1
// ==========================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwwUYp9mlKw4eYUBj8-0W4loFq0Vr_uieJA7GT99Az61Ohq30BDZiQ3VmYZgA9EU985/exec";

const result = document.getElementById("result");

let html5QrCode = null;
let isProcessing = false;

async function startScanner() {

    result.innerHTML = "Initializing camera...";

    html5QrCode = new Html5Qrcode("reader");

    try {

        const devices = await Html5Qrcode.getCameras();

        if (!devices || devices.length === 0) {
            result.innerHTML = "No camera found.";
            return;
        }

        let cameraId = devices[0].id;

        const backCamera = devices.find(device =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear") ||
            device.label.toLowerCase().includes("environment")
        );

        if (backCamera) {
            cameraId = backCamera.id;
        }

        await html5QrCode.start(
            cameraId,
            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250
                }
            },
            onScanSuccess,
            onScanFailure
        );

        result.innerHTML = "Ready to scan...";

    } catch (err) {

        console.error(err);

        result.innerHTML =
            "Camera failed to start.<br><br>" +
            err;

    }

}

async function onScanSuccess(decodedText) {

    if (isProcessing) return;

    isProcessing = true;

    result.innerHTML =
        "QR Detected<br><br><strong>" +
        decodedText +
        "</strong><br><br>Sending to server...";

    try {
        await html5QrCode.stop();
    } catch (e) {
        console.log(e);
    }

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({
                membershipId: decodedText
            })

        });

        const data = await response.json();

showResult(data);

    } catch (err) {

        console.error(err);

        result.innerHTML =
            "Connection Failed<br><br>" +
            err.message;

    }

}

function onScanFailure(error) {
    // ignore
}
function showResult(data) {

    if (!data.success) {

        result.innerHTML = `
            <div class="result-card error">

                <div class="icon">❌</div>

                <h2>CHECK-IN GAGAL</h2>

                <p>${data.message || "Unknown Error"}</p>

                <button onclick="startScannerAgain()">
                    Scan Lagi
                </button>

            </div>
        `;

        return;

    }

    const info = data.result;

    result.innerHTML = `

        <div class="result-card">

            <div class="icon success">
                ✅
            </div>

            <h2>CHECK-IN BERHASIL</h2>

            <p class="subtitle">
                Attendance berhasil dicatat
            </p>

            <div class="info">

                <div class="row">
                    <span>Member ID</span>
                    <strong>${info.memberId}</strong>
                </div>

                <div class="row">
                    <span>Membership</span>
                    <strong>${info.membershipId}</strong>
                </div>

                <div class="row">
                    <span>Remaining Session</span>
                    <strong class="session">
                        ${info.remainingSessions}
                    </strong>
                </div>

                <div class="row">
                    <span>Status</span>

                    <span class="badge">
                        ${info.status}
                    </span>
                </div>

            </div>

            <button onclick="startScannerAgain()">
                Scan Member Berikutnya
            </button>

        </div>

    `;

}
async function startScannerAgain() {

    result.innerHTML = "Initializing camera...";

    isProcessing = false;

    startScanner();

}
window.addEventListener("load", startScanner);

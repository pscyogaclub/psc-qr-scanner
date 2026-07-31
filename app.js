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

        result.innerHTML =
            "<pre>" +
            JSON.stringify(data, null, 2) +
            "</pre>";

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

window.addEventListener("load", startScanner);
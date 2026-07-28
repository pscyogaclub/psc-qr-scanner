// ==========================================================
// PSC QR Scanner
// app.js
// Version 2.0
// ==========================================================

const result = document.getElementById("result");

let html5QrCode = null;

async function startScanner() {

    result.innerHTML = "Initializing camera...";

    html5QrCode = new Html5Qrcode("reader");

    try {

        const devices = await Html5Qrcode.getCameras();

        if (!devices || devices.length === 0) {

            result.innerHTML = "No camera found.";
            return;

        }

        // Cari kamera belakang
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

    }
    catch (err) {

        console.error(err);

        result.innerHTML =
            "Camera failed to start.<br><br>" +
            err;

    }

}

async function onScanSuccess(decodedText) {

    result.innerHTML =
        "<strong>" + decodedText + "</strong>";

    try {

        await html5QrCode.stop();

    }
    catch (e) {
        console.log(e);
    }

}

function onScanFailure(error) {

    // sengaja dikosongkan

}

window.addEventListener("load", startScanner);

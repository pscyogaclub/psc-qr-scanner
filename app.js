// ==========================================================
// PSC QR Scanner
// app.js
// Version 1.0
// ==========================================================

const result = document.getElementById("result");

function onScanSuccess(decodedText) {

    result.innerHTML =
        "QR Code berhasil dibaca:<br><br><strong>" +
        decodedText +
        "</strong>";

}

function onScanFailure(error) {
    // Tidak perlu melakukan apa-apa.
}

const html5QrCode = new Html5QrcodeScanner(
    "reader",
    {
        fps: 10,
        qrbox: 250
    },
    false
);

html5QrCode.render(
    onScanSuccess,
    onScanFailure
);

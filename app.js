// ==========================================================
// PSC QR Scanner
// BUILD-002 FINAL
// ==========================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwwUYp9mlKw4eYUBj8-0W4loFq0Vr_uieJA7GT99Az61Ohq30BDZiQ3VmYZgA9EU985/exec";

const result = document.getElementById("result");
const reader = document.getElementById("reader");
const scannerSection = document.getElementById("scannerSection");
const statusText = document.getElementById("statusText");
const statusDot = document.querySelector(".status-dot");

let html5QrCode = null;
let isProcessing = false;

// ==========================================================
// STATUS
// ==========================================================

function setStatus(text, color = "#F5A623") {

    statusText.textContent = text;
    statusDot.style.background = color;

}

// ==========================================================
// START SCANNER
// ==========================================================

async function startScanner() {

    isProcessing = false;

    scannerSection.style.display = "block";

    result.innerHTML = "";

    setStatus("Initializing Camera...");

    html5QrCode = new Html5Qrcode("reader");

    try {

        const devices = await Html5QrCode.getCameras();

        if (!devices.length) {

            setStatus("No Camera Found", "#DC3545");

            result.innerHTML = `
                <div class="result-card error">

                    <div class="icon">📷</div>

                    <h2>No Camera</h2>

                    <p>
                        Camera tidak ditemukan.
                    </p>

                </div>
            `;

            return;

        }

        let cameraId = devices[0].id;

        const backCamera = devices.find(device => {

            const label = device.label.toLowerCase();

            return (
                label.includes("back") ||
                label.includes("rear") ||
                label.includes("environment")
            );

        });

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

        setStatus("Ready to Scan", "#28A745");

    } catch (err) {

        console.error(err);

        setStatus("Camera Error", "#DC3545");

        result.innerHTML = `

            <div class="result-card error">

                <div class="icon">❌</div>

                <h2>Camera Error</h2>

                <p>${err.message}</p>

            </div>

        `;

    }

}

// ==========================================================
// SCAN SUCCESS
// ==========================================================

async function onScanSuccess(decodedText) {

    if (isProcessing) return;

    isProcessing = true;

    setStatus("Sending Attendance...", "#0D6EFD");

    try {

        await html5QrCode.stop();

    } catch (e) {}

    scannerSection.style.display = "none";

    result.innerHTML = `

        <div class="result-card">

            <div class="icon">⏳</div>

            <h2>Processing...</h2>

            <p>
                Sending attendance to server...
            </p>

        </div>

    `;

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

        setStatus("Connection Failed", "#DC3545");

        result.innerHTML = `

            <div class="result-card error">

                <div class="icon">❌</div>

                <h2>Connection Failed</h2>

                <p>${err.message}</p>

                <button onclick="startScannerAgain()">

                    Try Again

                </button>

            </div>

        `;

    }

}

function onScanFailure() {

    // ignore

}


// ==========================================================
// SHOW RESULT
// ==========================================================

function showResult(data) {

    if (!data.success) {

        setStatus("Check-in Failed", "#DC3545");

        result.innerHTML = `

            <div class="result-card error">

                <div class="icon">❌</div>

                <h2>CHECK-IN GAGAL</h2>

                <p>

                    ${data.message || "Unknown Error"}

                </p>

                <button onclick="startScannerAgain()">

                    Scan Lagi

                </button>

            </div>

        `;

        return;

    }

    const info = data.result;

    setStatus("Attendance Recorded", "#28A745");

    result.innerHTML = `

        <div class="result-card">

            <div class="icon">

                ✅

            </div>

            <h2>

                CHECK-IN BERHASIL

            </h2>

            <p class="subtitle">

                Attendance berhasil dicatat.

            </p>

            <div class="info">

                <div class="row">

                    <span>Member ID</span>

                    <strong>

                        ${info.memberId}

                    </strong>

                </div>

                <div class="row">

                    <span>Membership</span>

                    <strong>

                        ${info.membershipId}

                    </strong>

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

// ==========================================================
// RESTART
// ==========================================================

async function startScannerAgain() {

    result.innerHTML = "";

    scannerSection.style.display = "block";

    if (html5QrCode) {

        try {

            await html5QrCode.clear();

        } catch (e) {}

    }

    startScanner();

}

// ==========================================================

window.addEventListener(

    "load",

    startScanner

);


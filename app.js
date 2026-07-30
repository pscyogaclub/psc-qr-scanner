
// ==========================================================
// PSC YOGA CLUB ADMIN SCANNER
// app.js
// Part 1
// ==========================================================

const WEB_APP_URL =
"https://script.google.com/macros/s/AKfycbwwUYp9mlKw4eYUBj8-0W4loFq0Vr_uieJA7GT99Az61Ohq30BDZiQ3VmYZgA9EU985/exec";

let html5QrCode = null;
let scannerRunning = false;
let processing = false;

// ==========================================================
// ELEMENTS
// ==========================================================

const scannerSection = document.getElementById("scannerSection");

const resultCard =
document.getElementById("resultCard");

const scanAgainBtn =
document.getElementById("scanAgainBtn");

const memberId =
document.getElementById("memberId");

const membershipId =
document.getElementById("membershipId");

const remainingSessions =
document.getElementById("remainingSessions");

const statusBadge =
document.getElementById("statusBadge");

// ==========================================================
// INIT
// ==========================================================

window.addEventListener("load", () => {

    startScanner();

});

scanAgainBtn.addEventListener("click", () => {

    resetScanner();

});

// ==========================================================
// START SCANNER
// ==========================================================

async function startScanner() {

    if (scannerRunning) return;

    html5QrCode = new Html5Qrcode("reader");

    try {

        const cameras = await Html5Qrcode.getCameras();

        if (!cameras || cameras.length === 0) {
            alert("Tidak ada kamera yang terdeteksi.");
            return;
        }

        // pilih kamera belakang jika ada
        let cameraId = cameras[0].id;

        for (const camera of cameras) {

            const name = camera.label.toLowerCase();

            if (
                name.includes("back") ||
                name.includes("rear") ||
                name.includes("belakang")
            ) {
                cameraId = camera.id;
                break;
            }
        }

        await html5QrCode.start(
            cameraId,
            {
                fps: 10,
                qrbox: {
                    width: 260,
                    height: 260
                }
            },
            onScanSuccess,
            onScanFailure
        );

        scannerRunning = true;

    } catch (err) {

        console.error(err);
        alert(err.message);

    }

}
// ==========================================================
// QR SUCCESS
// ==========================================================

async function onScanSuccess(decodedText){

    if(processing) return;

    processing = true;

    try{

        await html5QrCode.stop();

        scannerRunning = false;

    }

    catch(e){

        console.log(e);

    }

    await checkAttendance(decodedText);

}

// ==========================================================
// IGNORE SCAN ERROR
// ==========================================================

function onScanFailure(){

}

// ==========================================================
// CHECK ATTENDANCE
// ==========================================================

async function checkAttendance(qrValue){

    try{

        const response = await fetch(WEB_APP_URL,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                membershipId:qrValue

            })

        });

        const data = await response.json();

        if(!data.success){

            alert("Member tidak ditemukan.");

            processing = false;

            await startScanner();

            return;

        }

        showResult(data.result);

    }

    catch(error){

    console.error(error);

    alert(error.message);

    processing = false;

    await startScanner();

}

// ==========================================================
// SHOW RESULT
// ==========================================================

function showResult(result){

    scannerSection.classList.add("hidden");

    resultCard.classList.add("show");

    memberId.textContent =
        result.memberId ?? "-";

    membershipId.textContent =
        result.membershipId ?? "-";

    remainingSessions.textContent =
        result.remainingSessions ?? "-";

    statusBadge.textContent =
        result.status ?? "-";

    statusBadge.className = "";

    if(result.status === "ACTIVE"){

        statusBadge.classList.add(
            "status-active"
        );

    }
    else{

        statusBadge.classList.add(
            "status-expired"
        );

    }

    processing = false;

}

// ==========================================================
// RESET
// ==========================================================

async function resetScanner(){

    resultCard.classList.remove("show");

    scannerSection.classList.remove("hidden");

    await startScanner();

}

// ==========================================================
// OPTIONAL HELPERS
// ==========================================================

function showError(message){

    alert(message);

}

function showSuccess(message){

    console.log(message);

}

// ==========================================================
// PAGE VISIBILITY
// ==========================================================

document.addEventListener("visibilitychange", async ()=>{

    if(document.hidden){

        if(scannerRunning && html5QrCode){

            try{

                await html5QrCode.stop();

                scannerRunning = false;

            }

            catch(e){

                console.log(e);

            }

        }

    }
    else{

        if(
            !scannerRunning &&
            !processing &&
            !resultCard.classList.contains("show")
        ){

            startScanner();

        }

    }

});

// ==========================================================
// CLEANUP
// ==========================================================

window.addEventListener("beforeunload", async ()=>{

    if(scannerRunning && html5QrCode){

        try{

            await html5QrCode.stop();

        }

        catch(e){

            console.log(e);

        }

    }

});

// ==========================================================
// END
// ==========================================================

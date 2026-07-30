// ==========================================================
// PSC QR Attendance Scanner
// BUILD-003 Emerald Edition
// ==========================================================

const API_URL =
"https://script.google.com/macros/s/AKfycbwwUYp9mlKw4eYUBj8-0W4loFq0Vr_uieJA7GT99Az61Ohq30BDZiQ3VmYZgA9EU985/exec";

const reader=document.getElementById("reader");
const result=document.getElementById("result");
const scannerSection=document.getElementById("scannerSection");
const statusText=document.getElementById("statusText");
const statusDot=document.querySelector(".status-dot");

let html5QrCode=null;
let isProcessing=false;

// ==========================================================

function setStatus(text,color){

    statusText.textContent=text;

    statusDot.style.background=color;

}

// ==========================================================

function showLoading(message){

    result.innerHTML=`

    <div class="result-card">

        <div class="icon">

            ⏳

        </div>

        <h2>

            Processing

        </h2>

        <p class="subtitle">

            ${message}

        </p>

    </div>

    `;

}

// ==========================================================

function showError(message){

    setStatus(
        "Check-in Failed",
        "#D64B4B"
    );

    result.innerHTML=`

    <div class="result-card error">

        <div class="icon">

            ❌

        </div>

        <h2>

            CHECK-IN FAILED

        </h2>

        <p class="subtitle">

            ${message}

        </p>

        <button onclick="restartScanner()">

            Scan Again

        </button>

    </div>

    `;

}

// ==========================================================

function showSuccess(info){

    setStatus(
        "Attendance Recorded",
        "#2EAF61"
    );

    result.innerHTML=`

    <div class="result-card">

        <div class="icon">

            ✅

        </div>

        <h2>

            CHECK-IN SUCCESS

        </h2>

        <p class="subtitle">

            Attendance successfully recorded.

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

        <button onclick="restartScanner()">

            Scan Member Berikutnya

        </button>

    </div>

    `;

}

// ==========================================================

async function startScanner(){

    isProcessing=false;

    scannerSection.style.display="block";

    result.innerHTML=`
        <div class="placeholder">
            Ready to Scan
        </div>
    `;

    setStatus(
        "Initializing Camera...",
        "#E8B44D"
    );

    html5QrCode=new Html5Qrcode("reader");

    try{

        const devices=
        await Html5Qrcode.getCameras();

        if(!devices.length){

            showError(
                "Camera not found."
            );

            return;

        }

        let cameraId=devices[0].id;

        const back=
        devices.find(device=>{

            const label=
            device.label.toLowerCase();

            return(

                label.includes("back") ||

                label.includes("rear") ||

                label.includes("environment")

            );

        });

        if(back){

            cameraId=back.id;

        }

        await html5QrCode.start(

            cameraId,

            {

                fps:10,

                qrbox:{

                    width:260,

                    height:260

                }

            },

            onScanSuccess,

            ()=>{}

        );

        setStatus(

            "Ready to Scan",

            "#2EAF61"

        );

    }

    catch(err){

        console.error(err);

        showError(err.message);

    }

}

// ==========================================================

async function onScanSuccess(decodedText){

    if(isProcessing) return;

    isProcessing=true;

    setStatus(

        "Sending Attendance...",

        "#E8B44D"

    );

    scannerSection.style.display="none";

    showLoading(

        "Sending attendance to PSC Server..."

    );

    try{

        await html5QrCode.stop();

    }

    catch(e){}

    try{

        const response=

        await fetch(

            API_URL,

            {

                method:"POST",

                headers:{

                    "Content-Type":"text/plain;charset=utf-8"

                },

                body:JSON.stringify({

                    membershipId:decodedText

                })

            }

        );

        const data=

        await response.json();

        if(data.success){

            showSuccess(

                data.result

            );

        }

        else{

            showError(

                data.message ||

                "Unknown Error"

            );

        }

    }

    catch(err){

        console.error(err);

        showError(

            err.message

        );

    }

}

// ==========================================================

async function restartScanner(){

    result.innerHTML="";

    scannerSection.style.display="block";

    try{

        if(html5QrCode){

            await html5QrCode.clear();

        }

    }

    catch(e){}

    startScanner();

}

// ==========================================================

window.addEventListener(

    "load",

    startScanner

);

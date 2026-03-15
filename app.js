// app.js
const db = window.db; 
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const mala = document.getElementById("mala");
const japBtn = document.getElementById("japBtn");
const soundToggle = document.getElementById("soundToggle");
const bgMusicBtn = document.getElementById("bgMusicBtn");
const loginBtn = document.getElementById("loginBtn");

let userId = localStorage.getItem("userId") || "guest_" + Date.now();
let userName = localStorage.getItem("userName") || "Ram Bhakt";
let userPhoto = localStorage.getItem("userPhoto") || "";

let total = parseInt(localStorage.getItem("total")) || 0;
let today = parseInt(localStorage.getItem("today")) || 0;
let isSoundOn = true; 
let isBgMusicOn = false;
let bgAudio = new Audio("https://cdn.pixabay.com/download/audio/2022/02/10/audio_fcb640a3f6.mp3?filename=flute-111166.mp3");
bgAudio.loop = true;

// 🔐 Google Login Logic
loginBtn.addEventListener("click", () => {
    auth.signInWithPopup(provider).then((result) => {
        const user = result.user;
        userId = user.uid;
        userName = user.displayName;
        userPhoto = user.photoURL;

        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", userName);
        localStorage.setItem("userPhoto", userPhoto);
        
        updateAuthUI(user);
        saveToCloud();
        alert("Swagat hai, " + userName + "! 🙏");
    }).catch((error) => {
        console.error("Login Error: ", error);
        alert("Login nahi ho paya. Dobara koshish karein.");
    });
});

// Auth Status Check
auth.onAuthStateChanged((user) => {
    if (user) {
        userId = user.uid;
        userName = user.displayName;
        userPhoto = user.photoURL;
        updateAuthUI(user);
        fetchCloudData();
    }
});

function updateAuthUI(user) {
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("welcomeText").style.display = "block";
    document.getElementById("displayName").innerText = user.displayName;
    const photoEl = document.getElementById("userPhoto");
    photoEl.src = user.photoURL;
    photoEl.style.display = "block";
}

// ☁️ Cloud Save & Fetch
function saveToCloud() {
    db.collection("JapData").doc(userId).set({
        name: userName,
        photo: userPhoto,
        total: total,
        today: today,
        lastUpdated: new Date().toISOString()
    }, { merge: true });
}

async function fetchCloudData() {
    const doc = await db.collection("JapData").doc(userId).get();
    if (doc.exists) {
        let data = doc.data();
        if (data.total > total) {
            total = data.total; today = data.today;
            updateUI();
        }
    }
}

// 📿 Mala Beads Creation
const totalBeads = 108;
const beadsArray = [];
for (let i = 0; i < totalBeads; i++) {
    let bead = document.createElement("div");
    bead.className = "bead";
    let angle = (i * (360 / totalBeads)) - 90; 
    let x = 125 + 115 * Math.cos((angle * Math.PI) / 180);
    let y = 125 + 115 * Math.sin((angle * Math.PI) / 180);
    bead.style.left = `${x}px`; bead.style.top = `${y}px`;
    mala.appendChild(bead); beadsArray.push(bead);
}

// 🔘 Jap Click
japBtn.addEventListener("click", () => {
    total++; today++;
    localStorage.setItem("total", total); localStorage.setItem("today", today);
    if (navigator.vibrate) navigator.vibrate(50);
    if (isSoundOn) {
        let playSound = new Audio("ram.mp3");
        playSound.play().catch(()=>{});
    }
    updateUI(); saveToCloud();
});

function updateUI() {
    document.getElementById("total").innerText = total;
    document.getElementById("today").innerText = today;
    document.getElementById("totalStat").innerText = total;
    document.getElementById("todayStat").innerText = today;
    let currentBeadIndex = total % totalBeads;
    let percent = (currentBeadIndex / totalBeads) * 100;
    if (total > 0 && currentBeadIndex === 0) percent = 100;
    document.getElementById("bar").style.width = percent + "%";
    document.getElementById("malaCount").innerText = Math.floor(total / totalBeads);
    beadsArray.forEach(b => b.classList.remove("active"));
    if (total > 0) {
        let activeIndex = currentBeadIndex === 0 ? 107 : currentBeadIndex - 1;
        beadsArray[activeIndex].classList.add("active");
    }
}

// 🏆 Live Leaderboard (With Photo!)
function startLiveLeaderboard() {
    const listDiv = document.getElementById("leaderboardList");
    const globalTotalEl = document.getElementById("globalTotal");
    db.collection("JapData").orderBy("total", "desc").onSnapshot((snapshot) => {
        let html = "";
        let rank = 1;
        let mahaTotal = 0;
        snapshot.forEach((doc) => {
            let data = doc.data();
            mahaTotal += (data.total || 0);
            if(rank <= 10) {
                html += `
                    <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <b style="color: #ff9900;">#${rank}</b>
                            <img src="${data.photo || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}" style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2);">
                            <span style="font-size: 14px;">${data.name || "Ram Bhakt"}</span>
                        </div>
                        <span style="color: gold; font-weight: bold;">${data.total} 🙏</span>
                    </div>
                `;
            }
            rank++;
        });
        listDiv.innerHTML = html || "<p>Loading...</p>";
        globalTotalEl.innerText = mahaTotal.toLocaleString("en-IN") + "+";
    });
}
startLiveLeaderboard();

// 🎶 Music & Menu Logic
bgMusicBtn.onclick = () => {
    isBgMusicOn = !isBgMusicOn;
    if(isBgMusicOn) { bgAudio.play(); bgMusicBtn.style.color = "#00ff88"; }
    else { bgAudio.pause(); bgMusicBtn.style.color = "white"; }
};
soundToggle.onclick = () => {
    isSoundOn = !isSoundOn;
    soundToggle.innerHTML = isSoundOn ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
};
const menu = document.getElementById("menu");
document.getElementById("menuBtn").onclick = () => menu.classList.toggle("open");
document.querySelectorAll(".sidebar button[data-page]").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        document.getElementById(btn.dataset.page + "Page").classList.add("active");
        menu.classList.remove("open");
    }
});
document.getElementById("resetBtn").onclick = () => { if(confirm("Reset everything?")) { localStorage.clear(); location.reload(); }};
updateUI();
        

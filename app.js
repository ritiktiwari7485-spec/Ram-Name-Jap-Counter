// app.js

const db = window.db; // Config file se db mil gaya!

const mala = document.getElementById("mala");
const japBtn = document.getElementById("japBtn");
const soundToggle = document.getElementById("soundToggle");
const bgMusicBtn = document.getElementById("bgMusicBtn");

// 👤 User Setup
let userId = localStorage.getItem("userId");
let userName = localStorage.getItem("userName");

if (!userId) {
    userId = "devotee_" + Math.floor(Math.random() * 1000000000);
    localStorage.setItem("userId", userId);
}
if (!userName) {
    userName = prompt("🙏 Leaderboard ke liye apna naam darj karein:") || "Ram Bhakt";
    localStorage.setItem("userName", userName);
}

let total = parseInt(localStorage.getItem("total")) || 0;
let today = parseInt(localStorage.getItem("today")) || 0;
let isSoundOn = true; 
let isBgMusicOn = false;

// 🎶 Background Music
let bgAudio = new Audio("https://cdn.pixabay.com/download/audio/2022/02/10/audio_fcb640a3f6.mp3?filename=flute-111166.mp3");
bgAudio.loop = true;

bgMusicBtn.addEventListener("click", () => {
    isBgMusicOn = !isBgMusicOn;
    if(isBgMusicOn) {
        bgAudio.play().catch(() => alert("Music play me dikkat hui."));
        bgMusicBtn.innerHTML = '<i class="fas fa-pause-circle"></i>';
        bgMusicBtn.style.color = "#00ff88";
    } else {
        bgAudio.pause();
        bgMusicBtn.innerHTML = '<i class="fas fa-music"></i>';
        bgMusicBtn.style.color = "white";
    }
});

// ☁️ Cloud Data Fetch
db.collection("JapData").doc(userId).get().then((doc) => {
    if (doc.exists) {
        let data = doc.data();
        if (data.total > total) { 
            total = data.total; today = data.today;
            localStorage.setItem("total", total); localStorage.setItem("today", today);
            updateUI();
        }
    }
}).catch(e => console.log(e));

// 🚀 Cloud Save
let timeoutId;
function saveToCloud() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        db.collection("JapData").doc(userId).set({
            name: userName,
            total: total,
            today: today,
            lastUpdated: new Date().toISOString()
        }, { merge: true });
    }, 1500);
}

// 📿 Create Beads
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

// 🔘 Jap Button
japBtn.addEventListener("click", () => {
    total++; today++;
    localStorage.setItem("total", total); localStorage.setItem("today", today);

    if (navigator.vibrate) navigator.vibrate(50);

    if (isSoundOn) {
        let playSound = new Audio("ram.mp3"); 
        let promise = playSound.play();
        if (promise !== undefined) promise.catch(() => {}); 
    }

    if (total > 0 && total % 108 === 0) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
        alert("🔱 Badhai ho! Aapne ek Mala (108 Jap) puri kar li hai!");
    }

    updateUI(); saveToCloud();
});

// 📊 Update UI
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

// 🔊 Sound Toggle
soundToggle.addEventListener("click", () => {
    isSoundOn = !isSoundOn;
    soundToggle.innerHTML = isSoundOn ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
});

// 🏆 LIVE Leaderboard Logic
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
                    <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between;">
                        <span><b>#${rank}</b> ${data.name || "Ram Bhakt"}</span>
                        <span style="color: gold;"><b>${data.total}</b> 🙏</span>
                    </div>
                `;
            }
            rank++;
        });
        
        listDiv.innerHTML = html || "<p>Be the first devotee!</p>";
        globalTotalEl.innerText = mahaTotal.toLocaleString("en-IN") + "+";
    });
}

// 📱 Menu
const menu = document.getElementById("menu");
const menuBtn = document.getElementById("menuBtn");
menuBtn.onclick = () => menu.classList.toggle("open");
document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) menu.classList.remove("open");
});

const pages = document.querySelectorAll(".page");
document.querySelectorAll(".sidebar button[data-page]").forEach((link) => {
    link.onclick = () => {
        pages.forEach(page => page.classList.remove("active"));
        document.getElementById(link.dataset.page + "Page").classList.add("active");
        menu.classList.remove("open");
        
        if(link.dataset.page === "leaderboard") startLiveLeaderboard();
    };
});

document.getElementById("resetBtn").onclick = () => {
    if(confirm("Kya aap sach me reset karna chahte hain?")) {
        localStorage.clear(); location.reload();
    }
};

updateUI();

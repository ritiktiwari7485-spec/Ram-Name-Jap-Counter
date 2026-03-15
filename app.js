const db = window.db; 
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// App State
let userId = localStorage.getItem("userId") || "guest_" + Math.random().toString(36).substr(2, 9);
let userName = localStorage.getItem("userName") || "Ram Bhakt";
let userPhoto = localStorage.getItem("userPhoto") || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
let total = parseInt(localStorage.getItem("total")) || 0;
let today = parseInt(localStorage.getItem("today")) || 0;
let streak = parseInt(localStorage.getItem("streak")) || 1;

// Sound State
let isMuted = localStorage.getItem("isMuted") === "true";
let isBgOn = false;
const bgAudio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3");
bgAudio.loop = true;

// --- MANTRA LOGIC ---
function changeMantra(mantra, el) {
    document.querySelectorAll('.mantra-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    document.getElementById("mainTitle").innerText = mantra;
    document.getElementById("japBtn").innerText = mantra.split(' ').pop();
    if(navigator.vibrate) navigator.vibrate(30);
}

// --- JAP LOGIC ---
const mala = document.getElementById("mala");
const beads = [];
for(let i=0; i<108; i++) {
    let b = document.createElement("div");
    b.className = "bead";
    let ang = (i * (360/108)) - 90;
    b.style.left = `${140 + 125 * Math.cos(ang * Math.PI/180)}px`;
    b.style.top = `${140 + 125 * Math.sin(ang * Math.PI/180)}px`;
    mala.appendChild(b); beads.push(b);
}

document.getElementById("japBtn").onclick = () => {
    total++; today++;
    if(!isMuted) {
        new Audio("ram.mp3").play().catch(()=>{});
        if(total % 108 === 0) {
            new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3").play().catch(()=>{});
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
    }
    if(navigator.vibrate) navigator.vibrate(55);
    updateUI();
    saveToCloud();
};

function updateUI() {
    document.getElementById("total").innerText = total;
    document.getElementById("today").innerText = today;
    document.getElementById("malaCount").innerText = Math.floor(total/108);
    let curr = total % 108;
    beads.forEach((b, i) => { b.classList.remove("active"); if(i < curr) b.classList.add("active"); });

    // Badges Update
    if(total >= 108) document.getElementById("b1").classList.add("unlocked");
    if(total >= 1008) document.getElementById("b2").classList.add("unlocked");
    if(total >= 5000) document.getElementById("b3").classList.add("unlocked");
    if(total >= 10000) document.getElementById("b4").classList.add("unlocked");

    localStorage.setItem("total", total);
    localStorage.setItem("today", today);
}

// --- UI HELPERS ---
function showPage(pId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pId).classList.add('active');
    document.getElementById("menu").classList.remove("open");
}

function setTheme(t) {
    document.body.className = t === 'classic' ? '' : 'theme-' + t;
    localStorage.setItem("appTheme", t);
}

// Mute & Music Fix
document.getElementById("muteBtn").onclick = () => {
    isMuted = !isMuted;
    localStorage.setItem("isMuted", isMuted);
    document.getElementById("muteBtn").innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
};

document.getElementById("bgMusicBtn").onclick = () => {
    isBgOn = !isBgOn;
    isBgOn ? bgAudio.play() : bgAudio.pause();
    document.getElementById("bgMusicBtn").style.color = isBgOn ? "#00ff88" : "white";
    document.getElementById("menu").classList.remove("open");
};

// Menu Control
document.getElementById("menuBtn").onclick = (e) => { e.stopPropagation(); document.getElementById("menu").classList.toggle("open"); };
document.body.onclick = () => document.getElementById("menu").classList.remove("open");
document.getElementById("menu").onclick = (e) => e.stopPropagation();

// --- AUTH & FIREBASE ---
function saveToCloud() {
    db.collection("JapData").doc(userId).set({ name: userName, photo: userPhoto, total: total, today: today, lastSeen: new Date() }, {merge:true});
}

document.getElementById("loginBtn").onclick = () => {
    auth.signInWithPopup(provider).then(res => {
        localStorage.setItem("userId", res.user.uid);
        localStorage.setItem("userName", res.user.displayName);
        localStorage.setItem("userPhoto", res.user.photoURL);
        location.reload();
    });
};

document.getElementById("guestLoginBtn").onclick = () => {
    let n = document.getElementById("guestNameInput").value;
    if(n.trim()) { localStorage.setItem("userName", n); location.reload(); }
};

if(localStorage.getItem("userName")) {
    document.getElementById("loginOptions").style.display = "none";
    document.getElementById("welcomeText").style.display = "block";
    document.getElementById("displayName").innerText = userName;
    document.getElementById("userPhoto").src = userPhoto;
    document.getElementById("userPhoto").style.display = "block";
}

// Global Leaderboard
db.collection("JapData").orderBy("total", "desc").onSnapshot(snap => {
    let html = ""; let glob = 0; let rank = 1; let myR = "N/A";
    snap.forEach(doc => {
        let d = doc.data(); glob += d.total;
        if(doc.id === userId) myR = rank;
        if(rank <= 10) {
            html += `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:12px; border-radius:15px; margin-bottom:8px;">
                <div style="display:flex; align-items:center; gap:10px;"><span style="color:gold; font-weight:bold;">#${rank}</span><img src="${d.photo}" width="30" height="30" style="border-radius:50%"><span>${d.name}</span></div>
                <b>${d.total}</b>
            </div>`;
        }
        rank++;
    });
    document.getElementById("leaderboardList").innerHTML = html;
    document.getElementById("globalTotal").innerText = glob.toLocaleString();
    document.getElementById("myRankDisplay").innerText = "Your Rank: #" + myR;
});

document.getElementById("shareBtn").onclick = () => {
    const txt = `🚩 जय श्री राम! मैंने अब तक ${total} जप किये हैं। आप भी जुड़ें: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`);
};

document.getElementById("resetBtn").onclick = () => { if(confirm("Reset Everything?")) { localStorage.clear(); location.reload(); }};

setTheme(localStorage.getItem("appTheme") || 'classic');
updateUI();

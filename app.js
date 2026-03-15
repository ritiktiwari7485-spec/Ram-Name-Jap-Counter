const db = window.db; 
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

let userId = localStorage.getItem("userId") || "guest_" + Math.random().toString(36).substr(2, 9);
let userName = localStorage.getItem("userName") || "Ram Bhakt";
let total = parseInt(localStorage.getItem("total")) || 0;
let today = parseInt(localStorage.getItem("today")) || 0;
let isMuted = localStorage.getItem("isMuted") === "true";
let currentVoiceText = "राम";

// Mala Setup
const mala = document.getElementById("mala");
const beads = [];
for(let i=0; i<108; i++) {
    let b = document.createElement("div");
    b.className = "bead";
    let ang = (i * (360/108)) - 90;
    b.style.left = `${140 + 125 * Math.cos(ang * Math.PI/180)}px`;
    b.style.top = `${140 + 125 * Math.sin(ang * Math.PI/180)}px`;
    mala.appendChild(b);
    beads.push(b);
}

function speak(text) {
    if (isMuted) return;
    window.speechSynthesis.cancel();
    let msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'hi-IN';
    msg.rate = 1.3;
    window.speechSynthesis.speak(msg);
}

function updateUI() {
    document.getElementById("total").innerText = total;
    document.getElementById("today").innerText = today;
    document.getElementById("malaCount").innerText = Math.floor(total/108);
    let curr = total % 108;
    beads.forEach((b, i) => {
        b.classList.remove("active");
        if(i < curr) b.classList.add("active");
    });
    localStorage.setItem("total", total);
    localStorage.setItem("today", today);
}

// Button Events
document.getElementById("japBtn").onclick = () => {
    total++; today++;
    speak(currentVoiceText);
    if(navigator.vibrate) navigator.vibrate(50);
    if(total % 108 === 0) confetti({ particleCount: 150, spread: 70 });
    updateUI();
    db.collection("JapData").doc(userId).set({ name: userName, total: total }, {merge:true});
};

window.updateMantra = function(m, el) {
    document.querySelectorAll(".mantra-chip").forEach(c => c.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("mainTitle").innerText = m;
    currentVoiceText = m === "श्री राम" ? "राम" : (m === "ॐ नमः शिवाय" ? "नमः शिवाय" : "राधे कृष्ण");
    document.getElementById("japBtn").innerText = currentVoiceText.split(" ").pop();
};

document.getElementById("menuBtn").onclick = (e) => {
    e.stopPropagation();
    document.getElementById("menu").classList.toggle("open");
};

document.body.onclick = () => document.getElementById("menu").classList.remove("open");

document.getElementById("navCounter").onclick = () => {
    document.getElementById("counterPage").classList.add("active");
    document.getElementById("leaderboardPage").classList.remove("active");
};

document.getElementById("navLeaderboard").onclick = () => {
    document.getElementById("leaderboardPage").classList.add("active");
    document.getElementById("counterPage").classList.remove("active");
};

// Login Logic
document.getElementById("loginBtn").onclick = () => {
    auth.signInWithPopup(provider).then(res => {
        localStorage.setItem("userId", res.user.uid);
        localStorage.setItem("userName", res.user.displayName);
        location.reload();
    }).catch(err => alert("Login Error: " + err.message));
};

document.getElementById("guestLoginBtn").onclick = () => {
    let n = document.getElementById("guestNameInput").value;
    if(n.trim()) {
        localStorage.setItem("userName", n);
        location.reload();
    }
};

if(localStorage.getItem("userName") && !userId.startsWith("guest_")) {
    document.getElementById("loginOptions").style.display = "none";
    document.getElementById("welcomeText").style.display = "block";
    document.getElementById("welcomeText").innerText = "जय श्री राम, " + localStorage.getItem("userName");
}

updateUI();

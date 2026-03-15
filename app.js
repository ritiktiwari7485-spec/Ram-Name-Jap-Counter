const db = window.db; 
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

let userId = localStorage.getItem("userId") || "guest_" + Math.random().toString(36).substr(2, 9);
let userName = localStorage.getItem("userName") || "Ram Bhakt";
let total = parseInt(localStorage.getItem("total")) || 0;
let today = parseInt(localStorage.getItem("today")) || 0;
let isMuted = localStorage.getItem("isMuted") === "true";
let currentVoice = "राम";

// Mala setup
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

function speak(txt) {
    if (isMuted) return;
    window.speechSynthesis.cancel();
    let msg = new SpeechSynthesisUtterance(txt);
    msg.lang = 'hi-IN';
    msg.rate = 1.4;
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
    if(total >= 108) document.getElementById("b1").classList.add("unlocked");
    if(total >= 1008) document.getElementById("b2").classList.add("unlocked");
    if(total >= 5000) document.getElementById("b3").classList.add("unlocked");
    localStorage.setItem("total", total);
    localStorage.setItem("today", today);
}

// Menu and Page Toggles
const menu = document.getElementById("menu");
document.getElementById("menuBtn").onclick = (e) => { e.stopPropagation(); menu.classList.toggle("open"); };
document.body.onclick = () => menu.classList.remove("open");
menu.onclick = (e) => e.stopPropagation();

document.getElementById("btnCounter").onclick = () => { showPage("counterPage"); };
document.getElementById("btnLeader").onclick = () => { showPage("leaderboardPage"); };

function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    menu.classList.remove("open");
}

// Mantra Selection
document.getElementById("chip1").onclick = function() { setMantra("श्री राम", "राम", this); };
document.getElementById("chip2").onclick = function() { setMantra("ॐ नमः शिवाय", "नमः शिवाय", this); };
document.getElementById("chip3").onclick = function() { setMantra("राधे कृष्ण", "राधे कृष्ण", this); };

function setMantra(title, voice, el) {
    document.querySelectorAll(".mantra-chip").forEach(c => c.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("mainTitle").innerText = title;
    document.getElementById("japBtn").innerText = voice.split(" ").pop();
    currentVoice = voice;
}

document.getElementById("japBtn").onclick = () => {
    total++; today++;
    speak(currentVoice);
    if(navigator.vibrate) navigator.vibrate(50);
    if(total % 108 === 0) confetti({ particleCount: 150, spread: 70 });
    updateUI();
    db.collection("JapData").doc(userId).set({ name: userName, total: total }, {merge:true});
};

document.getElementById("muteBtn").onclick = () => {
    isMuted = !isMuted;
    localStorage.setItem("isMuted", isMuted);
    document.getElementById("muteBtn").innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
};

// Login Logic
document.getElementById("loginBtn").onclick = () => {
    auth.signInWithPopup(provider).then(res => {
        localStorage.setItem("userId", res.user.uid);
        localStorage.setItem("userName", res.user.displayName);
        location.reload();
    });
};

if(localStorage.getItem("userName") && !userId.startsWith("guest_")) {
    document.getElementById("loginOptions").style.display = "none";
    document.getElementById("welcomeText").style.display = "block";
    document.getElementById("welcomeText").innerText = "जय श्री राम, " + localStorage.getItem("userName");
}

updateUI();

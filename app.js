const db = window.db; 
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

let userId = localStorage.getItem("userId") || "guest_" + Math.random().toString(36).substr(2, 9);
let userName = localStorage.getItem("userName") || "Ram Bhakt";
let userPhoto = localStorage.getItem("userPhoto") || "";
let total = parseInt(localStorage.getItem("total")) || 0;
let today = parseInt(localStorage.getItem("today")) || 0;
let isMuted = localStorage.getItem("isMuted") === "true";

// --- Mala Logic ---
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

// --- Events ---
document.getElementById("japBtn").onclick = () => {
    total++; today++;
    if(!isMuted) new Audio("ram.mp3").play().catch(()=>{});
    if(total % 108 === 0) confetti({ particleCount: 150, spread: 70 });
    updateUI();
    db.collection("JapData").doc(userId).set({ name: userName, photo: userPhoto, total: total }, {merge:true});
};

function setMantra(m, el) {
    document.querySelectorAll(".mantra-chip").forEach(c => c.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("mainTitle").innerText = m;
    document.getElementById("japBtn").innerText = m.split(" ").pop();
}

document.getElementById("menuBtn").onclick = (e) => { e.stopPropagation(); document.getElementById("menu").classList.toggle("open"); };
document.body.onclick = () => document.getElementById("menu").classList.remove("open");

document.getElementById("navCounter").onclick = () => { 
    document.getElementById("counterPage").classList.add("active");
    document.getElementById("leaderboardPage").classList.remove("active");
};
document.getElementById("navLeaderboard").onclick = () => { 
    document.getElementById("leaderboardPage").classList.add("active");
    document.getElementById("counterPage").classList.remove("active");
};

// --- Auth ---
document.getElementById("loginBtn").onclick = () => {
    auth.signInWithPopup(provider).then(res => {
        localStorage.setItem("userId", res.user.uid);
        localStorage.setItem("userName", res.user.displayName);
        localStorage.setItem("userPhoto", res.user.photoURL);
        location.reload();
    });
};

updateUI();

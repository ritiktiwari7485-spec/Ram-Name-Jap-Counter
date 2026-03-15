const db = window.db; 
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

let userId = localStorage.getItem("userId") || "guest_" + Math.random().toString(36).substr(2, 9);
let userName = localStorage.getItem("userName") || "Ram Bhakt";
let userPhoto = localStorage.getItem("userPhoto") || "";
let total = parseInt(localStorage.getItem("total")) || 0;
let today = parseInt(localStorage.getItem("today")) || 0;
let isMuted = localStorage.getItem("isMuted") === "true";
let bgAudio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3");
bgAudio.loop = true;

// --- FUNCTIONS ---
function updateUI() {
    document.getElementById("total").innerText = total;
    document.getElementById("today").innerText = today;
    document.getElementById("malaCount").innerText = Math.floor(total/108);
    let curr = total % 108;
    beads.forEach((b, i) => { b.classList.remove("active"); if(i < curr) b.classList.add("active"); });
    
    if(total >= 108) document.getElementById("b1").classList.add("unlocked");
    if(total >= 1008) document.getElementById("b2").classList.add("unlocked");
    if(total >= 5000) document.getElementById("b3").classList.add("unlocked");
    
    localStorage.setItem("total", total);
    localStorage.setItem("today", today);
}

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

// --- BUTTONS ---
document.getElementById("japBtn").onclick = () => {
    total++; today++;
    if(!isMuted) new Audio("ram.mp3").play().catch(()=>{});
    if(total % 108 === 0) confetti({ particleCount: 150, spread: 70 });
    updateUI();
    db.collection("JapData").doc(userId).set({ name: userName, photo: userPhoto, total: total }, {merge:true});
};

document.getElementById("muteBtn").onclick = () => {
    isMuted = !isMuted;
    localStorage.setItem("isMuted", isMuted);
    document.getElementById("muteBtn").innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
};

document.getElementById("menuBtn").onclick = (e) => { e.stopPropagation(); document.getElementById("menu").classList.toggle("open"); };
document.body.onclick = () => document.getElementById("menu").classList.remove("open");

document.getElementById("navCounter").onclick = () => { 
    document.getElementById("counterPage").classList.add("active");
    document.getElementById("leaderboardPage").classList.remove("active");
};
document.getElementById("navLeader").onclick = () => { 
    document.getElementById("leaderboardPage").classList.add("active");
    document.getElementById("counterPage").classList.remove("active");
};

document.querySelectorAll(".mantra-chip").forEach(chip => {
    chip.onclick = () => {
        document.querySelectorAll(".mantra-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        let m = chip.getAttribute("data-m");
        document.getElementById("mainTitle").innerText = m;
        document.getElementById("japBtn").innerText = m.split(" ").pop();
    };
});

// --- AUTH ---
document.getElementById("loginBtn").onclick = () => {
    auth.signInWithPopup(provider).then(res => {
        localStorage.setItem("userId", res.user.uid);
        localStorage.setItem("userName", res.user.displayName);
        localStorage.setItem("userPhoto", res.user.photoURL);
        location.reload();
    });
};

if(localStorage.getItem("userName")) {
    document.getElementById("loginOptions").style.display = "none";
    document.getElementById("welcomeText").style.display = "block";
    document.getElementById("displayName").innerText = userName;
}

updateUI();

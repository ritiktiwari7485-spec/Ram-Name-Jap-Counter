const db = window.db; 
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

let userId = localStorage.getItem("userId") || "guest_" + Math.random().toString(36).substr(2, 9);
let userName = localStorage.getItem("userName") || "Ram Bhakt";
let userPhoto = localStorage.getItem("userPhoto") || "";
let total = parseInt(localStorage.getItem("total")) || 0;
let today = parseInt(localStorage.getItem("today")) || 0;
let isMuted = localStorage.getItem("isMuted") === "true";
let currentMantra = "राम"; // Default sound

// --- Mala beads generation ---
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

// --- Smart Voice Logic (Text to Speech) ---
function speakMantra(text) {
    if (isMuted) return;
    window.speechSynthesis.cancel(); // Purani voice roko
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Hindi voice
    utterance.rate = 1.2;     // Thoda fast taki jap natural lage
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
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
    
    // Badges unlocking logic
    if(total >= 108) document.getElementById("b1").classList.add("unlocked");
    if(total >= 1008) document.getElementById("b2").classList.add("unlocked");
    if(total >= 5000) document.getElementById("b3").classList.add("unlocked");
    
    localStorage.setItem("total", total);
    localStorage.setItem("today", today);
}

// --- Click Event ---
document.getElementById("japBtn").onclick = () => {
    total++; today++;
    
    // Smart Sound
    speakMantra(currentMantra);
    
    if(navigator.vibrate) navigator.vibrate(50);
    if(total % 108 === 0) {
        confetti({ particleCount: 150, spread: 70 });
        // Temple Bell on completion
        let bell = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3");
        if(!isMuted) bell.play().catch(()=>{});
    }
    updateUI();
    db.collection("JapData").doc(userId).set({ name: userName, photo: userPhoto, total: total }, {merge:true});
};

// --- Mantra Selector Logic ---
window.setMantra = function(m, el) {
    document.querySelectorAll(".mantra-chip").forEach(c => c.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("mainTitle").innerText = m;
    
    // Yahan hum voice ke liye mantra set kar rahe hain
    if(m === "श्री राम") currentMantra = "राम";
    else if(m === "ॐ नमः शिवाय") currentMantra = "नमः शिवाय";
    else if(m === "राधे कृष्ण") currentMantra = "राधे कृष्ण";
    
    document.getElementById("japBtn").innerText = currentMantra.split(" ").pop();
};

// --- Other Buttons ---
document.getElementById("muteBtn").onclick = () => {
    isMuted = !isMuted;
    localStorage.setItem("isMuted", isMuted);
    document.getElementById("muteBtn").innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
};

document.getElementById("menuBtn").onclick = (e) => { 
    e.stopPropagation(); 
    document.getElementById("menu").classList.toggle("open"); 
};

document.body.onclick = () => document.getElementById("menu").classList.remove("open");

// Initial Load
updateUI();

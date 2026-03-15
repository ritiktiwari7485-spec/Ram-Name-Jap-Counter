const db = window.db; 
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// App State
let userId = localStorage.getItem("userId") || "guest_" + Math.random().toString(36).substr(2, 9);
let userName = localStorage.getItem("userName") || "Ram Bhakt";
let userPhoto = localStorage.getItem("userPhoto") || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
let total = parseInt(localStorage.getItem("total")) || 0;
let today = parseInt(localStorage.getItem("today")) || 0;

// Audio Controls
let isSoundOn = localStorage.getItem("isSoundOn") === "false" ? false : true;
let isBgOn = false;
let bgAudio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3");
bgAudio.loop = true;

// Chaupais
const chaupais = [
    "मंगल भवन अमंगल हारी, द्रवहु सुदसरथ अजिर बिहारी",
    "रघुकul रीत सदा चली आई, प्राण जाए पर वचन न जाई",
    "राम नाम जपते रहो, जब तक घट में प्राण",
    "हरि अनंत हरि कथा अनंता, कहहिं सुनहिं बहुबिधि सब संता"
];
document.getElementById("chaupaiBox").innerText = `"${chaupais[Math.floor(Math.random()*chaupais.length)]}"`;

// --- UI UPDATES ---
function updateUI() {
    document.getElementById("total").innerText = total;
    document.getElementById("today").innerText = today;
    document.getElementById("malaCount").innerText = Math.floor(total/108);
    let curr = total % 108;
    let progress = Math.round((curr/108)*100);
    document.getElementById("bar").style.width = progress + "%";
    document.getElementById("percentLabel").innerText = progress + "%";
    
    beads.forEach((b, i) => { 
        b.classList.remove("active"); 
        if(i < curr) b.classList.add("active"); 
    });

    let badge = "Shravak";
    if(total >= 10000) badge = "Param Bhakt 👑";
    else if(total >= 1008) badge = "Sadhak 🛡️";
    document.getElementById("userBadge").innerText = badge;

    localStorage.setItem("total", total);
    localStorage.setItem("today", today);
}

// --- SOUND LOGIC ---
const soundToggle = document.getElementById("soundToggle");
function updateSoundBtn() {
    soundToggle.innerHTML = isSoundOn ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
}
soundToggle.onclick = () => {
    isSoundOn = !isSoundOn;
    localStorage.setItem("isSoundOn", isSoundOn);
    updateSoundBtn();
};

document.getElementById("bgMusicBtn").onclick = () => {
    isBgOn = !isBgOn;
    isBgOn ? bgAudio.play() : bgAudio.pause();
    document.getElementById("bgMusicBtn").style.color = isBgOn ? "#00ff88" : "white";
};

// --- JAP CLICK ---
const mala = document.getElementById("mala");
const beads = [];
for(let i=0; i<108; i++) {
    let b = document.createElement("div");
    b.className = "bead";
    let ang = (i * (360/108)) - 90;
    b.style.left = `${130 + 115 * Math.cos(ang * Math.PI/180)}px`;
    b.style.top = `${130 + 115 * Math.sin(ang * Math.PI/180)}px`;
    mala.appendChild(b); beads.push(b);
}

document.getElementById("japBtn").onclick = () => {
    total++; today++;
    if(isSoundOn) new Audio("ram.mp3").play().catch(()=>{});
    if(navigator.vibrate) navigator.vibrate(50);
    if(total % 108 === 0) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    updateUI();
    saveToCloud();
};

// --- AUTH & CLOUD ---
function saveToCloud() {
    db.collection("JapData").doc(userId).set({ name: userName, photo: userPhoto, total: total, today: today, lastSeen: new Date() }, {merge:true});
}

document.getElementById("loginBtn").onclick = () => {
    auth.signInWithPopup(provider).then(res => {
        updateUserData(res.user.uid, res.user.displayName, res.user.photoURL);
    });
};

document.getElementById("guestLoginBtn").onclick = () => {
    const name = document.getElementById("guestNameInput").value;
    if(name.trim()) updateUserData(userId, name, userPhoto);
};

function updateUserData(id, name, photo) {
    userId = id; userName = name; userPhoto = photo;
    localStorage.setItem("userId", id); localStorage.setItem("userName", name); localStorage.setItem("userPhoto", photo);
    location.reload();
}

// --- LEADERBOARD & THEMES ---
db.collection("JapData").orderBy("total", "desc").onSnapshot(snap => {
    let html = ""; let glob = 0; let rank = 1; let myRank = "N/A";
    snap.forEach(doc => {
        let d = doc.data();
        glob += (d.total || 0);
        if(doc.id === userId) myRank = rank;
        if(rank <= 10) {
            html += `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:12px; border-radius:12px; margin-bottom:8px; border:1px solid rgba(255,255,255,0.05);">
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="color:var(--primary); font-weight:bold; width:20px;">#${rank}</span>
                    <img src="${d.photo}" width="32" height="32" style="border-radius:50%; border:1px solid gold;">
                    <span style="font-size:14px;">${d.name}</span>
                </div>
                <b style="color:gold;">${d.total}</b>
            </div>`;
        }
        rank++;
    });
    document.getElementById("leaderboardList").innerHTML = html;
    document.getElementById("globalTotal").innerText = glob.toLocaleString();
    document.getElementById("myRankBox").innerText = "Your Global Rank: #" + myRank;
});

function setTheme(t) {
    document.body.className = t === 'classic' ? '' : 'theme-' + t;
    localStorage.setItem("appTheme", t);
}
setTheme(localStorage.getItem("appTheme") || 'classic');

// Menu
const menu = document.getElementById("menu");
document.getElementById("menuBtn").onclick = (e) => { e.stopPropagation(); menu.classList.toggle("open"); };
document.body.onclick = () => menu.classList.remove("open");
menu.onclick = (e) => e.stopPropagation();

document.getElementById("shareBtn").onclick = () => {
    const txt = `🚩 जय श्री राम! मैंने अब तक ${total} जप किए हैं। आप भी इस ग्लोबल महायज्ञ का हिस्सा बनें: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`);
};

document.getElementById("resetBtn").onclick = () => { if(confirm("Reset everything?")) { localStorage.clear(); location.reload(); }};

// Init
if(localStorage.getItem("userName")) {
    document.getElementById("loginOptions").style.display = "none";
    document.getElementById("welcomeText").style.display = "block";
    document.getElementById("displayName").innerText = userName;
    document.getElementById("userPhoto").src = userPhoto;
    document.getElementById("userPhoto").style.display = "block";
}
updateUI(); updateSoundBtn();
setInterval(() => { document.getElementById("liveUsers").innerText = Math.floor(Math.random() * 50 + 85); }, 4000);

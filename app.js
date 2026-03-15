const db = window.db; 
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// State
let userId = localStorage.getItem("userId") || "guest_" + Math.random().toString(36).substr(2, 9);
let userName = localStorage.getItem("userName") || "Ram Bhakt";
let userPhoto = localStorage.getItem("userPhoto") || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
let total = parseInt(localStorage.getItem("total")) || 0;
let today = parseInt(localStorage.getItem("today")) || 0;

// Chaupais
const chaupais = [
    "मंगल भवन अमंगल हारी, द्रवहु सुदसरथ अजिर बिहारी",
    "रघुकुल रीत सदा चली आई, प्राण जाए पर वचन न जाई",
    "हरि अनंत हरि कथा अनंता, कहहिं सुनहिं बहुबिधि सब संता",
    "जाकी रही भावना जैसी, प्रभु मूरत देखी तिन तैसी"
];
document.getElementById("chaupaiBox").innerText = `"${chaupais[Math.floor(Math.random()*chaupais.length)]}"`;

// Music Fix
let bgAudio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3");
bgAudio.loop = true;
let isBgOn = false;

document.getElementById("bgMusicBtn").onclick = () => {
    isBgOn = !isBgOn;
    isBgOn ? bgAudio.play() : bgAudio.pause();
    document.getElementById("bgMusicBtn").style.color = isBgOn ? "#00ff88" : "white";
};

// Login Logic
document.getElementById("loginBtn").onclick = () => {
    auth.signInWithPopup(provider).then(res => updateUserData(res.user.uid, res.user.displayName, res.user.photoURL));
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

// Themes
function setTheme(t) {
    document.body.className = t === 'classic' ? '' : 'theme-' + t;
    localStorage.setItem("appTheme", t);
}
setTheme(localStorage.getItem("appTheme") || 'classic');

// Jap Logic
const mala = document.getElementById("mala");
const beads = [];
for(let i=0; i<108; i++) {
    let b = document.createElement("div");
    b.className = "bead";
    let ang = (i * (360/108)) - 90;
    b.style.left = `${125 + 115 * Math.cos(ang * Math.PI/180)}px`;
    b.style.top = `${125 + 115 * Math.sin(ang * Math.PI/180)}px`;
    mala.appendChild(b); beads.push(b);
}

document.getElementById("japBtn").onclick = () => {
    total++; today++;
    new Audio("ram.mp3").play().catch(()=>{});
    if(navigator.vibrate) navigator.vibrate(50);
    if(total % 108 === 0) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    updateUI(); saveToCloud();
};

function updateUI() {
    document.getElementById("total").innerText = total;
    document.getElementById("today").innerText = today;
    document.getElementById("malaCount").innerText = Math.floor(total/108);
    let curr = total % 108;
    document.getElementById("bar").style.width = (curr/108)*100 + "%";
    beads.forEach((b, i) => { b.classList.remove("active"); if(i < curr) b.classList.add("active"); });
    
    // Badge Logic
    let badge = "Shravak";
    if(total > 10000) badge = "Param Bhakt";
    else if(total > 1000) badge = "Sadhak";
    document.getElementById("userBadge").innerText = badge;
    
    localStorage.setItem("total", total); localStorage.setItem("today", today);
}

function saveToCloud() {
    db.collection("JapData").doc(userId).set({ name: userName, photo: userPhoto, total: total, today: today }, {merge:true});
}

// Leaderboard & Global
db.collection("JapData").orderBy("total", "desc").limit(10).onSnapshot(snap => {
    let html = ""; let glob = 0;
    snap.forEach(doc => {
        let d = doc.data();
        html += `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:10px; border-radius:10px; margin-bottom:5px;">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${d.photo}" width="30" height="30" style="border-radius:50%">
                <span style="font-size:14px;">${d.name}</span>
            </div>
            <b style="color:gold;">${d.total}</b>
        </div>`;
    });
    document.getElementById("leaderboardList").innerHTML = html;
});

db.collection("JapData").onSnapshot(snap => {
    let glob = 0; snap.forEach(doc => glob += (doc.data().total || 0));
    document.getElementById("globalTotal").innerText = glob.toLocaleString();
});

// Menu Toggle
const menu = document.getElementById("menu");
document.getElementById("menuBtn").onclick = (e) => { e.stopPropagation(); menu.classList.toggle("open"); };
document.body.onclick = () => menu.classList.remove("open");
menu.onclick = (e) => e.stopPropagation();

document.getElementById("shareBtn").onclick = () => {
    const txt = `🚩 जय श्री राम! मैंने अब तक ${total} जप किए हैं। आप भी इस ग्लोबल महायज्ञ का हिस्सा बनें: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`);
};

document.getElementById("resetBtn").onclick = () => { if(confirm("Reset everything?")) { localStorage.clear(); location.reload(); }};

if(localStorage.getItem("userName")) {
    document.getElementById("loginOptions").style.display = "none";
    document.getElementById("welcomeText").style.display = "block";
    document.getElementById("displayName").innerText = userName;
    document.getElementById("userPhoto").src = userPhoto;
    document.getElementById("userPhoto").style.display = "block";
}
updateUI();
setInterval(() => { document.getElementById("liveUsers").innerText = Math.floor(Math.random() * 50 + 100); }, 5000);

const db = window.db;
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

let uId = localStorage.getItem("uId") || "guest_" + Math.random().toString(36).substr(2, 9);
let uName = localStorage.getItem("uName") || "Ram Bhakt";
let total = parseInt(localStorage.getItem("total")) || 0;
let today = parseInt(localStorage.getItem("today")) || 0;
let isMuted = false;
let curV = "राम";

// Mala setup
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

function upUI() {
    document.getElementById("tl").innerText = total;
    document.getElementById("td").innerText = today;
    document.getElementById("mc").innerText = Math.floor(total/108);
    let curr = total % 108;
    beads.forEach((b, i) => { b.classList.remove("active"); if(i < curr) b.classList.add("active"); });
    
    // Achievements
    if(total >= 108) document.getElementById("b1").classList.add("unlocked");
    if(total >= 1008) document.getElementById("b2").classList.add("unlocked");
    if(total >= 5000) document.getElementById("b3").classList.add("unlocked");
    
    localStorage.setItem("total", total);
}

document.getElementById("jBtn").onclick = () => {
    total++; today++;
    if(!isMuted) {
        window.speechSynthesis.cancel();
        let u = new SpeechSynthesisUtterance(curV);
        u.lang = 'hi-IN'; u.rate = 1.6;
        window.speechSynthesis.speak(u);
    }
    if(total % 108 === 0) confetti();
    upUI();
    db.collection("JapData").doc(uId).set({ name: uName, total: total }, {merge:true});
};

window.stM = (m, v, el) => {
    document.querySelectorAll(".mantra-chip").forEach(c => c.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("mTitle").innerText = m;
    document.getElementById("jBtn").innerText = v.split(" ").pop();
    curV = v;
};

// Menu & Pages
document.getElementById("mBtn").onclick = (e) => { e.stopPropagation(); document.getElementById("side").classList.add("open"); };
document.body.onclick = () => document.getElementById("side").classList.remove("open");
document.getElementById("side").onclick = (e) => e.stopPropagation();

document.getElementById("goCounter").onclick = () => { pg("counterPage"); };
document.getElementById("goLeader").onclick = () => { pg("leaderboardPage"); };

function pg(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    document.getElementById("side").classList.remove("open");
}

// Login
document.getElementById("loginBtn").onclick = () => {
    auth.signInWithPopup(provider).then(res => {
        uId = res.user.uid; uName = res.user.displayName;
        localStorage.setItem("uId", uId); localStorage.setItem("uName", uName);
        location.reload();
    });
};
document.getElementById("gLoginBtn").onclick = () => {
    let name = document.getElementById("gName").value;
    if(name.trim()) { localStorage.setItem("uName", name); location.reload(); }
};

// Leaderboard
db.collection("JapData").orderBy("total", "desc").limit(10).onSnapshot(snap => {
    let html = "";
    snap.forEach(doc => {
        let d = doc.data();
        html += `<div class="leader-item"><span>${d.name}</span><b>${d.total}</b></div>`;
    });
    document.getElementById("lList").innerHTML = html;
});

if(localStorage.getItem("uName")) {
    document.getElementById("authBox").style.display = "none";
    document.getElementById("wMsg").style.display = "block";
    document.getElementById("wMsg").innerText = "जय श्री राम, " + uName;
}

upUI();

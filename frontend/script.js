const API = "http://127.0.0.1:8000/api";
let confessionCache = [];
let chart;

/* ===== TEXT COUNTER ===== */
const textArea = document.getElementById("text");
const countEl = document.getElementById("count");

textArea.addEventListener("input", () => {
  countEl.innerText = `${textArea.value.length} / 1000`;
});

/* ===== POST ===== */
function postConfession() {
  const text = textArea.value.trim();
  if (!text) return alert("Write something");

  fetch(`${API}/confessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  }).then(() => {
    textArea.value = "";
    countEl.innerText = "0 / 1000";
    loadConfessions();
  });
}

/* ===== LOAD ===== */
function loadConfessions() {
  const wall = document.getElementById("wall");
  wall.innerHTML = "";

  const skel = document.getElementById("skeleton");
  for (let i = 0; i < 3; i++) wall.append(skel.content.cloneNode(true));

  fetch(`${API}/confessions`)
    .then(res => res.json())
    .then(data => {
      confessionCache = data;
      render();
    });
}

/* ===== RENDER ===== */
function render() {
  const wall = document.getElementById("wall");
  wall.innerHTML = "";

  confessionCache.forEach(c => {
    const total = c.reactions.like + c.reactions.love + c.reactions.sad;
    const trending = total >= 5 ? `<span class="trending">🔥 TRENDING</span>` : "";

    wall.innerHTML += `
      <div class="confession">
        <p>${c.text}</p>
        <div class="meta">
          ${trending}
          <div class="reactions">
            <button onclick="react('${c._id}','like')">👍 ${c.reactions.like}</button>
            <button onclick="react('${c._id}','love')">❤️ ${c.reactions.love}</button>
            <button onclick="react('${c._id}','sad')">😢 ${c.reactions.sad}</button>
            <button onclick="openAnalytics('${c._id}')">📊</button>
          </div>
        </div>
      </div>
    `;
  });
}

/* ===== REACT (NO BLINK) ===== */
function react(id, type) {
  const c = confessionCache.find(x => x._id === id);
  if (!c) return;

  c.reactions[type]++;
  render();

  fetch(`${API}/confessions/${id}/react`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reaction: type })
  }).catch(() => {
    c.reactions[type]--;
    render();
  });
}

/* ===== ANALYTICS ===== */
function openAnalytics(id) {
  document.getElementById("analyticsModal").classList.remove("hidden");

  const c = confessionCache.find(x => x._id === id);
  if (!c) return;

  const ctx = document.getElementById("reactionChart");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Like", "Love", "Sad"],
      datasets: [{
        data: [c.reactions.like, c.reactions.love, c.reactions.sad],
        backgroundColor: ["#60a5fa", "#f472b6", "#facc15"]
      }]
    },
    options: {
      plugins: { legend: { position: "bottom" } }
    }
  });
}

function closeModal() {
  document.getElementById("analyticsModal").classList.add("hidden");
}

/* ===== THEME TOGGLE ===== */
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") root.setAttribute("data-theme", "light");

function toggleTheme() {
  if (root.getAttribute("data-theme") === "light") {
    root.removeAttribute("data-theme");
    localStorage.setItem("theme", "dark");
  } else {
    root.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }
}

loadConfessions();

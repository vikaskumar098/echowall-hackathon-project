const textArea = document.getElementById("text");
const counter = document.getElementById("count");

const positiveWords = ["happy","good","love","success","excited","proud"];
const negativeWords = ["sad","depressed","stress","cry","hate","fail"];

let chart;

textArea.addEventListener("input", () => {
  counter.innerText = `${textArea.value.length} / 1000`;
});

function getSentiment(text) {
  let score = 0;
  const t = text.toLowerCase();
  positiveWords.forEach(w => { if (t.includes(w)) score++; });
  negativeWords.forEach(w => { if (t.includes(w)) score--; });
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

function postConfession() {
  const text = textArea.value.trim();
  if (!text) return;

  fetch("/api/confessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  }).then(() => {
    textArea.value = "";
    counter.innerText = "0 / 1000";
    loadConfessions();
  });
}

function react(id, type) {
  fetch(`/api/confessions/${id}/react`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reaction: type })
  }).then(() => loadConfessions());
}

function loadConfessions() {
  const q = document.getElementById("search").value.toLowerCase();

  fetch("/api/confessions")
    .then(res => res.json())
    .then(data => {
      const wall = document.getElementById("wall");
      wall.innerHTML = "";

      let likes = 0, loves = 0, sads = 0;

      data
        .filter(c => c.text.toLowerCase().includes(q))
        .forEach(c => {
          const sentiment = getSentiment(c.text);
          const total = c.reactions.like + c.reactions.love + c.reactions.sad;

          likes += c.reactions.like;
          loves += c.reactions.love;
          sads += c.reactions.sad;

          wall.innerHTML += `
            <div class="confession ${sentiment}">
              <p>${c.text}</p>
              <div class="meta">
                <div class="reactions">
                  <button onclick="react('${c._id}','like')">👍 ${c.reactions.like}</button>
                  <button onclick="react('${c._id}','love')">❤️ ${c.reactions.love}</button>
                  <button onclick="react('${c._id}','sad')">😢 ${c.reactions.sad}</button>
                </div>
                ${total >= 5 ? `<span class="trending">TRENDING</span>` : ``}
              </div>
            </div>
          `;
        });

      updateChart(likes, loves, sads);
    });
}

function updateChart(likes, loves, sads) {
  const ctx = document.getElementById("trendChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["👍 Like", "❤️ Love", "😢 Sad"],
      datasets: [{
        data: [likes, loves, sads]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

loadConfessions();

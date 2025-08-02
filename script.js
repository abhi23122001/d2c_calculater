// 🌐 Static Crop Data
const crops = [
  { name_en: "Wheat", name_hi: "गेहूं", seed: 300, fertilizer: 300, labor: 400, irrigation: 200 },
  { name_en: "Rice", name_hi: "चावल", seed: 100, fertilizer: 1200, labor: 400, irrigation: 1000 },
  { name_en: "Potato", name_hi: "आलू", seed: 1300, fertilizer: 600, labor: 800, irrigation: 300 },
  { name_en: "Tomato", name_hi: "टमाटर", seed: 300, fertilizer: 950, labor: 800, irrigation: 200 },
  { name_en: "Banana", name_hi: "केला", seed: 500, fertilizer: 400, labor: 500, irrigation: 200 },
  { name_en: "Mango", name_hi: "आम", seed: 400, fertilizer: 200, labor: 700, irrigation: 500 },
  { name_en: "Onion", name_hi: "प्याज़", seed: 100, fertilizer: 900, labor: 700, irrigation: 100 },
  { name_en: "Pomegranate", name_hi: "अनार", seed: 300, fertilizer: 300, labor: 2700, irrigation: 100 }
];

// 🌗 Theme & Language
const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const langToggle = document.getElementById("languageToggle");
let isHindi = false;

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
});

langToggle.addEventListener("click", () => {
  isHindi = !isHindi;
  renderLanguage();
  populateCrops();
});

function renderLanguage() {
  document.getElementById("title").textContent = isHindi ? "🌾 कृषि लागत कैलकुलेटर" : "🌾 Krishi Cost Calculator";
  document.getElementById("labelCrop").textContent = isHindi ? "फ़सल चुनें" : "Select Crop";
  document.getElementById("labelLand").textContent = isHindi ? `भूमि क्षेत्र (एकड़): ` : `Land Area (Acres): `;
  document.getElementById("calculateBtn").textContent = isHindi ? "लागत निकालें" : "Calculate Cost";
  document.getElementById("labelMandi").textContent = isHindi ? "अनुमानित मंडी दर (₹ प्रति एकड़):" : "Estimated Mandi Rate (₹ per acre)";
  document.getElementById("exportPDF").textContent = isHindi ? "📤 पीडीएफ निर्यात" : "📤 Export PDF";
  document.getElementById("copyChart").textContent = isHindi ? "📋 चार्ट कॉपी करें" : "📋 Copy Chart";
  document.getElementById("downloadChart").textContent = isHindi ? "⬇️ चार्ट डाउनलोड करें" : "⬇️ Download Chart";
  document.getElementById("printChart").textContent = isHindi ? "🖨️ प्रिंट करें" : "🖨️ Print Chart";
}

// 🌾 Crop Dropdown
const cropSelect = document.getElementById("cropSelect");
function populateCrops() {
  cropSelect.innerHTML = `<option disabled selected>${isHindi ? "फ़सल लोड हो रही है..." : "Loading crops..."}</option>`;
  crops.forEach((crop, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = isHindi ? crop.name_hi : crop.name_en;
    cropSelect.appendChild(opt);
  });
}
populateCrops();

// 🔢 Calculate Logic
const landRange = document.getElementById("landRange");
const landValue = document.getElementById("landValue");
landRange.addEventListener("input", () => {
  landValue.textContent = landRange.value;
});

const calculateBtn = document.getElementById("calculateBtn");
const costOutput = document.getElementById("costOutput");
const mandiRateInput = document.getElementById("mandiRate");
const profitOutput = document.getElementById("profitOutput");

let chartInstance = null;

calculateBtn.addEventListener("click", () => {
  const cropIndex = cropSelect.value;
  if (cropIndex === "") return alert(isHindi ? "कृपया एक फ़सल चुनें।" : "Please select a crop.");

  const crop = crops[cropIndex];
  const area = parseInt(landRange.value);

  const seedCost = crop.seed * area;
  const fertCost = crop.fertilizer * area;
  const laborCost = crop.labor * area;
  const irrigCost = crop.irrigation * area;
  const total = seedCost + fertCost + laborCost + irrigCost;

  costOutput.innerHTML = isHindi
    ? `कुल लागत: ₹${total.toLocaleString()}`
    : `Total Cost: ₹${total.toLocaleString()}`;

  // Profit Calculation
  const mandiRate = parseFloat(mandiRateInput.value || 0);
  const totalRevenue = mandiRate * area;
  const profit = totalRevenue - total;

  profitOutput.innerHTML = isHindi
    ? `लाभ: ₹${profit.toLocaleString()} (${profit >= 0 ? "मुनाफ़ा" : "नुक़सान"})`
    : `Profit: ₹${profit.toLocaleString()} (${profit >= 0 ? "Gain" : "Loss"})`;

  // Chart
  renderChart(seedCost, fertCost, laborCost, irrigCost);
});

// 📊 Chart
function renderChart(seed, fert, labor, irrig) {
  const ctx = document.getElementById("costChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: isHindi ? ["बीज", "उर्वरक", "श्रम", "सिंचाई"] : ["Seeds", "Fertilizer", "Labor", "Irrigation"],
      datasets: [{
        label: isHindi ? "लागत (₹)" : "Cost (₹)",
        data: [seed, fert, labor, irrig],
        backgroundColor: ["#00796b", "#00838f", "#0288d1", "#0097a7"],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `₹${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: val => `₹${val}`
          }
        }
      }
    }
  });
}

// 📤 Export PDF
document.getElementById("exportPDF").addEventListener("click", () => {
  const card = document.querySelector(".calculator-card");
  html2canvas(card).then(canvas => {
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(img, "PNG", 10, 10, 190, 0);
    pdf.save("krishi-cost.pdf");
  });
});

// 📋 Copy Chart
document.getElementById("copyChart").addEventListener("click", () => {
  const canvas = document.getElementById("costChart");
  canvas.toBlob(blob => {
    const item = new ClipboardItem({ "image/png": blob });
    navigator.clipboard.write([item]);
    alert(isHindi ? "चार्ट कॉपी हो गया!" : "Chart copied!");
  });
});

// ⬇️ Download Chart
document.getElementById("downloadChart").addEventListener("click", () => {
  const canvas = document.getElementById("costChart");
  const link = document.createElement("a");
  link.download = "chart.png";
  link.href = canvas.toDataURL();
  link.click();
});

// 🖨️ Print Chart
document.getElementById("printChart").addEventListener("click", () => {
  const win = window.open();
  const canvas = document.getElementById("costChart");
  const imgData = canvas.toDataURL("image/png");
  win.document.write(`<img src="${imgData}" onload="window.print();window.close()">`);
});

const canvas = document.getElementById("background-particles");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const particles = [];

for (let i = 0; i < 150; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 2 + Math.random() * 3,
    speedX: (Math.random() - 0.5) * 0.8,
    speedY: (Math.random() - 0.5) * 0.8,
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let p of particles) {
    ctx.fillStyle = "#90caf9";
    ctx.fillRect(p.x, p.y, p.size, p.size);

    p.x += p.speedX;
    p.y += p.speedY;

    // Reverse direction at edges
    if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
    if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

// main.js - Homework 3: Letter Frequency Distribution
document.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("textInput");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const chartContainer = document.getElementById("chartContainer");
  const ctx = document.getElementById("letterChart").getContext("2d");

  const defaultExample = `In cybersecurity, understanding frequency distributions of characters can help with simple cryptanalysis, input sanitization checks, and data profiling.`;

  if (!textInput.value.trim()) textInput.value = defaultExample;

  // === Compute frequencies ===
  function computeLetterFrequency(text) {
    const counts = {};
    for (let char of text.toLowerCase()) {
      if (char >= 'a' && char <= 'z') counts[char] = (counts[char] || 0) + 1;
    }
    return counts;
  }

  // === Render chart safely ===
  function renderChart(counts) {
    const labels = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
    const data = labels.map(l => counts[l] || 0);

    // Destroy previous chart
    if (window.letterChart instanceof Chart) {
      window.letterChart.destroy();
    }

    // Create a new one
    window.letterChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Frequency",
          data,
          backgroundColor: "rgba(11,105,255,0.6)",
          borderColor: "rgba(11,105,255,1)",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // <-- allows control via CSS height
        plugins: {
          legend: { display: false },
          title: { display: true, text: "Letter Frequency Distribution (a–z)" }
        },
        scales: {
          x: {
            title: { display: true, text: "Letters" },
            ticks: { autoSkip: false, maxRotation: 0, minRotation: 0 }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Count" }
          }
        }
      }
    });
  }

  function analyzeAndRender() {
    const text = textInput.value || "";
    const counts = computeLetterFrequency(text);
    renderChart(counts);
  }

  analyzeBtn.addEventListener("click", analyzeAndRender);
  analyzeAndRender();
});


  /* === Section 3: Caesar Cipher === */
  const shiftInput = document.getElementById("shiftSelect");
  const encryptBtn = document.getElementById("encryptBtn");
  const encryptedOutput = document.getElementById("encryptedOutput");

  // Funzione per cifrare il testo con Cifrario di Cesare
  function caesarEncrypt(text, shift) {
    let result = "";
    for (let char of text) {
      const code = char.charCodeAt(0);

      // lettere maiuscole
      if (code >= 65 && code <= 90) {
        result += String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      // lettere minuscole
      else if (code >= 97 && code <= 122) {
        result += String.fromCharCode(((code - 97 + shift) % 26) + 97);
      } else {
        result += char; // lascia inalterati simboli e spazi
      }
    }
    return result;
  }

  function handleEncryption() {
    const shift = parseInt(shiftInput.value) || 0;
    const text = textInput.value.trim();
    if (!text) {
      encryptedOutput.innerHTML = "<em>Please enter text to encrypt.</em>";
      return;
    }
    const encrypted = caesarEncrypt(text, shift);
    encryptedOutput.textContent = encrypted;
  }

  encryptBtn && encryptBtn.addEventListener("click", handleEncryption);


  /* === Section 4: Brute-Force Decryption === */
  const bruteBtn = document.getElementById("bruteforceBtn");
  const bruteResults = document.getElementById("bruteResults");

  function caesarDecrypt(text, shift) {
    // inverso della cifratura: shift negativo
    return caesarEncrypt(text, 26 - (shift % 26));
  }

  function runBruteForce() {
    if (!bruteResults || !textInput) return;
    const encryptedText = encryptedOutput ? encryptedOutput.textContent.trim() : "";
    const sourceText = encryptedText || textInput.value.trim();

    if (!sourceText) {
      bruteResults.innerHTML = "<em>Please encrypt or enter text to brute-force.</em>";
      return;
    }

    let output = "<strong>Brute-force attempts (shift 1–25):</strong><br/><br/>";
    for (let s = 1; s <= 25; s++) {
      const guess = caesarDecrypt(sourceText, s);
      output += `<div style="margin-bottom:0.6rem;">
                   <strong>Shift ${s}:</strong> <span style="color:var(--primary-blue);">${guess}</span>
                 </div>`;
    }
    bruteResults.innerHTML = output;
  }

  bruteBtn && bruteBtn.addEventListener("click", runBruteForce);

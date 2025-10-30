// --- Number theory helpers (RSA) ---
function gcd(a, b) { while (b !== 0) [a, b] = [b, a % b]; return Math.abs(a); }
function egcd(a, b) {
  let x = 0, lastX = 1, y = 1, lastY = 0;
  while (b !== 0) { const q = Math.floor(a / b); [a, b] = [b, a % b]; [x, lastX] = [lastX - q * x, x]; [y, lastY] = [lastY - q * y, y]; }
  return { g: a, x: lastX, y: lastY };
}
function modInverse(e, phi) { const { g, x } = egcd(e, phi); if (g !== 1) throw new Error("e is not invertible modulo phi"); return ((x % phi) + phi) % phi; }
function modPow(base, exp, mod) {
  let res = 1; base %= mod;
  while (exp > 0) { if (exp & 1) res = (res * base) % mod; base = (base * base) % mod; exp >>= 1; }
  return res;
}
function isPrime(n) { if (n < 2) return false; if (n % 2 === 0) return n === 2; for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false; return true; }
function randomPrime(min, max) {
  let p; do { p = Math.floor(Math.random() * (max - min + 1)) + min; if (p % 2 === 0) p += 1; } while (!isPrime(p) || p < min || p > max);
  return p;
}
function chooseE(phi) {
  const candidates = [3, 5, 17, 257];
  for (const c of candidates) if (c < phi && gcd(c, phi) === 1) return c;
  for (let e = 3; e < phi; e += 2) if (gcd(e, phi) === 1) return e;
  throw new Error("No valid e found");
}

// --- RSA alphabet mapping (A-Z + space) ---
const CHAR_A = 65, MAP_SPACE = 26;
function normalizeAZSpace(s) { return s.toUpperCase().replace(/[^A-Z ]+/g, " ").replace(/\s+/g, " ").trim(); }
function letterToNum(ch) { return ch === " " ? MAP_SPACE : ch.charCodeAt(0) - CHAR_A; }
function numToLetter(n) { if (n === MAP_SPACE) return " "; if (n >= 0 && n <= 25) return String.fromCharCode(n + CHAR_A); return "?"; }
function encryptLetters(text, e, n) {
  const nums = Array.from(normalizeAZSpace(text)).map(letterToNum);
  return nums.map(m => modPow(m, e, n)).join(" ");
}
function decryptNumbers(cipher, d, n) {
  const nums = cipher.trim().split(/\s+/).filter(Boolean).map(x => parseInt(x, 10)).filter(v => Number.isInteger(v));
  return nums.map(c => modPow(c, d, n)).map(numToLetter).join("");
}

// --- Key generation (ensure n >= 29 for 27 symbols) ---
function generateKeys() {
  const MIN_PQ = 7, MAX_PQ = 97;
  let p, q, n, phi;
  do { p = randomPrime(MIN_PQ, MAX_PQ); do { q = randomPrime(MIN_PQ, MAX_PQ); } while (q === p); n = p * q; phi = (p - 1) * (q - 1); } while (n < 29);
  const e = chooseE(phi), d = modInverse(e, phi);
  return { p, q, n, phi, e, d };
}

function updatePhiExplain(p, q, phi) {
  const el = document.getElementById("phiExplain");
  if (el) el.textContent = `φ(n) = (p − 1)(q − 1) = (${p} − 1) · (${q} − 1) = ${(p - 1)} · ${(q - 1)} = ${phi}`;
}
function fillKeyFields(keys) {
  document.getElementById("primeP").value = keys.p;
  document.getElementById("primeQ").value = keys.q;
  document.getElementById("modN").value = keys.n;
  document.getElementById("phiN").value = keys.phi;
  document.getElementById("pubE").value = keys.e;
  document.getElementById("privD").value = keys.d;
  updatePhiExplain(keys.p, keys.q, keys.phi);
}
function currentKeysFromUI() {
  return {
    p: parseInt(document.getElementById("primeP").value, 10),
    q: parseInt(document.getElementById("primeQ").value, 10),
    n: parseInt(document.getElementById("modN").value, 10),
    phi: parseInt(document.getElementById("phiN").value, 10),
    e: parseInt(document.getElementById("pubE").value, 10),
    d: parseInt(document.getElementById("privD").value, 10),
  };
}

// --- Chart.js Frequency Chart ---
let letterChart;
function computeCipherFrequencies(cipher) {
  const freq = new Map();
  const tokens = cipher.trim().split(/\s+/).filter(Boolean);
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  const labels = Array.from(freq.keys()).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const counts = labels.map(l => freq.get(l));
  return { labels, counts };
}
function renderChart(labels, counts) {
  const ctx = document.getElementById("letterChart").getContext("2d");
  if (letterChart instanceof Chart) letterChart.destroy();
  letterChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Frequency",
        data: counts,
        backgroundColor: "rgba(11,105,255,0.6)",
        borderColor: "rgba(11,105,255,1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Ciphertext Token Frequency Distribution" }
      },
      scales: {
        x: { title: { display: true, text: "Ciphertext tokens" }, ticks: { autoSkip: false, maxRotation: 0, minRotation: 0 } },
        y: { beginAtZero: true, title: { display: true, text: "Count" } }
      }
    }
  });
}

// --- REFERENCE ENGLISH LETTER FREQUENCY (A-Z + SPACE) ---
const ENGLISH_FREQ = [
  0.08167, // A
  0.01492, // B
  0.02782, // C
  0.04253, // D
  0.12702, // E
  0.02228, // F
  0.02015, // G
  0.06094, // H
  0.06966, // I
  0.00153, // J
  0.00772, // K
  0.04025, // L
  0.02406, // M
  0.06749, // N
  0.07507, // O
  0.01929, // P
  0.00095, // Q
  0.05987, // R
  0.06327, // S
  0.09056, // T
  0.02758, // U
  0.00978, // V
  0.02360, // W
  0.00150, // X
  0.01974, // Y
  0.00074, // Z
  0.17000  // SPACE (approx.)
];

// --- MSE-BASED CRYPTANALYSIS ALGORITHM ---
function computeLetterFrequency(text) {
  const counts = new Array(27).fill(0);
  let total = 0;
  for (const ch of text.toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') {
      counts[ch.charCodeAt(0) - 65]++;
      total++;
    } else if (ch === ' ') {
      counts[26]++;
      total++;
    }
  }
  return total > 0 ? counts.map(c => c / total) : counts;
}

function computeMSE(freq1, freq2) {
  let sum = 0;
  for (let i = 0; i < freq1.length && i < freq2.length; i++) {
    const diff = freq1[i] - freq2[i];
    sum += diff * diff;
  }
  return sum / freq1.length;
}

function mseCryptanalysis(ciphertext, publicE, publicN) {
  const tokens = ciphertext.trim().split(/\s+/).filter(Boolean).map(t => parseInt(t, 10));
  if (tokens.length === 0) return { plaintext: "", d: null, mse: Infinity };

  let bestCandidate = { plaintext: "", d: null, mse: Infinity };
  
  // We know phi = (p-1)(q-1) and d*e ≡ 1 (mod phi)
  // For small primes, we can try candidate d values
  // Since n is small (< 10000), phi is also small
  // We try d from 1 to publicN
  const maxD = Math.min(10000, publicN); // Limit search space for performance
  
  for (let candidateD = 1; candidateD < maxD; candidateD++) {
    // Check if d*e ≡ 1 (mod something reasonable)
    // For proper RSA: d*e ≡ 1 (mod φ(n))
    // We attempt decryption and check if result is valid
    
    try {
      const decryptedNums = tokens.map(c => modPow(c, candidateD, publicN));
      
      // Check if all decrypted values are in valid range [0, 26]
      const allValid = decryptedNums.every(m => m >= 0 && m <= 26);
      if (!allValid) continue;
      
      // Convert to plaintext
      const plaintext = decryptedNums.map(numToLetter).join("");
      
      // Compute frequency distribution of candidate plaintext
      const candidateFreq = computeLetterFrequency(plaintext);
      
      // Compute MSE against English reference
      const mse = computeMSE(candidateFreq, ENGLISH_FREQ);
      
      // Update best candidate if this has lower MSE
      if (mse < bestCandidate.mse) {
        bestCandidate = { plaintext, d: candidateD, mse };
      }
    } catch (e) {
      // Skip invalid candidates
      continue;
    }
  }
  
  return bestCandidate;
}

// --- OPTIMIZED MSE CRYPTANALYSIS (with phi estimation) ---
function optimizedMseCryptanalysis(ciphertext, publicE, publicN) {
  const tokens = ciphertext.trim().split(/\s+/).filter(Boolean).map(t => parseInt(t, 10));
  if (tokens.length === 0) return { plaintext: "", d: null, mse: Infinity, attempts: 0 };

  let bestCandidate = { plaintext: "", d: null, mse: Infinity, attempts: 0 };
  
  // Estimate phi(n) ≈ n for large primes, but for small n we need to be more careful
  // Since n = p*q with primes p,q, we have phi = (p-1)(q-1) = n - p - q + 1
  // For our range, phi is roughly between n/2 and n
  
  const phiEstimateLow = Math.floor(publicN * 0.5);
  const phiEstimateHigh = publicN;
  
  let attempts = 0;
  const maxAttempts = 5000;
  
  // Try values of phi in estimated range
  for (let phiGuess = phiEstimateLow; phiGuess <= phiEstimateHigh && attempts < maxAttempts; phiGuess++) {
    attempts++;
    
    // For this phi guess, compute d such that d*e ≡ 1 (mod phi)
    try {
      if (gcd(publicE, phiGuess) !== 1) continue; // e must be coprime with phi
      
      const candidateD = modInverse(publicE, phiGuess);
      
      const decryptedNums = tokens.map(c => modPow(c, candidateD, publicN));
      
      // Check if all decrypted values are in valid range [0, 26]
      const allValid = decryptedNums.every(m => m >= 0 && m <= 26);
      if (!allValid) continue;
      
      // Convert to plaintext
      const plaintext = decryptedNums.map(numToLetter).join("");
      
      // Compute frequency distribution
      const candidateFreq = computeLetterFrequency(plaintext);
      
      // Compute MSE
      const mse = computeMSE(candidateFreq, ENGLISH_FREQ);
      
      // Update best candidate
      if (mse < bestCandidate.mse) {
        bestCandidate = { plaintext, d: candidateD, mse, attempts, phi: phiGuess };
      }
      
      // Early termination if MSE is very small
      if (mse < 0.0001) break;
      
    } catch (e) {
      continue;
    }
  }
  
  return bestCandidate;
}

// --- Wire up page ---
window.addEventListener("DOMContentLoaded", () => {
  const keys = generateKeys();
  fillKeyFields(keys);
  updatePhiExplain(keys.p, keys.q, keys.phi);

  document.getElementById("regenBtn")?.addEventListener("click", () => {
    const k = generateKeys();
    fillKeyFields(k);
    updatePhiExplain(k.p, k.q, k.phi);
    if (letterChart instanceof Chart) { letterChart.destroy(); letterChart = undefined; }
  });

  document.getElementById("encryptBtn")?.addEventListener("click", () => {
    const { e, n } = currentKeysFromUI();
    let keys = { e, n, ...currentKeysFromUI() };
    if (n < 29) {
      keys = generateKeys();
      fillKeyFields(keys);
      updatePhiExplain(keys.p, keys.q, keys.phi);
    }
    const plain = document.getElementById("plainText").value;
    const cipher = encryptLetters(plain, keys.e, keys.n);
    document.getElementById("encryptedText").value = cipher;
    const { labels, counts } = computeCipherFrequencies(cipher);
    renderChart(labels, counts);
  });

  document.getElementById("decryptBtn")?.addEventListener("click", () => {
    const { d, n } = currentKeysFromUI();
    const cipher = document.getElementById("encryptedText").value;
    document.getElementById("decryptedText").value = decryptNumbers(cipher, d, n);
  });

  document.getElementById("distributionDecryptBtn")?.addEventListener("click", () => {
    const cipher = document.getElementById("encryptedText").value;
    const { e, n } = currentKeysFromUI();
    
    const startTime = performance.now();
    const result = optimizedMseCryptanalysis(cipher, e, n);
    const endTime = performance.now();
    
    document.getElementById("distributionDecryptedText").value = result.plaintext || "Decryption failed";
    
    const detailsDiv = document.getElementById("analysisDetails");
    const infoP = document.getElementById("analysisInfo");
    detailsDiv.style.display = 'block';
    
    if (result.plaintext) {
      infoP.innerHTML = `
        <strong>MSE-Based Cryptanalysis Results:</strong><br>
        • Time: ${(endTime - startTime).toFixed(2)}ms<br>
        • Attempts: ${result.attempts} phi candidates tested<br>
        • Best MSE: ${result.mse.toFixed(6)} (lower is better)<br>
        • Guessed d: ${result.d}<br>
        • Guessed φ(n): ${result.phi}<br>
        • Method: Brute-force phi search with frequency-based MSE scoring
      `;
    } else {
      infoP.textContent = `Analysis completed in ${(endTime - startTime).toFixed(2)}ms but no valid plaintext found. Try with longer ciphertext.`;
    }
  });
});

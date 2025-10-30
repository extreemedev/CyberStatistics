// --- Simulation State ---
let trajectoriesChart = null;
let distributionChart = null;

// --- Bernoulli Trial Simulation ---
function runBernoulliTrial(p) {
  return Math.random() < p ? 1 : 0;
}

function simulateTrajectory(p, n) {
  const frequencies = [];
  let successes = 0;
  
  for (let i = 1; i <= n; i++) {
    successes += runBernoulliTrial(p);
    frequencies.push(successes / i);
  }
  
  return frequencies;
}

function simulateMultipleTrajectories(p, m, n) {
  const trajectories = [];
  for (let i = 0; i < m; i++) {
    trajectories.push(simulateTrajectory(p, n));
  }
  return trajectories;
}

// --- Statistics Computation ---
function computeStatistics(trajectories, p) {
  const finalFrequencies = trajectories.map(t => t[t.length - 1]);
  const mean = finalFrequencies.reduce((sum, f) => sum + f, 0) / finalFrequencies.length;
  const variance = finalFrequencies.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / finalFrequencies.length;
  const std = Math.sqrt(variance);
  const convergence = Math.abs(mean - p) < 0.05 ? "Excellent" : Math.abs(mean - p) < 0.1 ? "Good" : "Moderate";
  
  return { mean, std, convergence, finalFrequencies };
}

// --- Chart Rendering ---
function renderTrajectoriesChart(trajectories, p, n) {
  const ctx = document.getElementById("trajectoriesChart").getContext("2d");
  
  if (trajectoriesChart) trajectoriesChart.destroy();
  
  const labels = Array.from({length: n}, (_, i) => i + 1);
  const datasets = trajectories.map((traj, idx) => ({
    label: `Trajectory ${idx + 1}`,
    data: traj,
    borderColor: `hsla(${(idx * 360 / trajectories.length)}, 70%, 50%, 0.4)`,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    pointRadius: 0,
    tension: 0.1
  }));
  
  // Add reference line for true probability
  datasets.push({
    label: 'True probability p',
    data: Array(n).fill(p),
    borderColor: 'rgba(255, 0, 0, 0.8)',
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderDash: [10, 5],
    pointRadius: 0,
    tension: 0
  });
  
  trajectoriesChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Relative Frequency f(n) vs Number of Trials n' },
        tooltip: { 
          enabled: true,
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(4)}`;
            }
          }
        }
      },
      scales: {
        x: { 
          title: { display: true, text: 'Number of trials (n)' },
          type: 'linear',
          ticks: { maxTicksLimit: 10 }
        },
        y: { 
          title: { display: true, text: 'Relative frequency f(n)' },
          min: 0,
          max: 1
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}

function renderDistributionChart(finalFrequencies, p) {
  const ctx = document.getElementById("distributionChart").getContext("2d");
  
  if (distributionChart) distributionChart.destroy();
  
  // Create histogram bins
  const numBins = Math.min(20, Math.ceil(Math.sqrt(finalFrequencies.length)));
  const min = Math.min(...finalFrequencies);
  const max = Math.max(...finalFrequencies);
  const binWidth = (max - min) / numBins;
  
  const bins = Array(numBins).fill(0);
  const binLabels = [];
  
  for (let i = 0; i < numBins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    binLabels.push(binStart.toFixed(3));
    
    for (const freq of finalFrequencies) {
      if (freq >= binStart && (freq < binEnd || (i === numBins - 1 && freq === binEnd))) {
        bins[i]++;
      }
    }
  }
  
  distributionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: binLabels,
      datasets: [{
        label: 'Count',
        data: bins,
        backgroundColor: 'rgba(11, 105, 255, 0.6)',
        borderColor: 'rgba(11, 105, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Distribution of Final f(n) Across All Trajectories' },
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              xMin: p,
              xMax: p,
              borderColor: 'red',
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                display: true,
                content: `p = ${p}`,
                position: 'start'
              }
            }
          }
        }
      },
      scales: {
        x: { 
          title: { display: true, text: 'f(n) bins' },
          ticks: { maxRotation: 45, minRotation: 45 }
        },
        y: { 
          title: { display: true, text: 'Frequency' },
          beginAtZero: true
        }
      }
    }
  });
}

function updateStatistics(stats, p) {
  document.getElementById("statTrue").textContent = p.toFixed(3);
  document.getElementById("statMean").textContent = stats.mean.toFixed(4);
  document.getElementById("statStd").textContent = stats.std.toFixed(4);
  document.getElementById("statConvergence").textContent = stats.convergence;
}

function showStatus(message) {
  const statusDiv = document.getElementById("simulationStatus");
  const statusText = document.getElementById("statusText");
  statusText.textContent = message;
  statusDiv.style.display = 'block';
  
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

// --- Event Handlers ---
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("runSimulation")?.addEventListener("click", () => {
    const p = parseFloat(document.getElementById("probSuccess").value);
    const m = parseInt(document.getElementById("numTrajectories").value);
    const n = parseInt(document.getElementById("numTrials").value);
    
    // Validation
    if (isNaN(p) || p < 0 || p > 1) {
      alert("Probability must be between 0 and 1");
      return;
    }
    if (isNaN(m) || m < 1 || m > 100) {
      alert("Number of trajectories must be between 1 and 100");
      return;
    }
    if (isNaN(n) || n < 10 || n > 10000) {
      alert("Number of trials must be between 10 and 10000");
      return;
    }
    
    showStatus(`Running simulation: p=${p}, m=${m}, n=${n}...`);
    
    // Run simulation with slight delay for UI update
    setTimeout(() => {
      const trajectories = simulateMultipleTrajectories(p, m, n);
      const stats = computeStatistics(trajectories, p);
      
      renderTrajectoriesChart(trajectories, p, n);
      renderDistributionChart(stats.finalFrequencies, p);
      updateStatistics(stats, p);
      
      showStatus("Simulation completed successfully!");
    }, 100);
  });
  
  document.getElementById("resetSimulation")?.addEventListener("click", () => {
    if (trajectoriesChart) trajectoriesChart.destroy();
    if (distributionChart) distributionChart.destroy();
    
    document.getElementById("statTrue").textContent = "—";
    document.getElementById("statMean").textContent = "—";
    document.getElementById("statStd").textContent = "—";
    document.getElementById("statConvergence").textContent = "—";
    
    document.getElementById("probSuccess").value = "0.5";
    document.getElementById("numTrajectories").value = "20";
    document.getElementById("numTrials").value = "1000";
    
    showStatus("Reset completed");
  });
  
  // Run initial simulation
  setTimeout(() => {
    document.getElementById("runSimulation").click();
  }, 500);
});

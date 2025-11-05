// ========== ONLINE ALGORITHM (WELFORD) ==========

class WelfordStatistics {
  constructor() {
    this.count = 0;
    this.mean = 0;
    this.M2 = 0;
  }

  update(x) {
    this.count += 1;
    const delta = x - this.mean;
    this.mean += delta / this.count;
    const delta2 = x - this.mean;
    this.M2 += delta * delta2;
  }

  getStats() {
    if (this.count < 2) {
      return { mean: this.mean, variance: NaN, stdDev: NaN };
    }
    const variance = this.M2 / (this.count - 1); // sample variance
    return {
      mean: this.mean,
      variance: variance,
      stdDev: Math.sqrt(variance)
    };
  }
}

// ========== BATCH ALGORITHM (NAIVE - NUMERICALLY UNSTABLE) ==========

function batchStatistics(data) {
  const n = data.length;
  if (n === 0) return { mean: NaN, variance: NaN, stdDev: NaN };
  
  // Mean
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += data[i];
  }
  const mean = sum / n;
  
  // Variance using the "naive" formula (prone to cancellation)
  let sumSquares = 0;
  for (let i = 0; i < n; i++) {
    sumSquares += data[i] * data[i];
  }
  const variance = (sumSquares / n) - (mean * mean);
  const varianceSample = variance * n / (n - 1);
  
  return {
    mean: mean,
    variance: varianceSample,
    stdDev: Math.sqrt(varianceSample)
  };
}

// ========== TEST DATA GENERATORS ==========

function generateNormal(n, mu = 50, sigma = 10) {
  const data = [];
  for (let i = 0; i < n; i++) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    data.push(mu + z * sigma);
  }
  return data;
}

function generateLargeOffset(n) {
  // Data around 10^9 with small variance
  const offset = 1e9;
  const data = [];
  for (let i = 0; i < n; i++) {
    data.push(offset + (Math.random() - 0.5) * 10);
  }
  return data;
}

function generateCatastrophic(n) {
  // Extreme case: very large numbers with tiny variance
  const offset = 1e12;
  const data = [];
  for (let i = 0; i < n; i++) {
    data.push(offset + (Math.random() - 0.5) * 0.001);
  }
  return data;
}

// ========== TESTING & VISUALIZATION ==========

let convergenceChart = null;

function runTest(dataGenerator, n = 1000) {
  const data = dataGenerator(n);
  
  // Online algorithm
  const welford = new WelfordStatistics();
  const startOnline = performance.now();
  for (const x of data) {
    welford.update(x);
  }
  const endOnline = performance.now();
  const onlineStats = welford.getStats();
  
  // Batch algorithm
  const startBatch = performance.now();
  const batchStats = batchStatistics(data);
  const endBatch = performance.now();
  
  // Display results
  document.getElementById('onlineMean').textContent = onlineStats.mean.toPrecision(12);
  document.getElementById('onlineVar').textContent = onlineStats.variance.toPrecision(12);
  document.getElementById('onlineStd').textContent = onlineStats.stdDev.toPrecision(12);
  document.getElementById('onlineTime').textContent = (endOnline - startOnline).toFixed(3);
  
  document.getElementById('batchMean').textContent = batchStats.mean.toPrecision(12);
  document.getElementById('batchVar').textContent = batchStats.variance.toPrecision(12);
  document.getElementById('batchStd').textContent = batchStats.stdDev.toPrecision(12);
  document.getElementById('batchTime').textContent = (endBatch - startBatch).toFixed(3);
  
  // Error analysis
  const meanError = Math.abs(onlineStats.mean - batchStats.mean);
  const varError = Math.abs(onlineStats.variance - batchStats.variance);
  
  document.getElementById('errorMean').textContent = meanError.toExponential(3);
  document.getElementById('errorVar').textContent = varError.toExponential(3);
  
  // Warning for catastrophic cancellation
  const warningMsg = document.getElementById('warningMsg');
  if (batchStats.variance < 0) {
    warningMsg.style.display = 'block';
    warningMsg.textContent = '⚠️ Batch algorithm produced NEGATIVE variance due to catastrophic cancellation!';
  } else if (varError / onlineStats.variance > 0.01) {
    warningMsg.style.display = 'block';
    warningMsg.textContent = `⚠️ Significant error detected (${(100*varError/onlineStats.variance).toFixed(2)}% relative error in variance).`;
  } else {
    warningMsg.style.display = 'none';
  }
  
  document.getElementById('resultsContainer').style.display = 'block';
  
  // Convergence visualization
  visualizeConvergence(data);
}

function visualizeConvergence(data) {
  const welford = new WelfordStatistics();
  const means = [];
  const variances = [];
  const labels = [];
  
  const step = Math.max(1, Math.floor(data.length / 100));
  for (let i = 0; i < data.length; i++) {
    welford.update(data[i]);
    if (i % step === 0 || i === data.length - 1) {
      const stats = welford.getStats();
      means.push(stats.mean);
      variances.push(stats.variance);
      labels.push(i + 1);
    }
  }
  
  const ctx = document.getElementById('convergenceChart');
  if (!ctx) return;
  
  if (convergenceChart) convergenceChart.destroy();
  
  convergenceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Mean',
        data: means,
        borderColor: 'rgba(11, 105, 255, 1)',
        backgroundColor: 'rgba(11, 105, 255, 0.1)',
        yAxisID: 'y',
        borderWidth: 2
      }, {
        label: 'Variance',
        data: variances,
        borderColor: 'rgba(255, 122, 24, 1)',
        backgroundColor: 'rgba(255, 122, 24, 0.1)',
        yAxisID: 'y1',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: 'Convergence of Mean and Variance (Welford Algorithm)'
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Number of observations' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Mean' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Variance' },
          grid: {
            drawOnChartArea: false,
          },
        },
      }
    }
  });
}

// ========== EVENT LISTENERS ==========

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('testNormal')?.addEventListener('click', () => {
    runTest(n => generateNormal(n, 50, 10), 1000);
  });
  
  document.getElementById('testLargeOffset')?.addEventListener('click', () => {
    runTest(generateLargeOffset, 1000);
  });
  
  document.getElementById('testCatastrophic')?.addEventListener('click', () => {
    runTest(generateCatastrophic, 1000);
  });
});

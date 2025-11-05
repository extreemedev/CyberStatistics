// ========== STATISTICAL FUNCTIONS ==========

function parseInput(text) {
  return text.split(/[\s,]+/)
    .map(x => parseFloat(x.trim()))
    .filter(x => !isNaN(x) && isFinite(x));
}

function calculateMean(data) {
  if (data.length === 0) return null;
  return data.reduce((sum, x) => sum + x, 0) / data.length;
}

function calculateMedian(data) {
  if (data.length === 0) return null;
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function calculateMode(data) {
  if (data.length === 0) return null;
  const freq = {};
  data.forEach(x => { freq[x] = (freq[x] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const modes = Object.keys(freq).filter(x => freq[x] === maxFreq);
  
  if (modes.length === data.length) return "None";
  return modes.map(x => parseFloat(x)).join(", ");
}

function calculateVariance(data) {
  if (data.length === 0) return null;
  const mean = calculateMean(data);
  return data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
}

function calculateStdDev(data) {
  const variance = calculateVariance(data);
  return variance !== null ? Math.sqrt(variance) : null;
}

function calculateQuartiles(data) {
  if (data.length === 0) return { q1: null, q3: null };
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  
  function median(arr) {
    const mid = Math.floor(arr.length / 2);
    if (arr.length % 2 === 0) {
      return (arr[mid - 1] + arr[mid]) / 2;
    }
    return arr[mid];
  }
  
  const lowerHalf = sorted.slice(0, Math.floor(n / 2));
  const upperHalf = sorted.slice(Math.ceil(n / 2));
  
  return {
    q1: median(lowerHalf),
    q3: median(upperHalf)
  };
}

function calculateIQR(data) {
  const quartiles = calculateQuartiles(data);
  if (quartiles.q1 === null || quartiles.q3 === null) return null;
  return quartiles.q3 - quartiles.q1;
}

// ========== RANDOM DATA GENERATION ==========

function generateRandomData() {
  const sampleSize = Math.floor(Math.random() * 30) + 20; // 20-50 values
  const mean = Math.random() * 50 + 25; // mean between 25 and 75
  const stdDev = Math.random() * 15 + 5; // std dev between 5 and 20
  
  const data = [];
  for (let i = 0; i < sampleSize; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const value = mean + z * stdDev;
    data.push(Math.round(value * 10) / 10); // round to 1 decimal
  }
  
  // Add a couple of outliers randomly
  if (Math.random() > 0.5) {
    data.push(Math.round((mean + stdDev * 3) * 10) / 10);
  }
  if (Math.random() > 0.5) {
    data.push(Math.round((mean - stdDev * 2.5) * 10) / 10);
  }
  
  return data;
}

// ========== VISUALIZATION ==========

let histogramChart = null;

function renderHistogram(data) {
  const ctx = document.getElementById('histogramChart');
  if (!ctx) return;
  
  if (histogramChart) {
    histogramChart.destroy();
  }
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const numBins = Math.min(15, Math.ceil(Math.sqrt(data.length)));
  const binWidth = (max - min) / numBins || 1;
  
  const bins = Array(numBins).fill(0);
  const binLabels = [];
  
  for (let i = 0; i < numBins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    binLabels.push(binStart.toFixed(1));
    
    data.forEach(x => {
      if (x >= binStart && (x < binEnd || (i === numBins - 1 && x === binEnd))) {
        bins[i]++;
      }
    });
  }
  
  histogramChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: binLabels,
      datasets: [{
        label: 'Frequency',
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
        title: { 
          display: true, 
          text: 'Frequency Distribution',
          font: { size: 14 }
        }
      },
      scales: {
        x: { 
          title: { display: true, text: 'Value Range' },
          ticks: { 
            maxRotation: 45, 
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10
          }
        },
        y: { 
          title: { display: true, text: 'Count' },
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}

// ========== UI FUNCTIONS ==========

function displayResults(data) {
  const mean = calculateMean(data);
  const median = calculateMedian(data);
  const mode = calculateMode(data);
  const variance = calculateVariance(data);
  const std = calculateStdDev(data);
  const iqr = calculateIQR(data);
  
  document.getElementById('meanValue').textContent = mean !== null ? mean.toFixed(3) : '–';
  document.getElementById('medianValue').textContent = median !== null ? median.toFixed(3) : '–';
  document.getElementById('modeValue').textContent = mode || '–';
  document.getElementById('varValue').textContent = variance !== null ? variance.toFixed(3) : '–';
  document.getElementById('stdValue').textContent = std !== null ? std.toFixed(3) : '–';
  document.getElementById('iqrValue').textContent = iqr !== null ? iqr.toFixed(3) : '–';
  
  setTimeout(() => renderHistogram(data), 50);
}

// ========== EVENT LISTENERS ==========

window.addEventListener('DOMContentLoaded', () => {
  const computeBtn = document.getElementById('computeStats');
  const loadRandomBtn = document.getElementById('loadRandomBtn');
  const dataInput = document.getElementById('sampleData');
  
  if (computeBtn) {
    computeBtn.addEventListener('click', () => {
      const input = dataInput.value;
      const data = parseInput(input);
      
      if (data.length === 0) {
        alert('Please enter valid numeric data (comma or space-separated)');
        return;
      }
      
      displayResults(data);
    });
  }
  
  if (loadRandomBtn) {
    loadRandomBtn.addEventListener('click', () => {
      const randomData = generateRandomData();
      dataInput.value = randomData.join(', ');
      displayResults(randomData);
    });
  }
});

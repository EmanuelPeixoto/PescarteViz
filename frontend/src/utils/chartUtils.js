// Default chart options
export const defaultBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.raw.toLocaleString('pt-BR')}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return value.toLocaleString('pt-BR');
        }
      }
    },
    x: {
      ticks: {
        autoSkip: true,
        maxRotation: 45,
        minRotation: 45
      }
    }
  }
};

export const defaultPieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        padding: 20,
        boxWidth: 12,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const value = context.raw;
          const total = context.dataset.data.reduce((acc, val) => acc + parseFloat(val), 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${context.label}: ${value} (${percentage}%)`;
        }
      }
    },
    datalabels: {
      color: '#fff',
      font: { weight: 'bold', size: 12 },
      formatter: (value, ctx) => {
        const total = ctx.dataset.data.reduce((acc, val) => acc + parseFloat(val), 0);
        const percentage = ((value / total) * 100).toFixed(1);
        return percentage > 5 ? percentage + '%' : '';
      },
      anchor: 'center',
      align: 'center',
    }
  }
};
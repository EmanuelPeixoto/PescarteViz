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

export const getResponsiveChartOptions = (dimensions, baseOptions = {}) => {
  const { width } = dimensions;
  const isMobile = width < 576;
  const isTablet = width >= 576 && width < 992;

  // Base responsive settings
  const responsiveOptions = {
    maintainAspectRatio: false,
    responsive: true,

    plugins: {
      ...baseOptions.plugins,

      // Adjust legend based on screen size
      legend: {
        ...baseOptions.plugins?.legend,
        position: isMobile ? 'bottom' : 'top',
        labels: {
          ...baseOptions.plugins?.legend?.labels,
          boxWidth: isMobile ? 10 : 12,
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 11 : 12
          }
        }
      },

      // Adjust title based on screen size
      title: {
        ...baseOptions.plugins?.title,
        font: {
          ...baseOptions.plugins?.title?.font,
          size: isMobile ? 14 : (isTablet ? 16 : 18)
        }
      },

      // Handle data labels responsively
      datalabels: {
        ...baseOptions.plugins?.datalabels,
        display: !isMobile, // Hide datalabels on mobile
        font: {
          ...baseOptions.plugins?.datalabels?.font,
          size: isMobile ? 8 : (isTablet ? 10 : 12)
        }
      }
    },

    // Scale adjustments
    scales: {
      ...baseOptions.scales,
      x: {
        ...baseOptions.scales?.x,
        ticks: {
          ...baseOptions.scales?.x?.ticks,
          maxRotation: isMobile ? 45 : 0,
          font: {
            ...baseOptions.scales?.x?.ticks?.font,
            size: isMobile ? 10 : 12
          }
        }
      },
      y: {
        ...baseOptions.scales?.y,
        ticks: {
          ...baseOptions.scales?.y?.ticks,
          font: {
            ...baseOptions.scales?.y?.ticks?.font,
            size: isMobile ? 10 : 12
          }
        }
      }
    }
  };

  return responsiveOptions;
};

// PESCARTE brand color palette with extensions
export const chartColors = {
  // Primary data categories
  population: {
    main: 'rgba(0, 76, 153, 0.8)', // PESCARTE blue
    light: 'rgba(0, 76, 153, 0.6)',
    dark: 'rgba(0, 76, 153, 1)'
  },
  fishermen: {
    main: 'rgba(245, 130, 32, 0.8)', // PESCARTE orange
    light: 'rgba(245, 130, 32, 0.6)',
    dark: 'rgba(245, 130, 32, 1)'
  },
  percentage: {
    main: 'rgba(123, 104, 238, 0.8)', // More vibrant purple
    light: 'rgba(123, 104, 238, 0.6)',
    dark: 'rgba(123, 104, 238, 1)',
    // Gradient based on value (for municipalities with high/low percentages)
    low: 'rgba(123, 104, 238, 0.6)',
    medium: 'rgba(123, 104, 238, 0.75)',
    high: 'rgba(123, 104, 238, 0.9)'
  },

  // Pie chart segments (expanded with better contrast)
  categories: [
    'rgba(0, 76, 153, 0.8)',    // PESCARTE blue
    'rgba(245, 130, 32, 0.8)',   // PESCARTE orange
    'rgba(64, 160, 71, 0.8)',    // PESCARTE green
    'rgba(117, 197, 240, 0.8)',  // Light blue
    'rgba(255, 114, 94, 0.8)',   // Coral
    'rgba(156, 39, 176, 0.8)',   // Purple
    'rgba(255, 193, 7, 0.8)'     // Amber
  ],

  // Color mapping for municipalities (for special cases where needed)
  municipalities: {
    'Arraial do Cabo': 'rgba(0, 76, 153, 0.8)', // Use blue shade for consistency
    'Cabo Frio': 'rgba(0, 101, 204, 0.8)',
    'Campos dos Goytacazes': 'rgba(0, 127, 255, 0.8)',
    // Add others if needed for specific visualizations
  }
};

// Helper function to get border colors from fill colors
export const getBorderColor = (fillColor) => {
  return fillColor.replace(/[\d.]+\)$/, '1)');
};

// Get a color scale for percentage values
export const getPercentageColor = (percentage) => {
  if (percentage >= 40) {
    return chartColors.percentage.high;
  } else if (percentage >= 25) {
    return chartColors.percentage.medium;
  }
  return chartColors.percentage.low;
};

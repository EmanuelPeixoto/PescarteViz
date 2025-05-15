export const formatFishermenDistributionData = (communitiesData, isMobile = false) => {
  // Sort data by number of fishermen (descending)
  const sortedData = [...communitiesData].sort((a, b) =>
    parseInt(b.total_pescadores) - parseInt(a.total_pescadores)
  );

  // Calculate total fishermen for percentage calculation
  const totalFishermen = sortedData.reduce(
    (sum, item) => sum + (parseInt(item.total_pescadores) || 0), 0
  );

  // Threshold for grouping into "Other" (municipalities with less than 5% of total)
  const threshold = totalFishermen * 0.05;

  // Separate main and small categories
  const mainCategories = [];
  const smallCategories = [];

  sortedData.forEach(item => {
    const value = parseInt(item.total_pescadores) || 0;
    if (value >= threshold) {
      mainCategories.push(item);
    } else {
      smallCategories.push(item);
    }
  });

  // Prepare data arrays
  const labels = mainCategories.map(item => item.municipio);
  const data = mainCategories.map(item => parseInt(item.total_pescadores) || 0);

  // Add "Other" category if needed
  if (smallCategories.length > 0) {
    const otherSum = smallCategories.reduce(
      (sum, item) => sum + (parseInt(item.total_pescadores) || 0), 0
    );
    labels.push('Outros');
    data.push(otherSum);
  }

  // Custom colors with PESCARTE palette that work well for colorblind users
  const backgroundColors = [
    'rgba(0, 76, 153, 0.8)',     // PESCARTE blue
    'rgba(245, 130, 32, 0.8)',    // PESCARTE orange
    'rgba(64, 160, 71, 0.8)',     // PESCARTE green
    'rgba(117, 197, 240, 0.8)',   // Light blue
    'rgba(153, 102, 255, 0.8)',   // Purple
    'rgba(255, 159, 64, 0.8)',    // Light orange
    'rgba(128, 128, 128, 0.8)',   // Gray for "Others"
  ];

  const borderColors = backgroundColors.map(color =>
    color.replace('0.8', '1')
  );

  // Include the original items in each category for detailed tooltips
  const groupDetails = {};
  smallCategories.forEach(item => {
    const value = parseInt(item.total_pescadores) || 0;
    groupDetails[item.municipio] = {
      name: item.municipio,
      value: value,
      percentage: ((value / totalFishermen) * 100).toFixed(1)
    };
  });

  return {
    labels: labels,
    datasets: [
      {
        label: 'Pescadores por Município',
        data: data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        // Add original data for interactive tooltips
        groupDetails: smallCategories.length > 0 ? groupDetails : null
      }
    ],
    // Add metadata for tooltips
    metadata: {
      totalFishermen,
      smallCategories
    }
  };
};

export const formatPopulationData = (communitiesData) => {
  return {
    labels: communitiesData.map(item => item.municipio),
    datasets: [
      {
        label: 'População Total',
        data: communitiesData.map(item => parseInt(item.total_pessoas) || 0),
        backgroundColor: 'rgba(0, 117, 201, 0.6)',
        borderColor: 'rgba(0, 117, 201, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pescadores',
        data: communitiesData.map(item => parseInt(item.total_pescadores) || 0),
        backgroundColor: 'rgba(245, 130, 32, 0.6)',
        borderColor: 'rgba(245, 130, 32, 1)',
        borderWidth: 1,
      }
    ],
  };
};

export const formatPercentageData = (communitiesData, isMobile = false) => {
  // Create array with municipality names and calculated percentages
  const percentageData = communitiesData.map(item => {
    const pessoas = parseInt(item.total_pessoas) || 0;
    const pescadores = parseInt(item.total_pescadores) || 0;
    const percentage = pessoas > 0 ? (pescadores / pessoas) * 100 : 0;

    return {
      municipio: item.municipio,
      percentage: parseFloat(percentage.toFixed(1))
    };
  });

  // Sort the data by percentage in descending order
  percentageData.sort((a, b) => b.percentage - a.percentage);

  // Use a color gradient based on percentage values
  const getColorByPercentage = (percentage) => {
    // Higher percentages get stronger colors
    const intensity = 0.5 + (percentage / 100) * 0.5;
    return `rgba(153, 102, 255, ${intensity})`;
  };

  const backgroundColors = percentageData.map(item =>
    getColorByPercentage(item.percentage)
  );

  const borderColors = backgroundColors.map(color =>
    color.replace(/[\d.]+\)$/, '1)')
  );

  return {
    labels: percentageData.map(item => item.municipio),
    datasets: [
      {
        label: 'Percentual de Pescadores (%)',
        data: percentageData.map(item => item.percentage),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      }
    ],
  };
};
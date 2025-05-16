import { chartColors, getBorderColor, getPercentageColor } from './chartUtils';

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
        backgroundColor: chartColors.categories.slice(0, labels.length),
        borderColor: chartColors.categories.slice(0, labels.length).map(getBorderColor),
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
        backgroundColor: chartColors.population.light,
        borderColor: chartColors.population.dark,
        borderWidth: 1,
      },
      {
        label: 'Pescadores',
        data: communitiesData.map(item => parseInt(item.total_pescadores) || 0),
        backgroundColor: chartColors.fishermen.light,
        borderColor: chartColors.fishermen.dark,
        borderWidth: 1,
      }
    ]
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

  // Use intensity-based colors for meaningful color variations
  const backgroundColors = percentageData.map(item => getPercentageColor(item.percentage));
  const borderColors = backgroundColors.map(color => getBorderColor(color));

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

export const formatMotivationData = (communitiesData, isMobile = false) => {
  // Create a map to aggregate motivation data across all communities
  const motivationsMap = {};
  let hasData = false;

  // Map motivation categories from database to display names
  const motivationMapping = {
    'Tradição Familiar': 'Tradição Familiar',
    'Falta de outro emprego': 'Falta de Alternativas',
    'Porque gosta': 'Vocação/Gosto',
    'Bom rendimento': 'Sustento Econômico',
    'Ajudar a família': 'Sustento Econômico',
    'Não sabe fazer outra coisa': 'Falta de Alternativas',
    'Pouco estudo': 'Falta de Alternativas',
    'Problemas de Saúde': 'Outros Motivos'
  };

  // Process each community's motivation data
  communitiesData.forEach(community => {
    if (community.motivacao_profissional) {
      try {
        const motivations = JSON.parse(community.motivacao_profissional);

        // Process each motivation category
        Object.keys(motivations).forEach(key => {
          // Get standardized category name
          const category = motivationMapping[key] || key;

          // Initialize or add to the category total
          if (!motivationsMap[category]) {
            motivationsMap[category] = 0;
          }

          // Add percentual weighted by the number of pescadores in the community
          const weight = parseInt(community.pescadores) || 0;
          motivationsMap[category] += (parseFloat(motivations[key]) / 100) * weight;
          hasData = true;
        });
      } catch (e) {
        console.warn('Error parsing motivation data:', e);
      }
    }
  });

  // If no data was found, use sample data
  if (!hasData || Object.keys(motivationsMap).length === 0) {
    motivationsMap['Tradição Familiar'] = 32;
    motivationsMap['Sustento Econômico'] = 28;
    motivationsMap['Falta de Alternativas'] = 20;
    motivationsMap['Vocação/Gosto'] = 18;
    motivationsMap['Outros Motivos'] = 2;
  }

  // Sort motivations by count (descending)
  const sortedData = Object.entries(motivationsMap)
    .sort((a, b) => b[1] - a[1]);

  // Calculate total for percentages
  const total = sortedData.reduce((sum, [_, count]) => sum + count, 0);

  // Create color scale based on the number of categories
  const generateColors = (count) => {
    const colors = [
      'rgba(76, 175, 80, 0.7)',  // Green
      'rgba(33, 150, 243, 0.7)',  // Blue
      'rgba(255, 152, 0, 0.7)',   // Orange
      'rgba(156, 39, 176, 0.7)',  // Purple
      'rgba(244, 67, 54, 0.7)'    // Red
    ];
    return sortedData.map((_, i) => colors[i % colors.length]);
  };

  const backgroundColor = generateColors(sortedData.length);
  const borderColor = backgroundColor.map(color => color.replace('0.7', '1'));

  return {
    labels: sortedData.map(([category]) => category),
    datasets: [
      {
        label: 'Motivação Profissional',
        data: sortedData.map(([_, count]) => Math.round(count)),
        backgroundColor,
        borderColor,
        borderWidth: 1,
      }
    ],
    // Add metadata for tooltips
    metadata: {
      total,
      percentages: sortedData.map(([category, count]) => ({
        category,
        percentage: ((count / total) * 100).toFixed(1)
      }))
    }
  };
};

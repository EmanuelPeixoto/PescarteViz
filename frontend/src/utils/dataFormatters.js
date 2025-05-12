export const formatFishermenDistributionData = (communitiesData) => {
  return {
    labels: communitiesData.map(item => item.municipio),
    datasets: [
      {
        label: 'Pescadores por Município',
        data: communitiesData.map(item => parseInt(item.total_pescadores) || 0),
        backgroundColor: [
          'rgba(0, 117, 201, 0.8)',
          'rgba(245, 130, 32, 0.8)',
          'rgba(0, 76, 153, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(54, 162, 235, 0.8)',
        ],
        borderColor: [
          'rgba(0, 117, 201, 1)',
          'rgba(245, 130, 32, 1)',
          'rgba(0, 76, 153, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 2,
      },
    ],
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

export const formatPercentageData = (communitiesData) => {
  return {
    labels: communitiesData.map(item => item.municipio),
    datasets: [
      {
        label: 'Percentual de Pescadores (%)',
        data: communitiesData.map(item => {
          const pessoas = parseInt(item.total_pessoas) || 0;
          const pescadores = parseInt(item.total_pescadores) || 0;
          return pessoas > 0 ? ((pescadores / pessoas) * 100).toFixed(1) : 0;
        }),
        backgroundColor: [
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      }
    ],
  };
};
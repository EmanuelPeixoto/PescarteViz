import React, { useEffect, useRef, useState } from 'react';

const ResponsiveChart = ({
  renderChart,
  className = "",
  aspectRatio = 2, // default aspect ratio (width/height)
  minHeight = 200,  // minimum height in px
  chartType = "bar" // helps determine optimal display proportions
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Calculate optimal aspect ratio based on chart type
  const getOptimalAspectRatio = (width, chartType) => {
    // Mobile needs more compact ratios
    const isMobile = width < 576;
    const isTablet = width >= 576 && width < 992;

    switch (chartType) {
      case 'pie':
        return isMobile ? 1.0 : (isTablet ? 1.2 : 1.0); // More square for pie charts
      case 'bar':
        return isMobile ? 1.2 : (isTablet ? 1.6 : 2.0); // Wider for bar charts
      case 'horizontal-bar':
        return isMobile ? 0.8 : (isTablet ? 1.0 : 1.2); // Taller for horizontal bars
      case 'full-width-bar':
        return isMobile ? 1.3 : (isTablet ? 1.8 : 2.5); // Much wider for full-width
      default:
        return isMobile ? 1.2 : (isTablet ? 1.5 : 2.0);
    }
  };

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;

        // Calculate aspect ratio - could be a function or a fixed number
        const currentAspectRatio = typeof aspectRatio === 'function'
          ? aspectRatio({width, height: 0})
          : (chartType ? getOptimalAspectRatio(width, chartType) : aspectRatio);

        // Calculate minimum height - could be a function or a fixed number
        const currentMinHeight = typeof minHeight === 'function'
          ? minHeight({width, height: 0})
          : minHeight;

        // Calculate height based on aspect ratio, but ensure minimum height
        const calculatedHeight = Math.max(width / currentAspectRatio, currentMinHeight);

        setDimensions({
          width,
          height: calculatedHeight,
          aspectRatio: currentAspectRatio
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation

    return () => window.removeEventListener('resize', handleResize);
  }, [aspectRatio, minHeight, chartType]);

  return (
    <div
      ref={containerRef}
      className={`responsive-chart-container ${className} ${chartType}-chart-container`}
      style={{ height: dimensions.height }}
    >
      {dimensions.width > 0 && renderChart(dimensions)}
    </div>
  );
};

export default ResponsiveChart;

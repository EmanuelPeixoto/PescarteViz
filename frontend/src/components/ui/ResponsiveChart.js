import React, { useEffect, useRef, useState } from 'react';

const ResponsiveChart = ({
  renderChart,
  className = "",
  aspectRatio, // Let charts define their own optimal aspect ratio
  chartType = "bar"
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        setDimensions({
          width: containerWidth,
          height: containerHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`responsive-chart-container ${className} ${chartType}-chart-container`}
      style={{ width: '100%', height: '100%' }}
    >
      {dimensions.width > 0 && renderChart(dimensions)}
    </div>
  );
};

export default ResponsiveChart;

import React, { useEffect, useRef, useState } from 'react';

const ResponsiveChart = ({
  renderChart,
  className = "",
  aspectRatio = 2, // default aspect ratio (width/height)
  minHeight = 200  // minimum height in px
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;

        // Calculate aspect ratio - could be a function or a fixed number
        const currentAspectRatio = typeof aspectRatio === 'function'
          ? aspectRatio({width, height: 0})
          : aspectRatio;

        // Calculate minimum height - could be a function or a fixed number
        const currentMinHeight = typeof minHeight === 'function'
          ? minHeight({width, height: 0})
          : minHeight;

        // Calculate height based on aspect ratio, but ensure minimum height
        const calculatedHeight = Math.max(width / currentAspectRatio, currentMinHeight);

        setDimensions({ width, height: calculatedHeight });
      }
    };

    // Set initial dimensions
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [aspectRatio, minHeight]);

  return (
    <div
      ref={containerRef}
      className={`responsive-chart-container ${className}`}
      style={{
        width: '100%',
        height: dimensions.height ? `${dimensions.height}px` : 'auto',
      }}
    >
      {dimensions.width > 0 && renderChart(dimensions)}
    </div>
  );
};

export default ResponsiveChart;

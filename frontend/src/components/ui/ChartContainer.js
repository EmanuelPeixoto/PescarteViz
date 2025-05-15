import React, { useEffect, useRef, useState } from 'react';
import ErrorBoundary from '../ErrorBoundary';

const ChartContainer = ({ title, children, isLoading, height = 350, className = '' }) => {
  const chartRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const isMountedRef = useRef(true);
  const chartInstancesRef = useRef([]);
  const timeoutsRef = useRef([]);

  // Immediately set mounted on component initialization
  useEffect(() => {
    setMounted(true);

    // Much shorter delay to ensure DOM is ready but not too long
    const readyTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setChartReady(true);

        // After charts are ready, do a resize check
        const resizeTimer = setTimeout(() => {
          if (isMountedRef.current && chartRef.current) {
            // Check for any chart instances that need resizing
            const canvases = chartRef.current.querySelectorAll('canvas');
            canvases.forEach(canvas => {
              try {
                if (canvas.chart && document.body.contains(canvas)) {
                  canvas.chart.resize();
                }
              } catch (error) {
                // Silent catch
              }
            });
          }
        }, 100);
        timeoutsRef.current.push(resizeTimer);
      }
    }, 50); // Reduced from 300ms to 50ms

    timeoutsRef.current.push(readyTimer);

    return () => {
      isMountedRef.current = false;
      setMounted(false);
      setChartReady(false);

      // Clear all timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      // Clean up any chart instances
      try {
        chartInstancesRef.current.forEach(chart => {
          if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
          }
        });
        chartInstancesRef.current = [];
      } catch (err) {
        // Ignore cleanup errors
      }
    };
  }, []);

  // Track chart instances in a simpler way
  useEffect(() => {
    if (!mounted || !chartRef.current) return;

    // Helper function to collect chart instances
    const findChartInstances = () => {
      if (!chartRef.current) return;

      try {
        const canvases = chartRef.current.querySelectorAll('canvas');
        canvases.forEach(canvas => {
          if (canvas.chart && !chartInstancesRef.current.includes(canvas.chart)) {
            // Add chart instance to our tracking array
            chartInstancesRef.current.push(canvas.chart);

            // Patch resize method to prevent errors
            const originalResize = canvas.chart.resize;
            canvas.chart.resize = function() {
              try {
                if (document.body.contains(canvas)) {
                  originalResize.apply(this);
                }
              } catch (err) {
                // Silently ignore resize errors
              }
            };
          }
        });
      } catch (err) {
        // Ignore errors during chart detection
      }
    };

    // Check periodically for charts while mounting
    const checkInterval = setInterval(findChartInstances, 200);
    setTimeout(() => clearInterval(checkInterval), 2000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [mounted]);

  return (
    <div className={`chart-container ${className}`} ref={chartRef}>
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
      </div>
      <div className="chart-body" style={{ height }}>
        {isLoading ? (
          <div className="chart-loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Carregando dados...</div>
          </div>
        ) : (
          <ErrorBoundary>
            <div className="chart-content-wrapper">
              {/* Less restrictive conditional rendering */}
              {mounted ? children : null}
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default ChartContainer;

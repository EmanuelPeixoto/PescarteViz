import { useState, useEffect, useRef } from 'react';

function useResizeObserver(ref) {
  const [dimensions, setDimensions] = useState(null);
  const resizeObserver = useRef(null);

  useEffect(() => {
    if (ref.current) {
      resizeObserver.current = new ResizeObserver(entries => {
        if (entries[0]) {
          const { width, height } = entries[0].contentRect;
          setDimensions({ width, height });
        }
      });

      resizeObserver.current.observe(ref.current);
    }

    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, [ref]);

  return dimensions;
}

export default useResizeObserver;
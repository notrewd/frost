// https://www.joshwcomeau.com/snippets/react-hooks/use-mouse-position/
// slightly modified for typescript compatibility

import React, { useEffect } from "react";

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = React.useState<{
    x: number | null;
    y: number | null;
  }>({
    x: null,
    y: null,
  });

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return mousePosition;
};

export default useMousePosition;

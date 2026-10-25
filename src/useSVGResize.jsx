import { useEffect } from "react";

export function useSVGResize(drawFunction) {
  useEffect(() => {
    drawFunction();

    window.addEventListener("resize", drawFunction);

    return () => {
      window.removeEventListener("resize", drawFunction);
    };
  }, [drawFunction]);
}
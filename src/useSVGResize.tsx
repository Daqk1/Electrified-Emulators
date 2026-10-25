
import { useEffect } from "react";

export function useSVGResize(
  drawFunction: () => void
): void {

  useEffect(() => {

    // Draw SVG when component loads
    drawFunction();

    // Redraw SVG when window resizes
    window.addEventListener("resize", drawFunction);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener("resize", drawFunction);
    };

  }, [drawFunction]);

}

import { useLayoutEffect, useState, type RefObject } from "react";

/** The inner width of an element, kept up to date (for grids that size their cards to fit). */
export function useElementWidth(ref: RefObject<HTMLElement | null>, initial = 800): number {
  const [width, setWidth] = useState(initial);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const style = getComputedStyle(element);
      setWidth(element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

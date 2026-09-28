import { useLayoutEffect, useState, type RefObject } from "react";
import { computeLayout, type TableLayout } from "./layout";

/** The table's layout, following the element's size. */
export function useTableLayout(ref: RefObject<HTMLElement | null>): TableLayout {
  const [layout, setLayout] = useState<TableLayout>(() => computeLayout(1000, 800));
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setLayout(computeLayout(element.clientWidth, element.clientHeight));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return layout;
}

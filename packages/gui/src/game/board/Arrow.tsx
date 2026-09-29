// An arrow over the whole window (attacks: the one being dragged and the one in progress). Drawn in a portal so the
// table's own boxes don't clip it.
import { createPortal } from "react-dom";

export interface Point {
  x: number;
  y: number;
}

/** The middle of the element showing a card, in window coordinates, or null when it isn't shown. */
export function cardCenter(card: string): Point | null {
  const element = document.querySelector(`[data-card="${CSS.escape(card)}"]`);
  if (!element) return null;
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

/**
 * `flash`: shown for that many milliseconds, appearing and fading (the animations' arrows); else it stays while rendered.
 */
export function Arrow({ from, to, variant, flash }: { from: Point; to: Point; variant: "drag" | "attack" | "target"; flash?: number }) {
  // A gentle curve: the control point is lifted off the straight line.
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const bend = Math.min(80, length * 0.2);
  const cx = mx - (dy / length) * bend;
  const cy = my + (dx / length) * bend;
  return createPortal(
    <svg
      className={`sve-arrow sve-arrow-${variant}${flash ? " sve-arrow-flash" : ""}`}
      style={flash ? { animationDuration: `${flash}ms` } : undefined}
      width="100%"
      height="100%"
    >
      <defs>
        <marker id={`sve-arrowhead-${variant}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <path d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`} markerEnd={`url(#sve-arrowhead-${variant})`} />
    </svg>,
    document.body,
  );
}

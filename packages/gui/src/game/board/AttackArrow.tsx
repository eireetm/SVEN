// The attack in progress (from its declaration to its end, CR 8.4): an arrow from the attacker to its target.
import { useLayoutEffect, useState } from "react";
import type { GameUpdate } from "../../engine/protocol";
import { Arrow, cardCenter, type Point } from "./Arrow";

export function AttackArrow({ update }: { update: GameUpdate }) {
  const attack = update.view.attack;
  const [ends, setEnds] = useState<[Point, Point] | null>(null);
  useLayoutEffect(() => {
    if (!attack) {
      setEnds(null);
      return;
    }
    const measure = () => {
      const from = cardCenter(attack.attacker);
      const to = cardCenter(attack.target);
      setEnds(from && to ? [from, to] : null);
    };
    measure();
    // Again once the cards have moved to their places (animations), and when the window changes.
    const timer = window.setTimeout(measure, 450);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [attack, update]);
  if (!attack || !ends) return null;
  return <Arrow from={ends[0]} to={ends[1]} variant="attack" />;
}

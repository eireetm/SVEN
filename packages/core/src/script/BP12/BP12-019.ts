// BP12-019 Patrick, Rhiceros Knight (Evolved) — Swordcraft follower, 5/5. 自然・指揮官・獣.
// Ward.
// On Evolve - If there are at least 5 Natura cards on your field and/or in your EX area, recover 5 play
// points.
import { defineCard, onEvolve } from "../helpers";
import { natura, onFieldAndEx } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      condition: (g, p) => onFieldAndEx(g, p, natura) >= 5,
      *resolve(fx) {
        yield* fx.recoverPlayPoints(5);
      },
    }),
  ],
});

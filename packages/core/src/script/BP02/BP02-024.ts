// BP02-024 White Paladin — Swordcraft follower, 3, 3/4.
// Ward. // {[act]}{[cost02]}, {[engage]}: Summon 2 Shield Guardian tokens.
import { activated, defineCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    activated(
      { playPoints: 2, engageSelf: true },
      {
        *resolve(fx) {
          yield* fx.summon(["Shield Guardian", "Shield Guardian"]);
        },
      },
    ),
  ],
});

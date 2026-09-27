// CP02-080 Ryo Matsunaga — Abysscraft follower, 3, 3/4. デレマス・クール.
// Ward.
// {[lastwords]} Select an iM@S CG spell in your cemetery and add it to your hand.
import { defineCard, lastWords } from "../helpers";
import { inYourZone, isSpell } from "../targets";
import { imas } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      targets: [inYourZone("cemetery", { filter: (g, id) => isSpell(g, id) && imas(g, id) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});

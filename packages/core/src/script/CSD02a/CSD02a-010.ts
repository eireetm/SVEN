// CSD02a-010 Nene Kurihara (Evolved) — 4/5.
// Ward.
// On Evolve - {[cost03]}: Select a Cute follower in your cemetery and summon it.
import { playPointsCost } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { inYourZone } from "../targets";
import { cute, followerThat } from "../CP02/shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      cost: playPointsCost(3),
      targets: [inYourZone("cemetery", { filter: followerThat(cute) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});

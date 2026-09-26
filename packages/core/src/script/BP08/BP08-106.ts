// BP08-106 Sahaquiel — Neutral follower, 6, 4/4. 天使・大神.
// Evolve (2). Fanfare: optionally put a Neutral follower from hand onto the field and give the new
// object "at the start of your end phase, return this to hand"; the gift survives Sahaquiel leaving
// (rulings; CR 4.1.4.1, 10.9.1.2).
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { and, inYourZone, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      targets: [inYourZone("hand", { filter: and(isFollower, isClass("Neutral")) })],
      *resolve(fx) {
        for (const id of yield* fx.putOntoField(fx.targets[0] ?? [])) yield* fx.grant(id, "returnToHandAtEnd");
      },
    }),
  ],
});

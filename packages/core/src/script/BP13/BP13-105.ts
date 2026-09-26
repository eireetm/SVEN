// BP13-105 Sahaquiel & Israfil — Neutral follower, 7, 6/6. 天使・大神.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// {[fanfare]} You may summon a follower that costs 6 or less from your hand. Give it "At the start of your
// end phase, return this card to its owner's hand." (The English text reads "ou may"; 元のコスト. The gift
// stays when this card leaves the field — ruling, CR 10.9.1.2.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { and, costAtMost, inYourZone, isFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [inYourZone("hand", { filter: and(isFollower, costAtMost(6)) })],
      *resolve(fx) {
        for (const id of yield* fx.putOntoField(fx.targets[0] ?? [])) yield* fx.grant(id, "returnToHandAtEnd");
      },
    }),
  ],
});

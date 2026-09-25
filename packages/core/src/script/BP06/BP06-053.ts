// BP06-053 Mirror of Truth — Runecraft amulet, 3. 魔法使い・土の印.
// Stack.
// {[fanfare]} Select an Alchemist follower that costs 3 or less in your cemetery and summon it.
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, hasTrait, inYourZone, isFollower } from "../targets";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(isFollower, hasTrait("錬金術師"), costAtMost(3)) })],
      *resolve(fx) {
        const card = fx.targets[0]![0]!;
        if (fx.game.card(card)?.zone === "cemetery") yield* fx.putOntoField([card]);
      },
    }),
  ],
});

// BP12-089 Gullias, Silverbeast Lord — Havencraft follower, 6, 3/4. 機械・信仰・超克.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select a Machina follower that costs 2 or less in your cemetery and summon it.
// Activate, banish 2 cards named Repair Mode from your EX area: Give this follower Storm.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { and, costAtMost, inYourZone, isFollower } from "../targets";
import { machina } from "./shared";
import { galliasStorm } from "./shared-haven";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(isFollower, machina, costAtMost(2)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
    galliasStorm,
  ],
});

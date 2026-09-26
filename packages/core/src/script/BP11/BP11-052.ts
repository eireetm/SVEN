// BP11-052 Reggie, Peerless Artisan — Dragoncraft follower, 3, 2/2. 荒野・竜族.
// {[evolve]} {[cost01]}: Evolve this follower.
// While Overflow is active for you, this follower has Storm. (A passive: it follows Overflow — ruling.)
// {[fanfare]} Select a Wasteland follower that costs 2 or less in your cemetery and summon it.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { and, costAtMost, inYourZone } from "../targets";
import { wastelandFollower } from "./shared";
import { stormWithOverflow } from "./shared-dragon";

export default defineCard({
  selfKeywords: stormWithOverflow,
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(wastelandFollower, costAtMost(2)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});

// BP18-101 Conferrer of Vows — Havencraft follower, 3, 3/3. 透京・信仰.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} {[cost02]} Select a Togh Keyoh follower in your cemetery not named Conferrer of Vows that costs 4 or less and
// summon it. (元のコスト; CR 10.4.7.4.)
import { playPointsCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { and, costAtMost, inYourZone, named } from "../targets";
import { toghKeyohFollower } from "./shared-haven";

const conferrer = named("Conferrer of Vows");

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: playPointsCost(2),
      targets: [inYourZone("cemetery", { filter: and(toghKeyohFollower, costAtMost(4), (g, id) => !conferrer(g, id)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});

// BP19-017 Support Troop Elf — Forestcraft follower, 2, 3/2. エルフ族.
// Rush.
// {[fanfare]} Select another card on your field not named Support Troop Elf and return it to its owner's hand.
import { defineCard, fanfare } from "../helpers";
import { named, yourCardOnField } from "../targets";

const elf = named("Support Troop Elf");

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      targets: [yourCardOnField({ filter: (g, id) => !elf(g, id) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});

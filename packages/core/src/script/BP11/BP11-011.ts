// BP11-011 Corrosive Thorns — Forestcraft spell, 2. 植物族.
// Select any number of Pixie tokens on your field. For the rest of this turn, they have "Activate
// {[engage]}: Select an enemy follower on the field. Deal 3 damage to it and 1 damage to its leader."
import { defineCard, spell } from "../helpers";
import { ANY, yourFollower } from "../targets";
import { pixieToken } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ count: ANY, upTo: true, filter: pixieToken })],
      *resolve(fx) {
        for (const card of fx.targets[0]!) yield* fx.grant(card, "activateEngageDamage3", "endOfTurn");
      },
    }),
  ],
});

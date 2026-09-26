// BP10-063 Dual Rage — Dragoncraft spell, 6. 竜族・武装.
// Activate Banish this card from your cemetery: Select a Lævateinn Dragon and 2 cards named Draconic
// Weapon on your field. Destroy them, then you may summon an advanced follower with "Dual Form" in its
// name from your evolve deck. (Valid in the cemetery; playable only when all three can be selected —
// rulings.)
// ----------
// Search your deck for an Armed follower, reveal it, add it to your hand, then shuffle. You may summon
// an Armed follower from your hand. (Also one just found, and also when none was found — rulings.)
import { banishThisFromCemetery } from "../costs";
import { activated, defineCard, spell } from "../helpers";
import { and, isAdvanced, isFollower, named, nameIncludes, yourCardOnField, yourFollower } from "../targets";
import { armed } from "./shared";

const armedFollower = and(isFollower, armed);
const dualForm = and(isFollower, isAdvanced, nameIncludes("Dual Form"));

export default defineCard({
  abilities: [
    activated(
      { custom: banishThisFromCemetery },
      {
        validIn: ["cemetery"],
        targets: [
          yourFollower({ filter: named("Lævateinn Dragon") }),
          yourCardOnField({ count: 2, filter: named("Draconic Weapon") }),
        ],
        *resolve(fx) {
          yield* fx.destroy([...fx.targets[0]!, ...fx.targets[1]!]);
          yield* fx.fromEvolveDeck((id) => dualForm(fx.game, id), { to: "field" });
        },
      },
    ),
    spell({
      *resolve(fx) {
        yield* fx.search((id) => armedFollower(fx.game, id));
        const inHand = fx.game.cards(fx.controller, "hand").filter((id) => armedFollower(fx.game, id));
        yield* fx.putOntoField(yield* fx.chooseCards(inHand, 0, 1));
      },
    }),
  ],
});

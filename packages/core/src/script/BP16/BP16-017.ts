// BP16-017 Baby Carbuncle — Forestcraft follower, 1, 0/1. 精霊・獣.
// {[fanfare]} Return a Beast card on your field not named Baby Carbuncle to its owner's hand: Draw a card. (A
// token returned to the hand is removed from the game, CR 9.1.4.)
import { returnAnotherFromYourField } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { beast } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: returnAnotherFromYourField((g, id) => beast(g, id) && !named("Baby Carbuncle")(g, id)),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});

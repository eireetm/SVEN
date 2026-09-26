// BP21-016 Flying Mistletoe Squirrel — Forestcraft follower, 2, 2/2. 獣.
// {[fanfare]} Return a Beast follower not named Flying Mistletoe Squirrel from your field to its owner's hand: Give this Storm.
// Draw a card. (CR 10.4.7.4: both after the return.)
import { returnAnotherFromYourField } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { isFollower, named } from "../targets";
import { beast } from "./shared";

const squirrel = named("Flying Mistletoe Squirrel");

export default defineCard({
  abilities: [
    fanfare({
      cost: returnAnotherFromYourField((g, id) => isFollower(g, id) && beast(g, id) && !squirrel(g, id)),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
        yield* fx.draw(1);
      },
    }),
  ],
});

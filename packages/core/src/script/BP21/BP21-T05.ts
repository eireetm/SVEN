// BP21-T05 Reactive Barrier — Runecraft amulet token, 0. 錬金術師・土の印.
// Stack.
// {[fanfare]} Draw a card. If there's an Alchemist follower that costs at least 3 on your field, draw 2 instead.
import { defineCard, fanfare } from "../helpers";
import { bigAlchemistOnYourField } from "./shared";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(bigAlchemistOnYourField(fx.game, fx.controller) ? 2 : 1);
      },
    }),
  ],
});

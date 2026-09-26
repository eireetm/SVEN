// BP19-084 Warden of Corpses — Abysscraft follower, 3, 3/4. 八獄・魔界.
// Ward.
// {[fanfare]} Draw a card. If there's a Myroel, Death Enforcer on your field, give your leader {[defense]}+4.
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { MYROEL } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        if (fx.game.cards(fx.controller, "field").some((id) => named(MYROEL)(fx.game, id))) yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
  ],
});

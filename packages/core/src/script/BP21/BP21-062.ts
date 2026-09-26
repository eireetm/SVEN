// BP21-062 Argente, Purest Silver — Dragoncraft follower, 2, 2/3. ドラゴニュート.
// Ward.
// At the start of your end phase, if there's a Lumiore, Prestigious Gold on your field, give your leader {[defense]}+3.
// {[fanfare]} Draw a card.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { named } from "../targets";

const lumiore = named("Lumiore, Prestigious Gold");

export default defineCard({
  keywords: ["ward"],
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "field").some((id) => lumiore(fx.game, id))) yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});

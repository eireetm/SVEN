// BP05-008 Disciple of Unkilling — Forestcraft follower, 2, 1/3. 絶傑・狩人.
// {[fanfare]} Look at the top card of your deck. If it's a Hunter card, you may reveal it and add
// it to your hand. (Otherwise it stays on top.)
import { defineCard, fanfare } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(1);
        const hunters = top.filter((id) => hasTrait("狩人")(fx.game, id));
        if (hunters.length === 0) {
          yield* fx.lookAt(top);
          return;
        }
        const chosen = yield* fx.selectCards(hunters, 0, 1, fx.controller, top);
        yield* fx.reveal(chosen);
        yield* fx.returnToHand(chosen);
      },
    }),
  ],
});

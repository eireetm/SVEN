// BP13-067 Earthen Dragonewt — Dragoncraft follower, 2, 2/2. ドラゴニュート・武闘竜人.
// {[fanfare]} Look at the top card of your deck. If it's a Draconic Duelist card, you may reveal it and add
// it to your hand. If Overflow is active for you, give your leader {[defense]}+2. (Not taken, it is not
// revealed and stays on top — ruling.)
import { defineCard, fanfare } from "../helpers";
import { draconicDuelist } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(1);
        yield* fx.lookAt(top);
        const taken = yield* fx.selectCards(top.filter((id) => draconicDuelist(fx.game, id)), 0, 1, fx.controller, top);
        yield* fx.reveal(taken);
        yield* fx.returnToHand(taken);
        if (fx.game.overflow(fx.controller)) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});

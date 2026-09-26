// BP13-068 Dualblade Dragonfolk — Dragoncraft follower, 1, 1/1. ドラゴニュート・竜族・武装.
// {[fanfare]} Discard an Armed card: Search your deck for an Armed spell, reveal it, add it to your hand,
// then shuffle.
import { defineCard, fanfare } from "../helpers";
import { discardA } from "../costs";
import { and, hasTrait, isSpell } from "../targets";

const armed = hasTrait("武装");

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(armed),
      *resolve(fx) {
        yield* fx.search((id) => and(isSpell, armed)(fx.game, id));
      },
    }),
  ],
});

// BP05-026 Fervent Machine Soldier — Swordcraft follower, 3, 3/4. 兵士・超克.
// {[fanfare]} Discard a Commander card: Search your deck for a Commander card, reveal it, add it
// to your hand, then shuffle your deck.
import { defineCard, fanfare } from "../helpers";
import { discardA } from "../costs";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(hasTrait("指揮官")),
      *resolve(fx) {
        yield* fx.search((id) => hasTrait("指揮官")(fx.game, id));
      },
    }),
  ],
});

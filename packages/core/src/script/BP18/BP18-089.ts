// BP18-089 Vampire Queen's Castle — Abysscraft amulet, 1. 吸血鬼.
// {[fanfare]} Discard a Vampire card: Draw a card. (CR 10.4.7.4.)
// Activate {[engage]} this, bury this: Summon a Forest Bat token. If there's a follower on your field with "Queen Vampire" in
// its name, summon 3 instead.
import { discardA } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { nameIncludes } from "../targets";
import { FOREST_BAT, vampire } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(vampire),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          const queen = fx.game.followers(fx.controller).some((id) => nameIncludes("Queen Vampire")(fx.game, id));
          yield* fx.summon(queen ? [FOREST_BAT, FOREST_BAT, FOREST_BAT] : [FOREST_BAT]);
        },
      },
    ),
  ],
});

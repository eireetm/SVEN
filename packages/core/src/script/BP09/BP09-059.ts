// BP09-059 Roy, Dragoncleaver — Dragoncraft follower, 3, 2/2. 武闘竜人・キラー.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Search your deck for a 2-cost {[dragoncraft]} spell, reveal it, add it to your hand, then
// shuffle your deck. (元のコスト2.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { dragonSpell } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => dragonSpell(fx.game, id) && fx.game.info(id).cost === 2);
      },
    }),
  ],
});

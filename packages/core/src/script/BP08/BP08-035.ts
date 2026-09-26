// BP08-035 Sweet-Tooth Medusa — Runecraft follower, 4, 3/4. 魔法使い・ゴルゴーン.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Search your deck for a card that costs 2 or less, reveal it, add it to your hand, then
// shuffle your deck. (元のコスト.)
// During your turn, whenever an enemy follower is put from the field into the cemetery, summon a
// Serpent token.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costAtMost } from "../targets";
import { medusaSerpent } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => costAtMost(2)(fx.game, id));
      },
    }),
    medusaSerpent,
  ],
});

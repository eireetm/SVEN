// BP18-020 Shinra, All Discerning — Swordcraft follower, 3, 3/3. 透京・探偵.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Search your deck for a Gigabyte Blade, summon it, then shuffle.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";
import { GIGABYTE_BLADE } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => named(GIGABYTE_BLADE)(fx.game, id), { to: "field" });
      },
    }),
  ],
});

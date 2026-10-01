// BP22-028 アックスパイレーツ (evolved) — Swordcraft, 3/4. 盗賊.
// 【進化時】『ヴァイキング』1体を場に出す。
// (On Evolve - Summon a Viking token.)
import { defineCard, onEvolve } from "../helpers";
import { VIKING } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon([VIKING]);
      },
    }),
  ],
});

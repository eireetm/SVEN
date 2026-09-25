// BP07-060 Hoarfrost Triceratops — Dragoncraft follower, 4, 3/3. 自然・竜族.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Banish a Naterran Great Tree on your field: Give this follower {[attack]}+2/{[defense]}+2.
// {[lastwords]} Summon a Naterran Great Tree token.
import { banishFromYour } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isTree, summonTreeLastWords } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: banishFromYour(["field"], isTree),
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
    summonTreeLastWords,
  ],
});

// BP02-099 Beastcall Aria — Havencraft amulet, 3.
// {[fanfare]} Summon a Holy Falcon token.
// {[act]}{[cost02]}, {[engage]}, put this card into its owner's cemetery: Summon a Holy Tiger token.
import { activated, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Holy Falcon"]);
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.summon(["Holy Tiger"]);
        },
      },
    ),
  ],
});

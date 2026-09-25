// BP09-017 Flower of Fairies — Forestcraft amulet, 2. 妖精・植物族.
// {[fanfare]} Put a Fairy Wisp token into your EX area.
// {[act]} {[engage]}, bury this card: Summon a Fairy token.
import { activated, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy Wisp"]);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.summon(["Fairy"]);
        },
      },
    ),
  ],
});

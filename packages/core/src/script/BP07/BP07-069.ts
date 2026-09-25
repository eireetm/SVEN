// BP07-069 Mono, Garnet Rebel — Abysscraft follower, 2, 3/2. 機械・魔界.
// {[evolve]} {[cost01]}: Evolve this follower. Activate only if there are 5 Machina followers on your
// field. (A Machina follower changed into an amulet doesn't count — ruling, CR 5.25.)
// Activate Banish 2 Machina cards from your cemetery: Summon an Assembly Droid token. Activate only
// once per turn.
import { banishFromYour } from "../costs";
import { activated, defineCard, evolveAbility } from "../helpers";
import { DROID, machina } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1, { condition: (g, c) => g.followers(c).filter((id) => machina(g, id)).length === 5 }),
    activated(
      { custom: banishFromYour(["cemetery"], machina, 2) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.summon([DROID]);
        },
      },
    ),
  ],
});

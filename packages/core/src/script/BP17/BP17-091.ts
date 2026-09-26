// BP17-091 Eris, Atoned Priestess — Havencraft follower, 3, 2/4. 信仰.
// {[adv]} {[cost03]}, bury this: You may summon a Relic Goddess from your evolve deck. Activate only if there are at least
// 4 amulets on your field. (An advanced activated ability, CR 12.16: it is this turn's evolve ability — ruling.)
// {[fanfare]} Select up to 1 enemy follower on the field for every 2 amulets on your field and banish them.
import { activated, defineCard, fanfare } from "../helpers";
import { ANY, enemyFollower, named } from "../targets";
import { amuletsOnField } from "./shared-haven";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 3, burySelf: true },
      {
        advanced: true,
        condition: (g, c) => amuletsOnField(g, c) >= 4,
        *resolve(fx) {
          yield* fx.fromEvolveDeck((id) => named("Relic Goddess")(fx.game, id), { to: "field" });
        },
      },
    ),
    fanfare({
      targets: [enemyFollower({ count: ANY, upTo: true, max: (g, c) => Math.floor(amuletsOnField(g, c) / 2) })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});

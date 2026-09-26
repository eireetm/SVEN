// BP13-056 Forte, Sovereign Supreme — Dragoncraft follower, 10, 5/9. 竜使い・武闘竜人・キラー.
// Each Dragon on your field has Storm and Drain. (Cards named Dragon: 『ドラゴン』; an attack already
// declared goes on without them — ruling.)
// At the start of your end phase, select up to 2 enemy followers on the field. During their controller's
// next turn, they can't attack enemies.
// {[act]} {[cost00]}: Summon a Dragon token. Activate only once per turn.
import { activated, atStartOfYourEndPhase, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  field: {
    keywordsFor: (g, self, card) =>
      g.card(card)?.zone === "field" && g.controller(card) === g.controller(self) && g.namesOf(card).includes("Dragon") ? ["storm", "drain"] : [],
  },
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        for (const id of fx.targets[0] ?? []) yield* fx.cannotAttack(id, "endOfOpponentsNextTurn");
      },
    }),
    activated(
      {},
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.summon(["Dragon"]);
        },
      },
    ),
  ],
});

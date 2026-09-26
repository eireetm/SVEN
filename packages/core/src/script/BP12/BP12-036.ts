// BP12-036 Belphomet, Worldreaver (Evolved) — Runecraft follower, 6/6. 機械・超克.
// On Evolve - Discard a Machina card: Summon an Assault Tentacle token.
// {[act]} {[cost02]}, banish a Machina token from your EX area: Summon an Assault Tentacle token.
import { activated, defineCard, onEvolve } from "../helpers";
import { banishFromYourEx, discardA } from "../costs";
import { and, isToken } from "../targets";
import { ASSAULT, machina } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardA(machina),
      *resolve(fx) {
        yield* fx.summon([ASSAULT]);
      },
    }),
    activated(
      { playPoints: 2, custom: banishFromYourEx(and(isToken, machina), 1) },
      {
        *resolve(fx) {
          yield* fx.summon([ASSAULT]);
        },
      },
    ),
  ],
});

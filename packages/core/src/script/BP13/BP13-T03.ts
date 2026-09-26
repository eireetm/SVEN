// BP13-T03 Blood Arts — Abysscraft spell token, 1. 荒野・吸血鬼.
// Deal 1 damage to your leader and each enemy follower on the field. Give each Aluzard, Timeworn Vampire on
// your field {[attack]}+1 and Drain, then give them {[attack]}+3/{[defense]}+3 if there are 3 faceup
// evolved followers named Aluzard, Timeworn Vampire in your evolve deck. (「3枚なら」: exactly 3.)
import { defineCard, spell } from "../helpers";
import { isEvolvedFollower, named } from "../targets";
import { ALUZARD } from "./shared-abyss";

const aluzard = named(ALUZARD);

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        const me = fx.controller;
        yield* fx.dealDamages([g.leader(me), ...g.followers(g.opponent(me))].map((target) => ({ target, amount: 1 })));
        const mine = g.followers(me).filter((id) => aluzard(g, id));
        for (const id of mine) {
          yield* fx.giveStats(id, 1, 0);
          yield* fx.giveKeyword(id, "drain");
        }
        const used = g.faceUpEvolveDeck(me).filter((id) => isEvolvedFollower(g, id) && aluzard(g, id)).length;
        if (used !== 3) return;
        for (const id of mine) if (g.card(id)?.zone === "field") yield* fx.giveStats(id, 3, 3);
      },
    }),
  ],
});

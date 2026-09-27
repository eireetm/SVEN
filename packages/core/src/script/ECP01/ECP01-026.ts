// ECP01-026 Sweep Tosho — Runecraft follower, 2, 0/1. ウマ娘.
// This card costs 2 less to play if there are at least 5 Umamusume spells in your cemetery.
// ----------
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Select a 1-cost Umamusume spell in your cemetery and put it into your EX area. It costs 1 less to play this turn.
// (元のコスト.)
import { defineCard, fanfare, serveAbility } from "../helpers";
import { inYourZone, isSpell } from "../targets";
import { intoExCheaper, umamusume, umamusumeSpellsInCemetery } from "./shared";

export default defineCard({
  playCost: (g, _self, c) => (umamusumeSpellsInCemetery(g, c) >= 5 ? -2 : 0),
  abilities: [
    serveAbility(1, 1),
    fanfare({
      targets: [inYourZone("cemetery", { filter: (g, id) => isSpell(g, id) && umamusume(g, id) && g.info(id).cost === 1 })],
      *resolve(fx) {
        yield* intoExCheaper(fx, fx.targets[0]!, 1);
      },
    }),
  ],
});

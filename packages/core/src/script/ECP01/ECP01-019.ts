// ECP01-019 Cheval Grand — Runecraft follower, 2, 2/2. ウマ娘.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Select a faceup Carrot in your evolve deck and, if there are at least 10 Umamusume cards in your cemetery, turn it
// facedown. (Facedown again, it can be served, CR 4.6.3.)
import { defineCard, evolveAbility, fanfare, serveAbility } from "../helpers";
import { faceUpCarrot, umamusumeInCemetery } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    serveAbility(1, 1),
    fanfare({
      targets: [faceUpCarrot],
      *resolve(fx) {
        if (umamusumeInCemetery(fx.game, fx.controller) >= 10) yield* fx.turnFacedown(fx.targets[0]!);
      },
    }),
  ],
});

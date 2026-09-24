// BP03-102 Pinion Prince — Havencraft follower, 5, 4/5. 鳥族・童話.
// {[evolve]} {[cost01]}: Evolve.
// {[fanfare]} Select a Fable card in your cemetery, put it into your EX area, and you may put a
// Fable counter on it.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { hasTrait, inYourZone } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [inYourZone("cemetery", { filter: hasTrait("童話") })],
      *resolve(fx) {
        const [id] = yield* fx.putIntoEx(fx.targets[0] ?? []);
        if (id && (yield* fx.confirm())) yield* fx.addCounters(id, "fable", 1);
      },
    }),
  ],
});

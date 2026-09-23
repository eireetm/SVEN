// BP01-054 Ancient Alchemist — Runecraft follower, 3, 2/5.
// {[evolve]}{[cost03]}: Evolve this follower.
// {[fanfare]} Earth Rite: Put 2 Guardform Golem tokens into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(3),
    fanfare({
      earthRite: { mode: "required" },
      *resolve(fx) {
        yield* fx.tokensToEx(["Guardform Golem", "Guardform Golem"]);
      },
    }),
  ],
});

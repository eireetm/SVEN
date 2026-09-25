// BP09-035 Ceridwen, Eternity Hunter — Runecraft follower, 3, 3/3. 錬金術師・禁忌.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]}, Earth Rite: Put an Instant Poison token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      earthRite: { mode: "required" },
      *resolve(fx) {
        yield* fx.tokensToEx(["Instant Poison"]);
      },
    }),
  ],
});

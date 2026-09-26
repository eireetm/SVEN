// BP15-076 Valnareik, Lustful Desire — Abysscraft follower, 2, 2/2. 絶傑・魔界.
// {[evolve]} {[cost01]}: Evolve this.
// While Sanguine is active for you, this has Storm.
// {[fanfare]} If your leader's defense is 7, give this {[attack]}+2/{[defense]}+2.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { sanguineStorm } from "./shared-abyss";

export default defineCard({
  selfKeywords: sanguineStorm,
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, p) => g.state.players[p].leaderDefense === 7,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});

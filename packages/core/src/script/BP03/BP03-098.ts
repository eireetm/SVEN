// BP03-098 Ruby Falcon — Havencraft follower, 3, 3/3. 信仰・鳥族.
// {[evolve]} {[cost01]}: Evolve. Ward.
// {[act]} {[cost02]}: Gain Storm.
// Whenever another follower you control with Storm or Ward attacks, deal 1 to the enemy leader.
import { activated, defineCard, evolveAbility, whenYourFollowerAttacks } from "../helpers";

const stormOrWard = (g: import("../../engine/query").GameReader, id: import("../../model/ids").CardId) => {
  const k = g.info(id).keywords;
  return k.includes("storm") || k.includes("ward");
};

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    activated({ playPoints: 2 }, { *resolve(fx) { yield* fx.giveKeyword(fx.self, "storm"); } }),
    whenYourFollowerAttacks(
      {
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        },
      },
      stormOrWard,
      { another: true },
    ),
  ],
});

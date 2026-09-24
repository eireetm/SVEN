// BP03-099 Ruby Falcon (Evolved) — Havencraft, 4/4.
// Ward. On Evolve: Deal 2 to an enemy follower.
// {[act]} {[cost02]}: Gain Storm.
// Whenever another follower you control with Storm or Ward attacks, deal 1 to the enemy leader.
import { activated, defineCard, onEvolve, whenYourFollowerAttacks } from "../helpers";
import { enemyFollower } from "../targets";

const stormOrWard = (g: import("../../engine/query").GameReader, id: import("../../model/ids").CardId) => {
  const k = g.info(id).keywords;
  return k.includes("storm") || k.includes("ward");
};

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
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

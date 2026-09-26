// BP13-008 Resolve of the Nine-Tailed Fox — Forestcraft spell, 1. 荒野・狩人・獣.
// Choose up to 2. (1) Select a Sekka, Ninefold Blaze on your field and, if there are at least 9 cards in
// your banished zone, give it {[attack]}+2/{[defense]}+2 and Storm. (2) Select a follower with "Sekka" in
// its name on your field and an enemy follower on the field. Give the first follower {[attack]}+2/
// {[defense]}+2 and deal the second follower damage equal to the first's attack.
// (An option once only; each needs its targets, and without any the spell can't be played — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, nameIncludes, named, yourFollower } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modeCount: () => 2,
      modes: [
        {
          id: "blaze",
          label: "(1) Sekka, Ninefold Blaze +2/+2 and Storm with 9 banished cards",
          targets: [yourFollower({ filter: named("Sekka, Ninefold Blaze") })],
          *resolve(fx) {
            const sekka = fx.targets[0]![0]!;
            if (countIn(fx.game, fx.controller, "banished", () => true) < 9 || fx.game.card(sekka)?.zone !== "field") return;
            yield* fx.giveStats(sekka, 2, 2);
            yield* fx.giveKeyword(sekka, "storm");
          },
        },
        {
          id: "strike",
          label: "(2) A Sekka follower +2/+2, then damage equal to its attack",
          targets: [yourFollower({ filter: nameIncludes("Sekka") }), enemyFollower()],
          *resolve(fx) {
            const sekka = fx.targets[0]![0]!;
            const enemy = fx.targets[1]![0]!;
            if (fx.game.card(sekka)?.zone !== "field") return;
            yield* fx.giveStats(sekka, 2, 2);
            yield* fx.dealDamage(enemy, fx.game.info(sekka).attack ?? 0);
          },
        },
      ],
    }),
  ],
});

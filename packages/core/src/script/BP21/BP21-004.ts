// BP21-004 Titania, Queen of Fairies — Forestcraft follower, 3, 1/1. 妖精・プリンセス.
// {[fanfare]} If there are at least 2 Pixie cards in your EX area, search your deck for a Pixie follower not named Titania,
// Queen of Fairies that costs 3 or less, summon it, then shuffle. (元のコスト.)
// {[act]} {[cost01]}, engage this, bury this: Select an enemy follower on the field, destroy it, and its controller summons a
// Fairy token. Activate only if there are 5 Pixie cards in your EX area. (「5枚なら」: the EX area holds 5.)
import { activated, defineCard, fanfare } from "../helpers";
import { costAtMost, enemyFollower, isFollower, named } from "../targets";
import { FAIRY, pixie, pixiesInEx } from "./shared";

const titania = named("Titania, Queen of Fairies");

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        if (pixiesInEx(g, fx.controller) < 2) return;
        yield* fx.search((id) => isFollower(g, id) && pixie(g, id) && !titania(g, id) && costAtMost(3)(g, id), { to: "field" });
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        condition: (g, c) => pixiesInEx(g, c) >= 5,
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const owner = fx.game.controller(target);
          yield* fx.destroy([target]);
          yield* fx.summon([FAIRY], { player: owner });
        },
      },
    ),
  ],
});

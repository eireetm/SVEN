// BP01-041 Arthurian Light — Swordcraft amulet, 2.
// {[act]}{[cost01]}, {[engage]}: Summon a Knight token and give it Storm.
// {[act]}{[cost02]}, {[engage]}: Select an enemy follower on the field and engage it.
// {[act]}{[cost03]}, {[engage]}: Draw a card.
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1, engageSelf: true },
      {
        *resolve(fx) {
          for (const k of yield* fx.summon(["Knight"])) yield* fx.giveKeyword(k, "storm");
        },
      },
    ),
    activated(
      { playPoints: 2, engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.engage(fx.targets[0]!);
        },
      },
    ),
    activated(
      { playPoints: 3, engageSelf: true },
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});

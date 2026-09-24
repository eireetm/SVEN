// BP04-008 Spring-Green Protection — Forestcraft amulet, 1. エルフ族.
// {[act]} {[cost01]}, {[engage]}, put this card into its owner's cemetery: Select a Forestcraft
// follower on your field and give it +0/+1. Combo (3): Give it +1/+0 more. (Activating an ability
// is not playing a card, so it does not count for Combo — ruling.)
// When this card leaves the field, put a Fairy Wisp token into your EX area.
import { activated, defineCard, whenThisLeavesField } from "../helpers";
import { isClass, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: isClass("Forestcraft") })],
        *resolve(fx) {
          const id = fx.targets[0]![0]!;
          yield* fx.giveStats(id, 0, 1);
          if (fx.game.combo(fx.controller, 3)) yield* fx.giveStats(id, 1, 0);
        },
      },
    ),
    whenThisLeavesField({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy Wisp"]);
      },
    }),
  ],
});

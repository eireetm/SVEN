// BP20-009 Supplicant of Unkilling — Forestcraft follower, 1, 1/1. 絶傑・狩人.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If there's an enemy follower on the field with 1 defense, draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollowerWithOneDefense } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (enemyFollowerWithOneDefense(fx.game, fx.controller)) yield* fx.draw(1);
      },
    }),
  ],
});

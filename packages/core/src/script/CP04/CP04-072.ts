// CP04-072 Prank Proclamation — Dragoncraft amulet, 1. プリコネ・リトルリリカル.
// {[fanfare]} Each player draws a card. (A player with an empty deck loses — ruling, CR 5.10.1.1.)
// {[lastwords]} Deal 1 damage to each enemy leader.
import { defineCard, fanfare, lastWords } from "../helpers";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1, fx.controller);
        yield* fx.draw(1, fx.game.opponent(fx.controller));
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* damageEnemyLeader(fx, 1);
      },
    }),
  ],
});

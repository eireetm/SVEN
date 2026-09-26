// BP13-009 Sunbright Elf — Forestcraft follower, 3, 3/3. エルフ族.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Give each Pixie token follower in your EX area {[attack]}+1/{[defense]}+1. (They keep it when
// played, CR 10.6.2.1.3.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { pixieTokenFollower } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        for (const id of fx.game.cards(fx.controller, "ex")) {
          if (pixieTokenFollower(fx.game, id)) yield* fx.giveStats(id, 1, 1);
        }
      },
    }),
  ],
});

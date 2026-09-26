// BP21-063 Dragonborn Striker — Dragoncraft follower, 1, 1/1. ドラゴニュート・学院.
// {[evolve]} {[cost03]}: Evolve this.
// Storm.
// Strike - If there's a card in your EX area with at least 4 passion counters, evolve this. If it has at least 10, give
// this {[defense]}+6.
import { defineCard, evolveAbility, strike } from "../helpers";
import { passionInEx } from "./shared";
import { tenPassionDefense } from "./shared-dragon";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    evolveAbility(3),
    strike({
      *resolve(fx) {
        if (passionInEx(fx.game, fx.controller) >= 4 && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
        yield* tenPassionDefense(fx);
      },
    }),
  ],
});

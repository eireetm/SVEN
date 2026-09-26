// BP17-058 Disrestan, Ocean Harbinger (Evolved) — Dragoncraft follower, 6/6. 海洋.
// On Evolve - Give each enemy follower on the field {[attack]}-X/{[defense]}-X, where X equals the number of Marine cards in
// your EX area.
// {[act]} {[cost02]}, bury a Marine card from your EX area: Give this follower {[attack]}+2/{[defense]}+2 and Storm. Activate
// only once per turn.
import { activated, defineCard, onEvolve } from "../helpers";
import { countIn, marine } from "./shared";
import { buryFromYourEx } from "./shared-dragon";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const x = countIn(fx.game, fx.controller, "ex", marine);
        if (x === 0) return;
        for (const id of fx.game.followers(fx.game.opponent(fx.controller))) yield* fx.giveStats(id, -x, -x);
      },
    }),
    activated(
      { playPoints: 2, custom: buryFromYourEx(marine) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "field") return;
          yield* fx.giveStats(fx.self, 2, 2);
          yield* fx.giveKeyword(fx.self, "storm");
        },
      },
    ),
  ],
});

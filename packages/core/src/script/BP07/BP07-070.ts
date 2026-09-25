// BP07-070 Mono, Garnet Rebel (Evolved) — 5/4.
// Storm.
// {[act]} {[cost02]}, banish an Alpha Drive from your cemetery: Give each Machina follower on your
// field {[attack]}+2/ {[defense]}+2 and Rush. Activate only once per turn.
import { banishFromYour } from "../costs";
import { activated, defineCard } from "../helpers";
import { named } from "../targets";
import { machina } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    activated(
      { playPoints: 2, custom: banishFromYour(["cemetery"], named("Alpha Drive")) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          for (const id of fx.game.followers(fx.controller)) {
            if (!machina(fx.game, id)) continue;
            yield* fx.giveStats(id, 2, 2);
            yield* fx.giveKeyword(id, "rush");
          }
        },
      },
    ),
  ],
});

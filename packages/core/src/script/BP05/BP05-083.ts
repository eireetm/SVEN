// BP05-083 Hamelin — Abysscraft follower, 2, 3/2. 魔界・超克.
// {[fanfare]} Select a token card in your EX area. Put a token of the same name into your EX area.
// (A new token: no counters, stat changes or effects of the selected one — ruling.)
import { defineCard, fanfare } from "../helpers";
import { inYourZone, isToken } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("ex", { filter: isToken })],
      *resolve(fx) {
        const token = fx.targets[0]![0]!;
        if (fx.game.card(token)) yield* fx.tokensToEx([fx.game.info(token).name]);
      },
    }),
  ],
});

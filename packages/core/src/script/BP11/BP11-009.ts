// BP11-009 Varmint Hunter (Evolved) — Forestcraft follower, 4/4. 荒野・狩人.
// On Evolve - Put a Dutiful Steed token into your EX area.
// During your turn, whenever a Mount card is put into your EX area, select an enemy follower on the
// field and deal it 3 damage. (Twice for two at once — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { STEED } from "./shared";
import { varmintShot } from "./shared-forest";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx([STEED]);
      },
    }),
    varmintShot(),
  ],
});

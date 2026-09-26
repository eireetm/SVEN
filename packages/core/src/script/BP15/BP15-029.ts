// BP15-029 Adherent of Hollowness (Evolved) — Swordcraft follower, 3/3. 絶傑・盗賊.
// On Evolve - Put a Gilded Blade token into your EX area.
// Once per turn, when you play a Loot card, put a Gilded Boots token into your EX area. (Also during the
// opponent's turn — ruling.)
import { defineCard, onEvolve, whenYouPlay } from "../helpers";
import { GILDED_BLADE, GILDED_BOOTS, loot } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx([GILDED_BLADE]);
      },
    }),
    whenYouPlay(
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.tokensToEx([GILDED_BOOTS]);
        },
      },
      loot,
    ),
  ],
});

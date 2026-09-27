// CP03-026 Soul Saver Dragon (Evolved) — 5/5. (Evolved from CP03-025, which names it.)
// Twin Drive.
// On Evolve - Select up to 2 other Royal Paladin followers on your field and give them {[attack]}+2/{[defense]}+2.
import { defineCard, onEvolve } from "../helpers";
import { anotherYourFollower } from "../targets";
import { royalPaladin } from "./shared";

export default defineCard({
  keywords: ["twinDrive"],
  abilities: [
    onEvolve({
      targets: [anotherYourFollower({ count: 2, upTo: true, filter: royalPaladin })],
      *resolve(fx) {
        for (const id of fx.targets[0] ?? []) yield* fx.giveStats(id, 2, 2);
      },
    }),
  ],
});

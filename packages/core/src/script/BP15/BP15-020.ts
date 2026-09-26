// BP15-020 Octrice, Hollow Usurpation — Swordcraft follower, 3, 3/3. 絶傑・盗賊.
// {[fanfare]} Put a Remnant of Hollowness token into your EX area.
// {[act]} {[cost00]}: The next Loot card you play this turn costs 2 less. Activate only twice per turn. (Twice
// before playing one: 4 less — ruling.)
// Activate Banish an Octrice, Omen of Usurpation from your cemetery: Put a Gilded Blade, Gilded Goblet, or Gilded
// Boots token into your EX area.
import { banishFromYour } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { GILDED_BLADE, GILDED_BOOTS, GILDED_GOBLET, loot } from "./shared";

export default defineCard({
  nextPlay: { loot: (g, card) => loot(g, card) },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Remnant of Hollowness"]);
      },
    }),
    activated(
      {},
      {
        timesPerTurn: 2,
        *resolve(fx) {
          yield* fx.nextPlayCostsLess("loot", 2);
        },
      },
    ),
    activated(
      { custom: banishFromYour(["cemetery"], named("Octrice, Omen of Usurpation"), 1) },
      {
        *resolve(fx) {
          const [token] = yield* fx.choose([GILDED_BLADE, GILDED_GOBLET, GILDED_BOOTS].map((name) => ({ id: name, label: name })));
          if (token !== undefined) yield* fx.tokensToEx([token]);
        },
      },
    ),
  ],
});

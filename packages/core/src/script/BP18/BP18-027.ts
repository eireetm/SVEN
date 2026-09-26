// BP18-027 Gigabyte Blade — Swordcraft amulet, 1. 透京・探偵.
// This can't be destroyed or banished by abilities. (Burying it still works — ruling; CR 1.3.3.)
// {[fanfare]} Place 2 gigabyte counters on each Gigabyte Blade on your field. If there's another Gigabyte Blade on your
// field, bury this.
// Whenever a Togh Keyoh follower is put onto your field or a follower on your field evolves, place a gigabyte counter on
// each Gigabyte Blade on your field. (During the opponent's turn too — rulings.)
import { defineCard, fanfare, whenFollowerEntersYourField, whenYourFollowerEvolves } from "../helpers";
import { bladesOnField, chargeBlades, toghKeyoh } from "./shared";

export default defineCard({
  cannotBeDestroyedByAbilities: true,
  cannotBeBanishedByAbilities: true,
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* chargeBlades(fx, 2);
        if (bladesOnField(fx.game, fx.controller).some((id) => id !== fx.self) && fx.game.card(fx.self)?.zone === "field") {
          yield* fx.bury([fx.self]);
        }
      },
    }),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          yield* chargeBlades(fx, 1);
        },
      },
      { filter: toghKeyoh },
    ),
    whenYourFollowerEvolves({
      *resolve(fx) {
        yield* chargeBlades(fx, 1);
      },
    }),
  ],
});

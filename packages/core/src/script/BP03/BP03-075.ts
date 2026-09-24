// BP03-075 Masquerade Ghost (Evolved) — Abysscraft, 5/5.
// Whenever a Ghost is put onto your field, +1 attack.
// Whenever a Ghost you control leaves the field, summon a Gargantuan Ghost.
// A card whose name is also Ghost counts (it had that name on the field). Gargantuan Ghost does not.
// {[lastwords]} Put this card into its owner's EX area.
import type { GameEvent } from "../../events/types";
import type { TriggerSubject } from "../types";
import type { GameReader } from "../../engine/query";
import { defineCard, lastWords, whenFollowerEntersYourField } from "../helpers";
import { named } from "../targets";

function isGhostOnField(game: GameReader, abilityDef: string, printed: string): boolean {
  const def = game.db.get(abilityDef || printed);
  return def.name === "Ghost" || def.text.en.includes("name is also Ghost");
}

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const id = fx.data?.card;
          if (id) yield* fx.giveStats(id, 1, 0);
        },
      },
      { filter: named("Ghost") },
    ),
    {
      kind: "automatic",
      timing: "other",
      trigger: (e: GameEvent, me: TriggerSubject, game: GameReader) => {
        if (me.lookBack || e.type !== "cardsMoved") return [];
        return e.moves
          .filter(
            (m) =>
              m.card !== me.card &&
              m.from?.zone === "field" &&
              m.to.zone !== "field" &&
              m.before?.controller === me.controller &&
              isGhostOnField(game, m.before.abilityDef, m.def),
          )
          .map(() => ({}));
      },
      *resolve(fx) {
        yield* fx.summon(["Gargantuan Ghost"]);
      },
    },
    lastWords({
      *resolve(fx) {
        yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});

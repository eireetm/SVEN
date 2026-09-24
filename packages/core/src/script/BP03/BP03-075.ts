// BP03-075 Masquerade Ghost (Evolved) — Abysscraft, 5/5.
// Whenever a Ghost is put onto your field, +1 attack.
// Whenever a Ghost you control leaves the field, summon a Gargantuan Ghost.
// A card whose name is also Ghost counts: the names it had on the field are used (CR 10.7.4.1.2).
// Gargantuan Ghost does not. It also triggers when this card leaves the field at the same time
// as the Ghost, e.g. both destroyed by one effect (CR 10.7.4.2).
// {[lastwords]} Put this card into its owner's EX area.
import type { GameEvent } from "../../events/types";
import type { TriggerSubject } from "../types";
import { defineCard, lastWords, whenFollowerEntersYourField } from "../helpers";
import { named } from "../targets";

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
      trigger: (e: GameEvent, me: TriggerSubject) => {
        if (e.type !== "cardsMoved") return [];
        return e.moves
          .filter(
            (m) =>
              m.card !== me.card &&
              m.from?.zone === "field" &&
              m.to.zone !== "field" &&
              m.before?.controller === me.controller &&
              m.before.names.includes("Ghost"),
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

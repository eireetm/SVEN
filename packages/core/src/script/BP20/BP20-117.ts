// BP20-117 Tablet of Tribulations — Neutral amulet, 1. 絶傑.
// {[act]} {[cost09]}, engage this, bury this: Search your deck for up to 10 Omen followers with "Mjerrabaine," "Lishenna,"
// "Rulenye," "Marwynn," "Galmieux," "Izudia," "Valnareik," "Octrice," "Raio," or "Gilnelise" in their different card names.
// You may summon any number of them and put any number of them into your EX area, then shuffle. (At most as many as the
// field and the EX area hold, 5 each — rulings; the others stay in the deck.)
import type { SearchDestination } from "../../engine/effects/context";
import { activated, defineCard } from "../helpers";
import { isFollower, nameIncludes } from "../targets";
import { omen } from "./shared";

const NAMES = ["Mjerrabaine", "Lishenna", "Rulenye", "Marwynn", "Galmieux", "Izudia", "Valnareik", "Octrice", "Raio", "Gilnelise"];

export default defineCard({
  abilities: [
    activated(
      { playPoints: 9, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          const g = fx.game;
          const p = fx.controller;
          let fieldRoom = g.fieldLimit(p) - g.cards(p, "field").length;
          let exRoom = g.exAreaLimit(p) - g.cards(p, "ex").length;
          yield* fx.search((id) => isFollower(g, id) && omen(g, id) && NAMES.some((n) => nameIncludes(n)(g, id)), {
            max: 10,
            distinctNames: true,
            *destination() {
              const options = [
                ...(fieldRoom > 0 ? [{ id: "field", label: "Summon it" }] : []),
                ...(exRoom > 0 ? [{ id: "ex", label: "Put it into your EX area" }] : []),
                { id: "deck", label: "Leave it in your deck" },
              ];
              const [pick] = options.length > 1 ? yield* fx.choose(options) : ["deck"];
              if (pick === "field") fieldRoom -= 1;
              if (pick === "ex") exRoom -= 1;
              return (pick ?? "deck") as SearchDestination;
            },
          });
        },
      },
    ),
  ],
});

// BP03-056 Lævateinn Dragon — Dragoncraft follower, 6, 5/5. 竜族・武装.
// {[evolve]} {[cost01]}: Evolve this follower into an evolved follower with "Lævateinn Dragon"
// in its name (CR 5.16.1.1.1 — specified otherwise than the same name).
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility({ playPoints: 1 }, { nameIncludes: "Lævateinn Dragon" })],
});

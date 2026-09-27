// CP01-072 Mejiro Ryan — Havencraft follower, 2, 3/2. ウマ娘・メジロ家.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// When an amulet or Mejiro Family follower you control leaves the field, give this follower Storm. (Only while this is on the
// field; any amulet — rulings.)
import { defineCard, serveAbility, whenYourCardLeaves } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    whenYourCardLeaves(
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
        },
      },
      { filter: (m) => m.before?.type === "amulet" || (m.before?.type === "follower" && (m.before.traits ?? []).includes("メジロ家")) },
    ),
  ],
});

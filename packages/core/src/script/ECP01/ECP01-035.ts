// ECP01-035 Nishino Flower — Dragoncraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// On Race - Give this follower {[attack]}+1/{[defense]}+1. Search your deck for a Seiun Sky, summon it, then shuffle.
import { defineCard, onRace, serveAbility } from "../helpers";
import { named } from "../targets";
import { plusOneThis } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        yield* plusOneThis(fx);
        yield* fx.search((id) => named("Seiun Sky")(fx.game, id), { to: "field" });
      },
    }),
  ],
});

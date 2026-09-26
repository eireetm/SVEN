// BP16-080 Mukan, Shadowcrypt Ward (Evolved) — Abysscraft follower, 4/4. 死霊術師・魔界.
// Whenever a Departed follower is put onto your field, give your leader {[defense]}+1. (Each copy triggers, also
// during the opponent's turn — rulings.)
// On Evolve - Select a Departed follower in your cemetery that costs 3 or less and summon it.
// On Super-Evolve - Select a Departed follower in your cemetery that costs 3 or less. Summon it and give it Assail.
import { defineCard, whenFollowerEntersYourField } from "../helpers";
import { departed } from "./shared";
import { mukanRaise } from "./shared-abyss";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      { filter: departed },
    ),
    mukanRaise("onEvolve"),
    mukanRaise("onSuperEvolve"),
  ],
});

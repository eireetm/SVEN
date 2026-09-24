// BP03-011 Wood of Brambles — Forestcraft amulet, 1. 妖精.
// {[fanfare]} Summon a Fairy. Combo (3): Give it Rush. (Summoning is not playing — ruling.)
// At the start of your main phase, destroy this card.
// While this is on your field, your followers have Follower Strike: deal 2 to the enemy follower.
// The 2 damage is not a select, so it hits through Aura (ruling), and it resolves before combat
// damage (CR 8.4.6 then 8.4.9), so a 2-defense defender is destroyed with no exchange (ruling).
import type { GameEvent } from "../../events/types";
import type { TriggerSubject } from "../types";
import type { GameReader } from "../../engine/query";
import { atStartOfYourMainPhase, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const [fairy] = yield* fx.summon(["Fairy"]);
        if (fairy && fx.game.combo(fx.controller, 3)) yield* fx.giveKeyword(fairy, "rush");
      },
    }),
    atStartOfYourMainPhase({
      *resolve(fx) {
        yield* fx.destroy([fx.self]);
      },
    }),
    {
      kind: "automatic",
      timing: "strike",
      trigger: (e: GameEvent, me: TriggerSubject, game: GameReader) =>
        !me.lookBack &&
        e.type === "attackDeclared" &&
        e.player === me.controller &&
        game.card(e.target)?.zone === "field",
      *resolve(fx) {
        if (fx.event?.type === "attackDeclared") yield* fx.dealDamage(fx.event.target, 2);
      },
    },
  ],
});

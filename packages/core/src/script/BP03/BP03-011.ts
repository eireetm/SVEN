// BP03-011 Wood of Brambles — Forestcraft amulet, 1. 妖精.
// {[fanfare]} Summon a Fairy. Combo (3): Give it Rush. (Summoning is not playing — ruling.)
// At the start of your main phase, destroy this card.
// While this is on your field, your followers have "Follower Strike: Deal 2 damage to the enemy
// follower." It is the follower's ability, so the follower deals the damage (CR 10.9.1.2). The 2
// damage is not a select, so it hits through Aura (ruling), and it resolves before combat damage
// (CR 8.4.6 then 8.4.9), so a 2-defense defender is destroyed with no exchange (ruling).
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
  ],
  field: {
    grantsFor: (g, self, card) =>
      g.card(card)?.controller === g.controller(self) && g.info(card).type === "follower" ? ["followerStrike2"] : [],
  },
});

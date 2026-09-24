// BP02-067 Twin-Headed Dragon — Dragoncraft follower, 4, 2/5.
// {[fanfare]} {[cost03]} Summon a Dragon token. (Optional play-point cost, CR 10.4.7.4.)
// This follower deals double attack damage to leaders and double combat damage to followers.
// (A replacement effect, CR 5.14.2; attack damage 5.14.3.1, combat damage 5.14.3.2 — both ways in
// a fight; ability damage is not doubled.)
import { defineCard, fanfare } from "../helpers";
import { playPointsCost } from "../costs";

export default defineCard({
  field: { damageDealt: (_g, _self, d) => (d.kind === "attack" || d.combat ? d.amount : 0) },
  abilities: [
    fanfare({
      cost: playPointsCost(3),
      *resolve(fx) {
        yield* fx.summon(["Dragon"]);
      },
    }),
  ],
});

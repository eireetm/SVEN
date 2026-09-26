// BP19-040 Simael, Cleansing Enforcer — Runecraft follower, 10, 3/5. 八獄・魔法使い.
// This costs 1 less to play for every pair of a Mage follower and a Mage spell in your cemetery. (2 each: 2 less — ruling.)
// Storm. Bane. Ward.
import { defineCard } from "../helpers";
import { isFollower, isSpell } from "../targets";
import { mage } from "./shared";

export default defineCard({
  keywords: ["storm", "bane", "ward"],
  playCost: (g, _self, p) => {
    const cemetery = g.cards(p, "cemetery").filter((id) => mage(g, id));
    return -Math.min(cemetery.filter((id) => isFollower(g, id)).length, cemetery.filter((id) => isSpell(g, id)).length);
  },
});

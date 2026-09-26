// BP17-023 Frenzied Corpsmaster — Swordcraft follower, 8, 4/4. 指揮官.
// This costs 6 less to play if there are at least 3 Officer token followers on your field with different names.
// ----------
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[act]} {[cost01]}, discard this: Summon a Steelclad Knight, Shield Guardian, or Knight token. (Valid in the hand —
// ruling.)
import { discardThis } from "../costs";
import { activated, defineCard, evolveAbility } from "../helpers";
import { officerTokenNames } from "./shared";
import { summonOneOfficerToken } from "./shared-sword";

export default defineCard({
  playCost: (g, _self, p) => (officerTokenNames(g, p) >= 3 ? -6 : 0),
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    activated({ playPoints: 1, custom: discardThis }, { validIn: ["hand"], resolve: summonOneOfficerToken }),
  ],
});

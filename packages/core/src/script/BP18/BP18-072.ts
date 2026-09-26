// BP18-072 Lightning-Clawed Loafer (Evolved) — 4/4.
// While there's another Draconic Duelist follower on your field, this has Assail.
// At the start of your end phase, return this to its owner's hand.
import { defineCard } from "../helpers";
import { loaferPassive, loaferReturn } from "./shared-dragon";

export default defineCard({
  field: { keywordsFor: loaferPassive(["assail"]) },
  abilities: [loaferReturn],
});

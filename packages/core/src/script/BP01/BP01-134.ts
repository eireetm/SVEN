// BP01-134 Temple Defender — Havencraft follower, 3, 3/3.
// Ward. // Reduce damage dealt to this follower by 1. (All damage — ruling; a replacement effect,
// CR 5.14.2, 10.2.1.3.2.)
import { defineCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  field: { damageTaken: () => -1 },
});

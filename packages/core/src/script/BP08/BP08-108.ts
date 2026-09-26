// BP08-108 Tart Man — Neutral follower, 4, 4/4. 光輝.
// Fanfare: search for any one card without revealing it. If the deck is nonempty, one must be
// found (rulings; CR 5.8.1.1, 5.8.1.2).
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({ *resolve(fx) { yield* fx.search(() => true, { reveal: false, required: true }); } }),
  ],
});

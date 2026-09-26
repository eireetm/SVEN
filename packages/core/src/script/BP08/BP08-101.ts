// BP08-101 Angel of the Iron Steed — Havencraft follower, 4, 3/4. 信仰・超克.
// Ward. Fanfare: summon a Mystic Artifact token. CR 5.5, 9.1.2.3, 12.8.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [fanfare({ *resolve(fx) { yield* fx.summon(["Mystic Artifact"]); } })],
});

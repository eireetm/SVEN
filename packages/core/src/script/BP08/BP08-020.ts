// BP08-020 Dionne, Dancing Blade (Evolved) — Swordcraft follower, 3/3. 兵士・ダンサー.
// Storm. Strike: refresh this follower. This ability works twice per turn. CR 10.7.2.2, 12.7, 12.9.
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [strike({ timesPerTurn: 2, *resolve(fx) { yield* fx.refresh([fx.self]); } })],
});

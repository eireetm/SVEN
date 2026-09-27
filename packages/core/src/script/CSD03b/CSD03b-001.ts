// CSD03b-001 Dragonic Overlord — Dragoncraft follower, 4, 4/4. ヴァンガード・かげろう.
// {[evolve]} {[cost01]}: Evolve this follower.
// Twin Drive.
// While Overflow is active for you, and there's another Kagero follower on your field, this follower has Storm.
import { defineCard, evolveAbility } from "../helpers";
import { overlordStorm } from "./shared";

export default defineCard({
  keywords: ["twinDrive"],
  selfKeywords: overlordStorm,
  abilities: [evolveAbility(1)],
});

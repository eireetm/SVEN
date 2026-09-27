// CSD03a-001 Alfred Early — Swordcraft follower, 4, 3/3. ヴァンガード・ロイヤルパラディン.
// {[evolve]} {[cost02]}: Evolve this follower into a King of Knights, Alfred. (CR 5.16.1.1.1.)
// Storm. Twin Drive.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["storm", "twinDrive"],
  abilities: [evolveAbility(2, { into: ["King of Knights, Alfred"] })],
});

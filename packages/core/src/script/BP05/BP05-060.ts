// BP05-060 Cursed Stone — Dragoncraft follower, 2, 2/2. 巨人・超克.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [evolveAbility(1)],
});

// BP13-057 Godfire Phoenix — Dragoncraft follower, 2, 5/5. 不死鳥.
// {[evolve]} {[cost01]}: Evolve this follower. Activate only if Overflow is active for you.
// This follower can't attack enemies.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  cannotAttack: true,
  abilities: [evolveAbility(1, { condition: (g, p) => g.overflow(p) })],
});

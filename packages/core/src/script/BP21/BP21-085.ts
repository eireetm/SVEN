// BP21-085 Bonebreaker Bladesman — Abysscraft follower, 2, 1/3. 死者・キラー.
// {[evolve]} {[cost05]}: Evolve this.
// Assail.
// Follower Strike - Deal each enemy leader damage equal to this follower's attack. (CR 12.7.2.1.)
import { defineCard, evolveAbility } from "../helpers";
import { bonebreakerStrike } from "./shared-abyss";

export default defineCard({
  keywords: ["assail"],
  abilities: [evolveAbility(5), bonebreakerStrike],
});

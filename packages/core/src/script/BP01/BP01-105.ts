// BP01-105 Righteous Devil — Abysscraft follower, 4, 2/4.
// {[evolve]} Give your leader -3 defense: Evolve this follower. // Bane.
// (The cost has no play points, so no evolution point can be used, CR 12.2.3; needs 3 defense,
// CR 10.4.5.)
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["bane"], abilities: [evolveAbility({ leaderDefense: 3 })] });

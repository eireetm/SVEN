// BP04-075 Hippocampus — Dragoncraft follower, 3, 1/5. 海洋.
// {[evolve]} {[cost04]}: Evolve this follower. Ward. (The evolved card has no abilities — ruling.)
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(4)] });

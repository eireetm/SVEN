// BP02-110 Archangel Reina — Neutral follower, 4, 4/5.
// {[evolve]}{[cost01]}: Evolve this follower. // Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(1)] });

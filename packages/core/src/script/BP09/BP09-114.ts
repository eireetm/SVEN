// BP09-114 Valkyrie of Chaos — Neutral follower, 3, 3/3. 堕天使・キラー.
// {[evolve]} {[cost01]}: Evolve this follower.
// Rush.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["rush"], abilities: [evolveAbility(1)] });

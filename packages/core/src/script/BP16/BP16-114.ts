// BP16-114 Phildau, Lionheart Ward — Neutral follower, 3, 3/3. シンガー・光輝.
// {[evolve]} {[cost01]}: Evolve this.
// Ward
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(1)] });

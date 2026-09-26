// BP12-093 Holylight Convert — Havencraft follower, 4, 1/4. 信仰.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// At the start of your end phase, give this follower {[attack]}+X, where X equals the number of followers
// with Ward on your field.
import { defineCard, evolveAbility } from "../helpers";
import { convertEndPhase } from "./shared-haven";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(1), convertEndPhase] });

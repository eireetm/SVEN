// BP05-110 Rosa, Mech Wing Maiden — Neutral follower, 2, 1/3. 天使・超克.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [evolveAbility(1)],
});

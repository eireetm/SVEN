// BP14-020 Mars, Belligerent Flame — Swordcraft follower, 3, 2/3. 指揮官・星神.
// {[evolve]} {[cost01]}: Evolve this.
// Bane.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["bane"], abilities: [evolveAbility(1)] });

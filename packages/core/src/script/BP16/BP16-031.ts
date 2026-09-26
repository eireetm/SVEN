// BP16-031 Flashstep Quickblader — Swordcraft follower, 1, 1/1. 兵士.
// {[evolve]} {[cost01]}: Evolve this.
// Storm.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["storm"], abilities: [evolveAbility(1)] });

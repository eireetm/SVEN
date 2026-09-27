// SD02-012 Quickblader — Swordcraft follower, 1, 1/1. 兵士.
// {[evolve]} {[cost03]}: Evolve this follower.
// Storm
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["storm"], abilities: [evolveAbility(3)] });

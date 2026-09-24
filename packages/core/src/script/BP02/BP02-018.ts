// BP02-018 Albert, Levin Saber — Swordcraft follower, 4, 3/5.
// {[evolve]}{[cost03]}: Evolve this follower. // Storm.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["storm"], abilities: [evolveAbility(3)] });

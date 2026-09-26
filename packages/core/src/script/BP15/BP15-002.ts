// BP15-002 Amataz, Reverse Blader — Forestcraft follower, 2, 2/2. エルフ族・精霊.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(1)] });

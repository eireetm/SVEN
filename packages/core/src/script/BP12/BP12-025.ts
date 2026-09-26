// BP12-025 Nano, the Dawnblade — Swordcraft follower, 1, 1/1. 兵士・超克.
// {[evolve]} {[cost01]}: Evolve this follower.
// Bane.
// While there's a Lecia, Sky Saber on your field, this follower has Assail. (A passive: it follows
// Lecia; an attack already declared goes on without it — rulings.)
import { defineCard, evolveAbility } from "../helpers";
import { nanoAssail } from "./shared-sword";

export default defineCard({ keywords: ["bane"], selfKeywords: nanoAssail, abilities: [evolveAbility(1)] });

// BP11-063 Mermaid Guide — Dragoncraft follower, 4, 4/4. 海洋.
// {[evolve]} {[cost01]}: Evolve this follower.
// While there are at least 5 Marine cards in your cemetery, this follower has Storm.
import { defineCard, evolveAbility } from "../helpers";
import { stormWithFiveMarines } from "./shared-mermaid";

export default defineCard({ selfKeywords: stormWithFiveMarines, abilities: [evolveAbility(1)] });

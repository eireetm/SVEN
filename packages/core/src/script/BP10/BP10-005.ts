// BP10-005 Chipper Skipper — Forestcraft follower, 2, 1/1. アルカナ・エルフ族.
// {[evolve]} {[cost01]}: Evolve this follower.
// Whenever a Mercenary follower is put onto your field, give it {[attack]}+1/{[defense]}+1 and Rush.
import { defineCard, evolveAbility } from "../helpers";
import { mercenaryGetsRush } from "./shared";

export default defineCard({ abilities: [evolveAbility(1), mercenaryGetsRush] });

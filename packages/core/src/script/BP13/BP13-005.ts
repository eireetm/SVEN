// BP13-005 Nelcha, Fashion Hazard — Forestcraft follower, 2, 2/2. エルフ族・キラー.
// {[evolve]} {[cost01]}: Evolve this follower.
// Strike - Select an enemy follower on the field. If there are at least 5 {[forestcraft]} spells with
// different names in your cemetery, give it {[attack]}-2/{[defense]}-2 and give this follower {[attack]}+2/
// {[defense]}+2 (Both under the condition, as the English says; not played without a target — ruling.)
import { defineCard, evolveAbility } from "../helpers";
import { nelchaStrike } from "./shared-forest";

export default defineCard({ abilities: [evolveAbility(1), nelchaStrike] });

// BP12-059 Assault Dragoon — Dragoncraft follower, 2, 2/2. 竜使い.
// {[evolve]} {[cost02]}: Evolve this follower.
// Activate {[engage]}: Select a {[dragoncraft]} follower that costs 2 or less on your field. Give it
// {[attack]} +1/{[defense]}+1 and Storm. (元のコスト: this card itself too.)
import { defineCard, evolveAbility } from "../helpers";
import { dragoonBoost } from "./shared-dragon";

export default defineCard({ abilities: [evolveAbility(2), dragoonBoost] });

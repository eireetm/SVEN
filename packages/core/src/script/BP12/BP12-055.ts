// BP12-055 Steelcap Pachycephalosaurus — Dragoncraft follower, 2, 2/2. 自然・竜族.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[lastwords]} Summon a Naterran Great Tree token.
import { defineCard, evolveAbility } from "../helpers";
import { summonTreeLastWords } from "./shared";

export default defineCard({ abilities: [evolveAbility(1), summonTreeLastWords] });

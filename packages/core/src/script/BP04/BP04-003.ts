// BP04-003 Deepwood Anomaly — Forestcraft follower, 7, 8/8. 植物族.
// {[evolve]} {[cost01]}: Evolve this follower.
// When this follower deals attack damage to an enemy leader, you win the game (CR 5.23.1).
import { defineCard, evolveAbility } from "../helpers";
import { winOnLeaderAttackDamage } from "./shared";

export default defineCard({ abilities: [evolveAbility(1), winOnLeaderAttackDamage] });

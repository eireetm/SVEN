// BP14-074 Anisage, Lost Forsaken — Abysscraft follower, 2, 2/2. 宴楽・死者.
// When this is discarded or banished from your hand, you may put it into your EX area.
// ----------
// {[evolve]} {[cost01]}: Evolve this.
import { defineCard, evolveAbility } from "../helpers";
import { anisageToEx } from "./shared-abyss";

export default defineCard({ abilities: [anisageToEx, evolveAbility(1)] });

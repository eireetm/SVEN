// BP10-078 Deathbringer — Abysscraft follower, 8, 7/7. アルカナ・死者.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field. Destroy it, deal 2 damage to its leader and give
// your leader {[defense]}+2. (Without a target none of it happens — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { deathbringer } from "./shared";

export default defineCard({ abilities: [evolveAbility(1), fanfare(deathbringer)] });

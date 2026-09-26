// BP10-079 Deathbringer (Evolved) — Abysscraft follower, 8/8. アルカナ・死者.
// On Evolve - Select an enemy follower on the field. Destroy it, deal 2 damage to its leader and give
// your leader {[defense]}+2. (Without a target none of it happens — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { deathbringer } from "./shared";

export default defineCard({ abilities: [onEvolve(deathbringer)] });

// BP13-108 Miriam, Mutinous Being — Neutral follower, 2, 2/2. 超克・キラー.
// {[evolve]} {[cost02]}: Evolve this follower.
// During your turn, whenever a follower is put from your field into the cemetery, deal 1 damage to each
// enemy leader.
import { defineCard, evolveAbility } from "../helpers";
import { miriamBurn } from "./shared-neutral";

export default defineCard({ abilities: [evolveAbility(2), miriamBurn] });

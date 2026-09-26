// BP14-004 Bastion of Seasons — Forestcraft follower, 4, 2/4. 精霊・植物族.
// {[evolve]} {[cost01]}: Evolve this.
// While this has 3 seasonal counters or less, it can't attack enemies. (Neither leaders nor followers —
// ruling.)
// At the start of your end phase, select a follower on the field. Give it {[attack]}+X/{[defense]}+X or deal
// it X damage, and place a seasonal counter on this. X equals this follower's attack.
import { defineCard, evolveAbility } from "../helpers";
import { seasonsCantAttack, seasonsEndPhase } from "./shared-forest";

export default defineCard({ cannotAttack: seasonsCantAttack, abilities: [evolveAbility(1), seasonsEndPhase] });

// BP19-042 Obsessive Scholar — Runecraft follower, 3, 2/2. 八獄・錬金術師・禁忌.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Remove a fusion counter from this: Summon a Multi-Headed Test Subject token. (CR 10.4.7.4.)
// Activate, Fusion 1 non-token follower: Put a fusion counter on this. (CR 12.18; valid in the hand — ruling. The official
// English calls the token "Chimera Test Subject".)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { fuseForCounter, fusionFanfare } from "./shared-rune";

export default defineCard({
  abilities: [evolveAbility(1), fanfare(fusionFanfare), fuseForCounter()],
});

// BP19-046 Devoted Researcher — Runecraft follower, 2, 1/1. 八獄・錬金術師・禁忌.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Remove a fusion counter from this: Summon a Multi-Headed Test Subject token. (CR 10.4.7.4.)
// Activate, Fusion 1 non-token follower: Put a fusion counter on this. (CR 12.18; valid in the hand — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { fuseForCounter, fusionFanfare } from "./shared-rune";

export default defineCard({
  abilities: [evolveAbility(1), fanfare(fusionFanfare), fuseForCounter()],
});

// BP19-038 Sephie, Depraved Convict — Runecraft follower, 4, 3/3. 八獄・錬金術師・禁忌.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Remove a fusion counter from this: Summon a Multi-Headed Test Subject token. (CR 10.4.7.4.)
// Activate, Fusion 1 non-token follower: Put a fusion counter on this. If you fused with a Condemned follower, draw a card.
// (CR 12.18; valid in the hand — ruling.)
import { fusedCards } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { condemnedFollower } from "./shared";
import { fuseForCounter, fusionFanfare } from "./shared-rune";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare(fusionFanfare),
    fuseForCounter(function* (fx) {
      if (fusedCards(fx.memory).some((id) => condemnedFollower(fx.game, id))) yield* fx.draw(1);
    }),
  ],
});

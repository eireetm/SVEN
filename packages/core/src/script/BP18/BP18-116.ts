// BP18-116 Bansai Suzuki, Deacon Shinobi — Neutral follower, 6, 5/5. 透京・区役所.
// Rush. Assail. Ward.
// {[fanfare]} {[cost02]} Summon a Bansai Suzuki, Clone Technique token. (CR 10.4.7.4.)
// At the start of your end phase, summon a Bansai Suzuki, Clone Technique token.
// Activate Discard a Togh Keyoh card: For the rest of this turn, each Bansai Suzuki, Deacon Shinobi and Bansai Suzuki, Clone
// Technique on your field doesn't take damage. (Those on the field then — ruling; "-2/-2" isn't damage — ruling.)
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { discardA, playPointsCost } from "../costs";
import { activated, atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { toghKeyoh } from "./shared";

const CLONE = "Bansai Suzuki, Clone Technique";
const bansai = (g: GameReader, id: CardId) => named("Bansai Suzuki, Deacon Shinobi")(g, id) || named(CLONE)(g, id);

export default defineCard({
  keywords: ["rush", "assail", "ward"],
  abilities: [
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.summon([CLONE]);
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.summon([CLONE]);
      },
    }),
    activated(
      { custom: discardA(toghKeyoh) },
      {
        *resolve(fx) {
          for (const id of fx.game.followers(fx.controller).filter((c) => bansai(fx.game, c))) yield* fx.preventDamage(id, "all", "endOfTurn");
        },
      },
    ),
  ],
});

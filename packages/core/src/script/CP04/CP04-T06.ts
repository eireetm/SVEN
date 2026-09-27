// CP04-T06 Chaos Grimoire — Runecraft equipment token, 2. プリコネ・美食殿.
// The equipped follower has "2 times per turn, when you play a spell, deal each enemy leader damage equal to half this follower's
// attack (rounded up)." (CR 10.7.2.2; its attack when the ability resolves. The follower's own ability — lost with its abilities.)
// (Place this beneath the equipped follower.)
import { defineCard, whenYouPlay } from "../helpers";
import { isSpell } from "../targets";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  equipment: {
    abilities: [
      whenYouPlay(
        {
          timesPerTurn: 2,
          *resolve(fx) {
            const attack = fx.game.card(fx.self) ? (fx.game.info(fx.self).attack ?? 0) : 0;
            yield* damageEnemyLeader(fx, Math.ceil(attack / 2));
          },
        },
        isSpell,
      ),
    ],
  },
});

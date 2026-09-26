// BP11-040 Transcendent Simulacrum — Runecraft follower, 2, 2/2. 禁忌.
// {[fanfare]} Select a Golem follower in your cemetery and add it to your hand.
// Activate {[engage]}: Select a Golem follower on your field and give it {[attack]}+1/{[defense]}+1.
import { activated, defineCard, fanfare } from "../helpers";
import { and, hasTrait, inYourZone, isFollower, yourFollower } from "../targets";

const golem = hasTrait("ゴーレム");

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(isFollower, golem) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [yourFollower({ filter: golem })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        },
      },
    ),
  ],
});

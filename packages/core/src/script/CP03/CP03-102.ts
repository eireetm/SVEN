// CP03-102 Gururubau — Abysscraft spell, 4. ヴァンガード・シャドウパラディン.
// {[quick]}
// Select an enemy follower on the field and up to 1 Shadow Paladin follower in your cemetery. Destroy the first follower and add
// the second to your hand. (Not playable without an enemy follower; playable with no Shadow Paladin follower in the cemetery —
// ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, inYourZone } from "../targets";
import { followerThat, shadowPaladin } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower(), inYourZone("cemetery", { upTo: true, filter: followerThat(shadowPaladin) })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.returnToHand(fx.targets[1] ?? []);
      },
    }),
  ],
});

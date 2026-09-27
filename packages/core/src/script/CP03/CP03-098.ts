// CP03-098 Abyss Freezer — Abysscraft follower, 2, 3/2. ヴァンガード・シャドウパラディン. Draw Trigger.
// {[fanfare]} Discard a Shadow Paladin card: Select a Shadow Paladin follower in your cemetery and add it to your hand. (The target
// is selected before the cost is paid, so not the discarded card — ruling.)
// ----------
// (If this card is revealed by a drive check, draw a card.) (Resolved by the engine.)
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { inYourZone } from "../targets";
import { followerThat, shadowPaladin } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(shadowPaladin),
      targets: [inYourZone("cemetery", { filter: followerThat(shadowPaladin) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});

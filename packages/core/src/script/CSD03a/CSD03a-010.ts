// CSD03a-010 Lake Maiden, Lien — Swordcraft follower, 2, 2/3. ヴァンガード・ロイヤルパラディン.
// Ward.
// {[fanfare]} Discard a Royal Paladin card: Select a Royal Paladin follower in your cemetery and add it to your hand. (The follower
// is selected before the cost is paid, so not the discarded card — ruling, CR 10.6.2.3 / 10.6.2.5.)
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { inYourZone } from "../targets";
import { followerThat, royalPaladin } from "../CP03/shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: discardA(royalPaladin),
      targets: [inYourZone("cemetery", { filter: followerThat(royalPaladin) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});

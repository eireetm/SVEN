// CP03-089 Knight of Nullity, Masquerade — Abysscraft follower, 2, 2/2. ヴァンガード・シャドウパラディン.
// While there are at least 10 Shadow Paladin cards in your cemetery, this follower has Rush and Bane. (A passive ability —
// ruling.)
// {[fanfare]} Bury the top card of your deck.
// Strike - If there's a follower with "Blaster" in its name in your cemetery, deal 2 damage to each enemy leader.
import { defineCard, fanfare, strike } from "../helpers";
import { isFollower, nameIncludes } from "../targets";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  field: {
    // typeAndTraits, not info: this is read while keywords are being computed.
    keywordsFor: (g, self, card) =>
      card === self && g.cards(g.controller(self), "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("シャドウパラディン")).length >= 10
        ? ["rush", "bane"]
        : [],
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
    strike({
      condition: (g, c) => g.cards(c, "cemetery").some((id) => isFollower(g, id) && nameIncludes("Blaster")(g, id)),
      *resolve(fx) {
        yield* damageEnemyLeader(fx, 2);
      },
    }),
  ],
});

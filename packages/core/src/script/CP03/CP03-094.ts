// CP03-094 Doranbau — Abysscraft follower, 1, 2/2. ヴァンガード・シャドウパラディン.
// While there are at least 10 Shadow Paladin cards in your cemetery, this follower has Bane. (A passive ability — ruling.)
// Whenever a follower on your field performs a drive check, bury the top card of your deck. (After the drive check; twice for
// Twin Drive — rulings.)
import { defineCard, whenYourFollowerDriveChecks } from "../helpers";

export default defineCard({
  field: {
    // typeAndTraits, not info: this is read while keywords are being computed.
    keywordsFor: (g, self, card) =>
      card === self && g.cards(g.controller(self), "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("シャドウパラディン")).length >= 10
        ? ["bane"]
        : [],
  },
  abilities: [
    whenYourFollowerDriveChecks({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
  ],
});

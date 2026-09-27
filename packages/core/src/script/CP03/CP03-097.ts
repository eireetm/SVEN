// CP03-097 Grim Reaper — Abysscraft follower, 2, 3/2. ヴァンガード・シャドウパラディン. Critical Trigger.
// While there are at least 10 Shadow Paladin cards in your cemetery, this follower has Storm. (A passive ability — ruling.)
// ----------
// (If this card is revealed by a drive check, give a follower on your field {[attack]}+2.) (Resolved by the engine.)
import { defineCard } from "../helpers";

export default defineCard({
  field: {
    // typeAndTraits, not info: this is read while keywords are being computed.
    keywordsFor: (g, self, card) =>
      card === self && g.cards(g.controller(self), "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("シャドウパラディン")).length >= 10
        ? ["storm"]
        : [],
  },
});

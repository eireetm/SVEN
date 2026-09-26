// BP20-015 Devotee of Unkilling — Forestcraft follower, 2, 2/3. 絶傑・狩人.
// {[fanfare]} Discard a card with Omen and Hunter traits: Draw 2 cards. (CR 10.4.7.4.)
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { omenHunter } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(omenHunter),
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});

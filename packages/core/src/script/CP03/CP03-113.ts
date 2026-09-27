// CP03-113 Oracle Guardian, Wiseman — Havencraft follower, 2, 2/3. ヴァンガード・オラクルシンクタンク.
// {[fanfare]} Select up to 1 card in your cemetery and put it into your deck 3rd from the top. (Selecting none is allowed —
// ruling.)
// Once on each of your turns, when you drive check a Trigger, deal 2 damage to each enemy leader and give your leader
// {[defense]}+2.
import { defineCard, fanfare, whenYouDriveCheckTrigger } from "../helpers";
import { inYourZone } from "../targets";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { upTo: true })],
      *resolve(fx) {
        const [card] = fx.targets[0] ?? [];
        if (card !== undefined) yield* fx.putIntoDeckAt(card, 3);
      },
    }),
    whenYouDriveCheckTrigger({
      oncePerTurn: true,
      triggerIf: (g, c) => g.activePlayer === c,
      *resolve(fx) {
        yield* damageEnemyLeader(fx, 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});

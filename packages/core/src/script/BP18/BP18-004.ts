// BP18-004 Tia, Crystalian Noble — Forestcraft follower, 2, 1/2. クリスタリア・プリンセス.
// {[fanfare]} Put a Crystalia Eve token into your EX area.
// Once on each of your turns, when a Crystalian card is put into your EX area, draw a card. (Also when this card itself is
// put there from the field — ruling: look-back, CR 10.7.4.1.)
// Activate {[engage]} this: Select a Crystalia Eve in your EX area. It costs X less to play this turn. X equals the number
// of cards you've played this turn. (X as it resolves.)
import type { AutomaticAbility } from "../types";
import { activated, defineCard, fanfare } from "../helpers";
import { inYourZone, named } from "../targets";
import { crystalian } from "./shared";

const crystalianIntoEx: AutomaticAbility = {
  kind: "automatic",
  timing: "other",
  oncePerTurn: true,
  triggerIf: (g, c) => g.activePlayer === c,
  trigger: (e, me, game) => {
    if (e.type !== "cardsMoved") return false;
    const hit = e.moves.find(
      (m) =>
        m.to.zone === "ex" &&
        m.to.player === me.controller &&
        m.from?.zone !== "ex" &&
        m.newCard !== null &&
        game.card(m.newCard) !== undefined &&
        crystalian(game, m.newCard) &&
        (!me.lookBack || m.card === me.card),
    );
    return hit ? [{ card: hit.newCard! }] : false;
  },
  *resolve(fx) {
    yield* fx.draw(1);
  },
};

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Crystalia Eve"]);
      },
    }),
    crystalianIntoEx,
    activated(
      { engageSelf: true },
      {
        targets: [inYourZone("ex", { filter: named("Crystalia Eve") })],
        *resolve(fx) {
          const x = fx.game.playedThisTurn(fx.controller);
          const eve = fx.targets[0]![0]!;
          if (x > 0 && fx.game.card(eve)?.zone === "ex") yield* fx.changePlayCost(eve, -x, "endOfTurn");
        },
      },
    ),
  ],
});

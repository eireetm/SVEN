// BP05-019 Octrice, Omen of Usurpation (Evolved) — Swordcraft follower, 4/4. 絶傑・盗賊.
// On Evolve: Select a card in an opponent's cemetery and put it into your EX area.
// {[act]} {[cost08]}: Select a card in an opponent's cemetery and play it for 0 play points.
// If there are at least 10 cards in opponents' cemeteries, any card you play from the EX area
// costs 2 less. (Not activated abilities of cards there — ruling. A card from an opponent's
// cemetery stays theirs: you may play it, and it goes to its owner's zones afterwards — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { inOpponentZone } from "../targets";
import { opponentCemeteryTen, playFromOpponentCemetery } from "./shared";

export default defineCard({
  field: {
    playCostOf: (g, self, card, player) =>
      player === g.controller(self) && g.playZone(card) === "ex" && opponentCemeteryTen(g, player) ? -2 : 0,
  },
  abilities: [
    onEvolve({
      targets: [inOpponentZone("cemetery")],
      *resolve(fx) {
        const card = fx.targets[0]![0]!;
        if (fx.game.card(card)?.zone === "cemetery") yield* fx.putIntoEx([card], fx.controller);
      },
    }),
    playFromOpponentCemetery,
  ],
});

// BP17-099 Automachina Maiden — Havencraft follower, 4, 3/3. 機械・偶像・超克.
// Ward.
// {[act]} {[cost00]}: Summon this from your EX area engaged. Activate only if there are 5 Machina cards in your EX area.
// (Valid in the EX area — ruling, CR 10.3.5; this card counts.)
// {[act]} {[cost01]}, put this from your hand into your EX area: Look at the top card of your deck. If it's a Machina card,
// you may reveal it and add it to your hand. (Valid in the hand; a card not taken stays on top, unrevealed — rulings.)
import { putThisFromHandIntoEx } from "../costs";
import { activated, defineCard } from "../helpers";
import { machina, machinaInEx } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    activated(
      { playPoints: 0 },
      {
        validIn: ["ex"],
        condition: (g, c) => machinaInEx(g, c) >= 5,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "ex") yield* fx.putOntoField([fx.self], fx.controller, { engaged: true });
        },
      },
    ),
    activated(
      { playPoints: 1, custom: putThisFromHandIntoEx },
      {
        validIn: ["hand"],
        *resolve(fx) {
          const top = fx.topCards(1);
          const chosen = yield* fx.selectCards(top.filter((id) => machina(fx.game, id)), 0, 1, fx.controller, top);
          if (chosen.length === 0) return;
          yield* fx.reveal(chosen);
          yield* fx.returnToHand(chosen);
        },
      },
    ),
  ],
});

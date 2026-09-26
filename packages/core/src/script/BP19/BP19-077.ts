// BP19-077 Zeronua, Demon of Domination — Abysscraft follower, 2, 1/2. 宴楽・魔界.
// {[fanfare]} If you have 2 or less cards in your hand, search your deck for up to 1 Paracelise, Demon of Greed and put it into
// your EX area. It costs 3 less to play this turn if you have no cards in your hand. (This card no longer counts — rulings.)
// {[act]} {[cost01]}: Put this card from your hand into your EX area: Give your leader {[defense]}+1. (Valid in the hand —
// ruling.)
import { putThisFromHandIntoEx } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const hand = () => fx.game.cards(fx.controller, "hand").length;
        if (hand() > 2) return;
        const found = yield* fx.search((id) => named("Paracelise, Demon of Greed")(fx.game, id), { to: "ex" });
        if (hand() > 0) return;
        for (const id of found) if (fx.game.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -3, "endOfTurn");
      },
    }),
    activated(
      { playPoints: 1, custom: putThisFromHandIntoEx },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});

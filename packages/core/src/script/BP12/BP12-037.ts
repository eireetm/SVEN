// BP12-037 Daria, Infinity Witch — Runecraft follower, 3, 3/3. 魔法使い.
// {[fanfare]} Look at the top 3 cards of your deck. From among them, you may reveal up to 1 Mage follower
// and up to 1 Mage spell and add them to your hand. Put the rest on the bottom of your deck in any
// order. (Either one alone is fine — ruling.)
// Activate {[engage]}: You may put a {[runecraft]} spell from your hand into your EX area. It costs 3
// less to play this turn. Activate only if there are at least 5 Mage followers in your cemetery. (The
// -3 applies after a set cost, CR 10.10.2.4 — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import { and, isClass, isSpell } from "../targets";
import { mageFollower, mageFollowersInCemetery, mageSpell } from "./shared";

const runecraftSpell = and(isSpell, isClass("Runecraft"));

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(3);
        const follower = yield* fx.selectCards(top.filter((id) => mageFollower(fx.game, id)), 0, 1, fx.controller, top);
        const spell = yield* fx.selectCards(top.filter((id) => mageSpell(fx.game, id)), 0, 1, fx.controller, top);
        const chosen = [...follower, ...spell];
        yield* fx.reveal(chosen);
        yield* fx.returnToHand(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => mageFollowersInCemetery(g, c) >= 5,
        *resolve(fx) {
          const spells = fx.game.cards(fx.controller, "hand").filter((id) => runecraftSpell(fx.game, id));
          const [card] = yield* fx.chooseCards(spells, 0, 1);
          if (card === undefined) return;
          for (const moved of yield* fx.putIntoEx([card])) yield* fx.changePlayCost(moved, -3, "endOfTurn");
        },
      },
    ),
  ],
});

// ECP01-052 Matikanefukukitaru — Havencraft follower, 7, 7/7. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// Whenever a Fate's Forecast is put onto your field, give your leader {[defense]}+7. (Each copy triggers, once per card; on the
// opponent's turn too — rulings.)
// {[fanfare]} Shuffle your cemetery into your deck, then look at the top 7 cards. You may summon any number of cards named Fate's
// Forecast from among them. Put the rest on the bottom of your deck in any order.
// {[lastwords]} Shuffle this card into its owner's deck.
import { defineCard, fanfare, lastWords, serveAbility, whenCardEntersYourField } from "../helpers";
import { named } from "../targets";

const forecast = named("Fate's Forecast");

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    whenCardEntersYourField(
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 7);
        },
      },
      { filter: forecast },
    ),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.putOnDeck(g.cards(fx.controller, "cemetery"), "top");
        yield* fx.shuffleDeck();
        const top = fx.topCards(7);
        const fits = top.filter((id) => forecast(g, id));
        yield* fx.putOntoField(yield* fx.selectCards(fits, 0, fits.length, fx.controller, top));
        yield* fx.bottomInAnyOrder(top.filter((id) => g.card(id)?.zone === "deck"));
      },
    }),
    lastWords({
      *resolve(fx) {
        const c = fx.game.card(fx.self);
        if (c?.zone !== "cemetery") return;
        yield* fx.putOnDeck([fx.self], "top");
        yield* fx.shuffleDeck(c.owner);
      },
    }),
  ],
});

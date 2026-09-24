// BP03-112 Garuel, Seraphic Leo — Neutral follower, 4, 2/3. 天使・獣.
// {[evolve]} {[cost01]}: Evolve.
// {[fanfare]} You may put a Neutral follower costing X or less from your hand onto your field and
// give it "At the start of your end phase, put this card on the bottom of its owner's deck."
// X equals your maximum play points.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const x = fx.game.state.players[fx.controller].maxPlayPoints;
        const hand = fx.game.cards(fx.controller, "hand").filter(
          (id) => isFollower(fx.game, id) && isClass("Neutral")(fx.game, id) && (fx.game.info(id).cost ?? 99) <= x,
        );
        if (hand.length === 0 || !(yield* fx.confirm())) return;
        const [id] = yield* fx.selectCards(hand, 1, 1);
        if (!id) return;
        const [neu] = yield* fx.putOntoField([id]);
        if (neu) yield* fx.grant(neu, "bottomAtEnd");
      },
    }),
  ],
});

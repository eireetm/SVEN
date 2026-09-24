// BP03-062 Tilting at Windmills — Dragoncraft amulet, 6. 童話.
// {[act]} {[cost03]}, {[engage]}: You may put a follower from your hand onto your field and give it
// "At the start of your end phase, destroy this card." The ability remains after evolution (ruling).
import { activated, defineCard } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 3, engageSelf: true },
      {
        *resolve(fx) {
          const hand = fx.game.cards(fx.controller, "hand").filter((id) => isFollower(fx.game, id));
          if (hand.length === 0 || !(yield* fx.confirm())) return;
          const [id] = yield* fx.selectCards(hand, 1, 1);
          if (!id) return;
          const [neu] = yield* fx.putOntoField([id]);
          if (neu) yield* fx.grant(neu, "destroyAtEnd");
        },
      },
    ),
  ],
});

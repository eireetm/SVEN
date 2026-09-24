// BP03-100 March Hare's Teatime — Havencraft amulet, 4. 信仰・童話.
// {[fanfare]} Look at the top 5. You may put a Fable follower costing 5 or less onto your field.
// Rest on the bottom.
// {[act]} {[cost02]}, {[engage]}, bury this: Put a Fable follower costing 3 or less from your cemetery onto your field.
import { activated, defineCard, fanfare } from "../helpers";
import { hasTrait, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(5);
        const matching = top.filter(
          (id) => isFollower(fx.game, id) && hasTrait("童話")(fx.game, id) && (fx.game.info(id).cost ?? 99) <= 5,
        );
        const [chosen] = yield* fx.selectCards(matching, 0, 1, fx.controller, top);
        if (chosen) yield* fx.putOntoField([chosen]);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true, burySelf: true },
      {
        targets: [
          inYourZone("cemetery", {
            filter: (g, id) => isFollower(g, id) && hasTrait("童話")(g, id) && (g.info(id).cost ?? 99) <= 3,
          }),
        ],
        *resolve(fx) {
          yield* fx.putOntoField(fx.targets[0] ?? []);
        },
      },
    ),
  ],
});

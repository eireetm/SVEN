// BP04-115 Candelabra of Prayers — Havencraft amulet, 1. 信仰.
// Once per turn, when another amulet is put onto your field, give your leader +1 defense.
import { defineCard, whenCardEntersYourField } from "../helpers";

export default defineCard({
  abilities: [
    whenCardEntersYourField(
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      { type: "amulet", another: true },
    ),
  ],
});

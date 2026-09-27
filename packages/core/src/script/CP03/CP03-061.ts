// CP03-061 Skull Juggler — Runecraft spell, 1. ヴァンガード・ペイルムーン.
// Select 2 Pale Moon cards in your cemetery. Banish them and draw a card. (Play only if you can select 2.)
import { defineCard, spell } from "../helpers";
import { inYourZone } from "../targets";
import { paleMoon } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { count: 2, filter: paleMoon })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
        yield* fx.draw(1);
      },
    }),
  ],
});

// BP14-107 Flame and Glass, Duality — Neutral follower, 6, 7/7. 大神・魔王.
// {[fanfare]} Banish a Fiend or Archfiend card from your cemetery: Select up to 2 enemy cards on the field and
// destroy them.
// Activate Banish a Fiend or Archfiend card from your cemetery: Give this Storm.
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { banishFromYour } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyCardOnField, hasTrait } from "../targets";

const fiendOrArchfiend = (g: GameReader, id: CardId): boolean => hasTrait("悪魔")(g, id) || hasTrait("魔王")(g, id);
const banishFiend = banishFromYour(["cemetery"], fiendOrArchfiend, 1);

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFiend,
      targets: [enemyCardOnField({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
      },
    }),
    activated(
      { custom: banishFiend },
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
        },
      },
    ),
  ],
});

// SD06-016 Beastly Vow — Havencraft amulet, 2. 信仰・獣.
// This card is put onto the field engaged. (Never reserved on the way — ruling.)
// {[act]} {[cost01]}, {[engage]}, put this card into your cemetery: Summon a Holy Tiger token.
import { activated, defineCard } from "../helpers";

export default defineCard({
  entersEngaged: true,
  abilities: [
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.summon(["Holy Tiger"]);
        },
      },
    ),
  ],
});

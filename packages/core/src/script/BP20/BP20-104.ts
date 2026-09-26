// BP20-104 Winged Lion Statue — Havencraft amulet, 2. 信仰・獣.
// {[act]} {[cost01]}, engage this, bury this and another amulet: Summon a Holy Falcon and Holy Tiger token. (An amulet on
// your field, CR 10.4.3.)
import { buryAnotherFromYourField } from "../costs";
import { activated, defineCard } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1, engageSelf: true, custom: buryAnotherFromYourField(isAmulet), burySelf: true },
      {
        *resolve(fx) {
          yield* fx.summon(["Holy Falcon", "Holy Tiger"]);
        },
      },
    ),
  ],
});

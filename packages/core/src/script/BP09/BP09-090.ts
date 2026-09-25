// BP09-090 Ceryneian Lighthind — Havencraft follower, 5/5. 信仰・獣・光輝. The front face of a
// double-faced evolved card; its back face is BP09-090_back Ceryneian Darkhind (CR 2.14).
// Ward.
// On Evolve - Bury an amulet: Give your leader {[defense]}+4. (An amulet on your field, CR 10.4.3; an
// evolved amulet too — ruling.)
import { buryFromYourField } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      cost: buryFromYourField(isAmulet),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
  ],
});

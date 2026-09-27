// SD06-015 Pinion Prayer — Havencraft amulet, 1. 信仰・鳥族.
// {[act]} {[cost01]}, {[engage]}, put this card into your cemetery: Summon a Holy Falcon token. (Room is counted after this card
// has left — ruling.)
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.summon(["Holy Falcon"]);
        },
      },
    ),
  ],
});

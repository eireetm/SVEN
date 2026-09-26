// BP11-007 Fairy Flowering — Forestcraft spell, 2. 妖精.
// As an additional cost to play this card, bury 4 Pixie tokens. (It can't be played without paying it.)
// ----------
// Search your deck for an Aria, Fairy Princess, summon it, then shuffle. (That card is in SD01 / SP01,
// not in a supported set yet: until then nothing is found.)
import { buryFromYourField } from "../costs";
import { defineCard, spell } from "../helpers";
import { named } from "../targets";
import { pixieToken } from "./shared";

export default defineCard({
  playOptionsRequired: true,
  playOptions: [{ id: "bury4Pixies", label: "Bury 4 Pixie tokens", ...buryFromYourField(pixieToken, 4) }],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.search((id) => named("Aria, Fairy Princess")(fx.game, id), { to: "field" });
      },
    }),
  ],
});

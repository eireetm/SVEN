// BP11-050 Terra Nova — Runecraft spell, 2. 錬金術師.
// {[quick]}
// Summon a Magic Sediment token. Add 2 to a Stack on your field. (Stack counters on one amulet with
// Stack of yours; with none, a Magic Sediment with 2 of them — ruling, CR 13.3.2.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon(["Magic Sediment"]);
        yield* fx.addToStack(2);
      },
    }),
  ],
});

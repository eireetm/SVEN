// BP09-105 Moon and Sun — Neutral spell, 2. 大神.
// {[act]} {[cost04]}, banish this card from your cemetery: Select an Amaterasu and Tsukuyomi in your
// cemetery and summon them. (Valid in the cemetery; it needs both to be selectable; with room for one,
// its player picks which one — rulings, CR 10.3.5, 4.4.4.2.)
// ----------
// Search your deck for an Amaterasu or Tsukuyomi, summon it, then shuffle your deck.
import { banishThisFromCemetery } from "../costs";
import { activated, defineCard, spell } from "../helpers";
import { inYourZone, named } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 4, custom: banishThisFromCemetery },
      {
        validIn: ["cemetery"],
        targets: [inYourZone("cemetery", { filter: named("Amaterasu") }), inYourZone("cemetery", { filter: named("Tsukuyomi") })],
        *resolve(fx) {
          yield* fx.putOntoField([...fx.targets[0]!, ...fx.targets[1]!]);
        },
      },
    ),
    spell({
      *resolve(fx) {
        yield* fx.search((id) => named("Amaterasu")(fx.game, id) || named("Tsukuyomi")(fx.game, id), { to: "field" });
      },
    }),
  ],
});

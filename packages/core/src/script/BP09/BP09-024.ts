// BP09-024 Monochrome Duel — Swordcraft spell, 5. 指揮官・童話.
// {[act]} {[cost02]}, banish this card from your cemetery: Give each Knight on your field {[attack]}+1
// and Storm. (Valid in the cemetery — ruling, CR 10.3.5.)
// ----------
// Search your deck for a Queen Hemera the White and Queen Magnus the Black, summon them, then shuffle
// your deck. Give them {[attack]}+1/{[defense]}+1. (Either may be left unfound — ruling, CR 4.1.2.2.)
import { banishThisFromCemetery } from "../costs";
import { activated, defineCard, spell } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 2, custom: banishThisFromCemetery },
      {
        validIn: ["cemetery"],
        *resolve(fx) {
          for (const knight of fx.game.followers(fx.controller).filter((id) => named("Knight")(fx.game, id))) {
            yield* fx.giveStats(knight, 1, 0);
            yield* fx.giveKeyword(knight, "storm");
          }
        },
      },
    ),
    spell({
      *resolve(fx) {
        const queens = yield* fx.searchEach(
          [(id) => named("Queen Hemera the White")(fx.game, id), (id) => named("Queen Magnus the Black")(fx.game, id)],
          { to: "field" },
        );
        for (const id of queens) if (fx.game.card(id)?.zone === "field") yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});

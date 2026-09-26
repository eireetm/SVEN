// BP10-077 Sincere Masquerade Ghost — Abysscraft advanced follower, 6, 5/5. 死者.
// Storm.
// {[fanfare]} Summon 2 Gargantuan Ghost tokens.
// Whenever another follower with "Ghost" in its name is put onto your field, give it {[attack]}+1 and
// Rush.
// {[lastwords]} Select a Masquerade Ghost in your EX area and put it onto your field engaged. (This card
// itself goes to the evolve deck, CR 9.2.2.)
import { defineCard, fanfare, lastWords, whenFollowerEntersYourField } from "../helpers";
import { inYourZone, named, nameIncludes } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Gargantuan Ghost", "Gargantuan Ghost"]);
      },
    }),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const card = fx.data?.card;
          if (card === undefined || fx.game.card(card)?.zone !== "field") return;
          yield* fx.giveStats(card, 1, 0);
          yield* fx.giveKeyword(card, "rush");
        },
      },
      { another: true, filter: nameIncludes("Ghost") },
    ),
    lastWords({
      targets: [inYourZone("ex", { filter: named("Masquerade Ghost") })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!, undefined, { engaged: true });
      },
    }),
  ],
});

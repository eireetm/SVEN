// ECP02-015 Uzuki Shimamura [Cinderella Girl] — Swordcraft follower, 6, 4/4. デレマス・キュート.
// {[fanfare]} Search your deck for an iM@S CG card not named Uzuki Shimamura [Cinderella Girl], put it into your EX area, then
// shuffle. If there are at least 5 Cute cards in your cemetery, search up to 2 instead.
// Activate, Lesson (1): Select an iM@S CG card in your EX area and give it "This costs 5 less to play." Activate only once per
// turn. (While it stays in the EX area; given twice, it costs 10 less — ruling.)
import { lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { inYourZone, named } from "../targets";
import { cute, imas, inYourCemetery } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const max = inYourCemetery(g, fx.controller, cute) >= 5 ? 2 : 1;
        yield* fx.search((id) => imas(g, id) && !named("Uzuki Shimamura [Cinderella Girl]")(g, id), { to: "ex", max });
      },
    }),
    activated(
      { custom: lesson(1) },
      {
        oncePerTurn: true,
        targets: [inYourZone("ex", { filter: imas })],
        *resolve(fx) {
          yield* fx.changePlayCost(fx.targets[0]![0]!, -5);
        },
      },
    ),
  ],
});

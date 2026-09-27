// CP01-019 Air Groove — Swordcraft follower, 2, 2/2. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// On Race: Give this follower {[attack]}+1/{[defense]}+1. Select up to 1 other follower on your field and refresh it. For the
// rest of this turn, that follower can't attack enemies. (It may still pay "engage this" costs — ruling; CR 8.4.3.2.1.)
import { defineCard, onRace, serveAbility } from "../helpers";
import { anotherYourFollower } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      targets: [anotherYourFollower({ upTo: true })],
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
        for (const id of fx.targets[0] ?? []) {
          yield* fx.refresh([id]);
          yield* fx.cannotAttack(id, "endOfTurn");
        }
      },
    }),
  ],
});

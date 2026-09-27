// CP01-030 Vodka — Runecraft follower, 3, 3/3. ウマ娘.
// If there is a Daiwa Scarlet your field, this card costs 2 less to play. (Two of them: still 2 — ruling.)
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Once per turn, when you play a spell, give each Umamusume follower on your field {[attack]}+1/{[defense]}+1 and Rush. (Each
// copy once per turn, on the opponent's turn too — rulings.)
import { defineCard, serveAbility, whenYouPlay } from "../helpers";
import { isSpell, named } from "../targets";
import { umamusumeFollower } from "./shared";

export default defineCard({
  playCost: (g, _self, controller) => (g.cards(controller, "field").some((id) => named("Daiwa Scarlet")(g, id)) ? -2 : 0),
  abilities: [
    serveAbility(1, 1),
    whenYouPlay(
      {
        oncePerTurn: true,
        *resolve(fx) {
          for (const id of fx.game.followers(fx.controller).filter((f) => umamusumeFollower(fx.game, f))) {
            yield* fx.giveStats(id, 1, 1);
            yield* fx.giveKeyword(id, "rush");
          }
        },
      },
      isSpell,
    ),
  ],
});

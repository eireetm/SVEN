// BP14-088 All-Feeling Divine — Havencraft follower, 4, 3/3. 宴楽・狂信・偶像.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Summon a Fox of Invitation token.
// {[act]} {[cost02]}, banish this from your cemetery: Summon a Fox of Invitation token. Give each Fox of
// Invitation on your field {[attack]}+2/{[defense]}+1. (Valid in the cemetery — ruling.)
import { banishThisFromCemetery } from "../costs";
import { activated, defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";
import { FOX } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon([FOX]);
      },
    }),
    activated(
      { playPoints: 2, custom: banishThisFromCemetery },
      {
        validIn: ["cemetery"],
        *resolve(fx) {
          yield* fx.summon([FOX]);
          for (const id of fx.game.followers(fx.controller).filter((f) => named(FOX)(fx.game, f))) yield* fx.giveStats(id, 2, 1);
        },
      },
    ),
  ],
});

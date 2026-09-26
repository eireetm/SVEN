// BP14-104 White Eagle Baptism — Havencraft amulet, 6. 信仰・偶像・鳥族.
// {[fanfare]} Summon 2 Holy Falcon tokens.
// Whenever a Holy Falcon is put onto your field, give it {[attack]}+1/{[defense]}+1. (Its own two too; also during
// the opponent's turn — ruling.)
import { defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Holy Falcon", "Holy Falcon"]);
      },
    }),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const falcon = fx.data?.card;
          if (falcon !== undefined && fx.game.card(falcon)?.zone === "field") yield* fx.giveStats(falcon, 1, 1);
        },
      },
      { filter: named("Holy Falcon") },
    ),
  ],
});

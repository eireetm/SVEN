// BP09-002 White Vanara — Forestcraft follower, 4, 2/2. 精霊・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// Whenever another follower is put onto your field, give this follower {[attack]}+1/{[defense]}+1. If
// that follower is a Beast follower, give {[attack]}+2/{[defense]}+2 instead. (Once per follower: two
// at once trigger twice — ruling. Whether it is a Beast is seen as it is put onto the field.)
import { defineCard, evolveAbility, whenFollowerEntersYourField } from "../helpers";
import { beastFollower } from "./shared";

const grows = (amount: number, beast: boolean) =>
  whenFollowerEntersYourField(
    {
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, amount, amount);
      },
    },
    { another: true, filter: (g, id) => beastFollower(g, id) === beast },
  );

export default defineCard({ abilities: [evolveAbility(1), grows(1, false), grows(2, true)] });

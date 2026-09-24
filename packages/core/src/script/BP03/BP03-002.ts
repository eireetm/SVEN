// BP03-002 Cosmos Fang — Forestcraft follower, 5, 4/4. 精霊・植物族・獣.
// {[evolve]} {[cost01]}, return another follower on your field to its owner's hand: Evolve.
// {[fanfare]} Search your deck for a Beast follower, reveal it, and add it to your hand. If it
// costs 2 or less, you may put it onto your field instead: it goes from the deck straight onto
// the field (adding it to the hand is allowed, ruling).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { returnAnotherFromYourField } from "../costs";
import { hasTrait, isFollower } from "../targets";

const beast = (g: GameReader, id: CardId) => isFollower(g, id) && hasTrait("獣")(g, id);

export default defineCard({
  abilities: [
    evolveAbility({ playPoints: 1, custom: returnAnotherFromYourField(isFollower) }),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => beast(fx.game, id), {
          *destination(id) {
            return (fx.game.info(id).cost ?? 99) <= 2 && (yield* fx.confirm()) ? "field" : "hand";
          },
        });
      },
    }),
  ],
});

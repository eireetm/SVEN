// BP03-002 Cosmos Fang — Forestcraft follower, 5, 4/4. 精霊・植物族・獣.
// {[evolve]} {[cost01]}, return another follower on your field to its owner's hand: Evolve.
// {[fanfare]} Search your deck for a Beast follower. If it costs 2 or less, you may put it
// onto your field instead of adding it to your hand (ruling: adding it to hand is allowed).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { returnAnotherCardOnYourField } from "../costs";
import { hasTrait, isFollower } from "../targets";

const beast = (g: GameReader, id: CardId) => isFollower(g, id) && hasTrait("獣")(g, id);

export default defineCard({
  abilities: [
    evolveAbility({ playPoints: 1, custom: returnAnotherCardOnYourField }),
    fanfare({
      *resolve(fx) {
        const found = yield* fx.search((id) => beast(fx.game, id), { max: 1, to: "hand" });
        const id = found[0];
        if (id === undefined || (fx.game.info(id).cost ?? 99) > 2) return;
        if (yield* fx.confirm()) yield* fx.putOntoField([id]);
      },
    }),
  ],
});

// BP15-013 Fairy Healer — Forestcraft follower, 2, 2/3. 妖精.
// {[fanfare]} Put a token follower from your field into its owner's EX area: Give your leader {[defense]}+2. (With
// a full EX area it can't be paid; the token keeps existing there without its damage and given abilities —
// rulings, CR 9.1.4.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { defineCard, fanfare } from "../helpers";
import { hasRoom } from "./shared";

const tokenFollowers = (g: GameReader, p: PlayerId): CardId[] =>
  g.followers(p).filter((id) => g.info(id).baseDef.token && hasRoom(g, g.card(id)!.owner, "ex"));

const tokenToEx: CustomCost = {
  canPay: (g, c) => tokenFollowers(g, c).length > 0,
  *pay(fx) {
    yield* fx.putIntoEx(yield* fx.chooseCards(tokenFollowers(fx.game, fx.controller), 1, 1));
  },
};

export default defineCard({
  abilities: [
    fanfare({
      cost: tokenToEx,
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});

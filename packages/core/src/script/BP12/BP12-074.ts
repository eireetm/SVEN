// BP12-074 Medusa, Evil-Eyed Serpent — Abysscraft follower, 3, 3/2. 魔界・ゴルゴーン.
// {[fanfare]} Put a Medusiana token into your EX area.
// Activate {[engage]}, bury a Demon token from your field or EX area: Select an enemy follower on the
// field and destroy it. (Any Demon token, also one that became an amulet; burying it from the EX area
// triggers no Last Words — rulings.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { activated, defineCard, fanfare } from "../helpers";
import { and, enemyFollower, isToken } from "../targets";
import { demon } from "./shared";

const demonToken = and(isToken, demon);
const demonTokens = (g: GameReader, p: PlayerId): CardId[] =>
  [...g.cards(p, "field"), ...g.cards(p, "ex")].filter((id) => demonToken(g, id));

const buryDemonToken: CustomCost = {
  canPay: (g, c) => demonTokens(g, c).length > 0,
  *pay(fx) {
    yield* fx.bury(yield* fx.chooseCards(demonTokens(fx.game, fx.controller), 1, 1));
  },
};

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Medusiana"]);
      },
    }),
    activated(
      { engageSelf: true, custom: buryDemonToken },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      },
    ),
  ],
});

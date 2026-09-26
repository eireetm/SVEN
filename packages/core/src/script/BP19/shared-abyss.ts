// Shared pieces of BP19 Abysscraft card scripts (not a card: the file name has no set prefix).
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { lastWords } from "../helpers";
import { enemyFollower, named } from "../targets";
import { GARODETH } from "./shared";

/** "a Garodeth, Insurgent Convict on your field" (BP19-086). */
export const garodethOnField = (g: GameReader, p: PlayerId): boolean => g.cards(p, "field").some((id) => named(GARODETH)(g, id));

/** BP19-078 / 079 "{[lastwords]} Select an enemy follower on the field and deal it 3 damage." */
export const colonelLastWords = lastWords({
  targets: [enemyFollower()],
  *resolve(fx) {
    yield* fx.dealDamage(fx.targets[0]![0]!, 3);
  },
});

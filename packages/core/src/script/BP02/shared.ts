import type { EffectContext } from "../../engine/effects/context";
import type { GameReader } from "../../engine/query";
import { atStartOfYourEndPhase, whenCardEntersYourField } from "../helpers";
import { enemyFollower } from "../targets";
import type { CardId } from "../../model/ids";

/**
 * Helpers shared by several BP02 scripts (not a card: the script index only registers files
 * named after card numbers).
 */

/**
 * Is `card` a token named `name` controlled by `self`'s controller? For passives such as "your
 * Megalorca tokens have Rush" — uses only card() / db, never info(), because it is evaluated while
 * card information is being computed (see FieldPassives.keywordsFor).
 */
export function yourTokensNamed(g: GameReader, self: CardId, card: CardId, name: string): boolean {
  const c = g.card(card);
  if (!c || c.controller !== g.card(self)?.controller) return false;
  const def = g.db.get(c.def);
  return def.token && def.name === name;
}

/**
 * BP02-072 / BP02-073: "Select an enemy follower on the field. Destroy it and give your leader
 * {[defense]}+X. X equals the selected follower's attack." X is its current, modified attack
 * (rulings), read before it is destroyed.
 */
export function* destroyAndGainItsAttack(fx: EffectContext) {
  const target = fx.targets[0]![0]!;
  const x = fx.game.info(target).attack ?? 0;
  yield* fx.destroy([target]);
  yield* fx.giveLeaderDefense(fx.controller, x);
}

/**
 * BP02-085 / BP02-086: "At the start of your end phase, if Sanguine is active for you, draw a card,
 * then discard a card." (CR 13.5.2; without Sanguine the ability is not played — ruling.)
 */
export const sanguineCycle = atStartOfYourEndPhase({
  condition: (g, c) => g.sanguine(c),
  *resolve(fx) {
    yield* fx.draw(1);
    yield* fx.discard(fx.controller, 1, 1);
  },
});

/**
 * BP02-092 / BP02-093: "Whenever an amulet is put onto your field, select an enemy follower on the
 * field and deal it X damage. X equals the amulet's cost." Once per amulet (CR 10.7.2.1 — ruling);
 * the cost is the printed cost (CR 2.5.1).
 */
export const amuletEntersDamage = whenCardEntersYourField(
  {
    targets: [enemyFollower()],
    *resolve(fx) {
      const amulet = fx.game.card(fx.data!.card!);
      const x = amulet ? (fx.game.db.get(amulet.def).cost ?? 0) : 0;
      yield* fx.dealDamage(fx.targets[0]![0]!, x);
    },
  },
  { type: "amulet" },
);

/** BP02-107 / BP02-108: "If there are at least 2 enemy followers on the field, ..." */
export function atLeastTwoEnemyFollowers(g: GameReader, self: CardId): boolean {
  return g.followers(g.opponent(g.controller(self))).length >= 2;
}

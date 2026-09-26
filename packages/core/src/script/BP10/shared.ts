// Shared pieces of BP10 card scripts.
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { EffectContext } from "../../engine/effects/context";
import type { Keyword } from "../../model/keyword";
import { whenFollowerEntersYourField, type TimingSpec } from "../helpers";
import { enemyFollower, hasTrait, isFollower, isSpell, named, nameIncludes } from "../targets";
import type { AutomaticAbility, DamageInfo } from "../types";

/** アルカナ (Arcana) cards. */
export const arcana = hasTrait("アルカナ");
/** 武装 (Armed) cards. */
export const armed = hasTrait("武装");
/** "An Arcana spell" (BP10-037, 038). */
export const arcanaSpell = (g: GameReader, id: CardId): boolean => isSpell(g, id) && arcana(g, id);
/** An Angel (天使) or Fallen Angel (堕天使) card (BP10-115, 116, 121). */
export const angelic = (g: GameReader, id: CardId): boolean => hasTrait("天使")(g, id) || hasTrait("堕天使")(g, id);
/** "A follower with "Ghost" in its name" (BP10-077, 088, 091). */
export const ghostFollower = (g: GameReader, id: CardId): boolean => isFollower(g, id) && nameIncludes("Ghost")(g, id);

/** The number of the player's cemetery cards matching `filter`. */
export const inCemetery = (g: GameReader, p: PlayerId, filter: (g: GameReader, id: CardId) => boolean): number =>
  g.cards(p, "cemetery").filter((id) => filter(g, id)).length;

/** "If there are at least 3 Armed cards in your cemetery" (BP10-064, 070). */
export const threeArmedInCemetery = (g: GameReader, p: PlayerId): boolean => inCemetery(g, p, armed) >= 3;

/**
 * "The number of cards with different base costs in your EX area" (BP10-011, 016; 元のコストの種類数).
 */
export const distinctCostsInEx = (g: GameReader, p: PlayerId): number => new Set(g.cards(p, "ex").map((id) => g.info(id).cost)).size;

/** "If there's a 0. Lhynkal, The Fool on your field" (BP10-043, 047). */
export const lhynkalOnField = (g: GameReader, p: PlayerId): boolean =>
  g.cards(p, "field").some((id) => named("0. Lhynkal, The Fool")(g, id));

/** "If there's a [name] on your field". */
export const onYourField = (g: GameReader, p: PlayerId, name: string): boolean => g.cards(p, "field").some((id) => named(name)(g, id));

/**
 * Chipper Skipper (BP10-005 / 006): "Whenever a Mercenary follower is put onto your field, give it
 * {[attack]}+1/{[defense]}+1 and Rush." Also during the opponent's turn (ruling).
 */
export const mercenaryGetsRush: AutomaticAbility = whenFollowerEntersYourField(
  {
    *resolve(fx) {
      const card = fx.data?.card;
      if (card === undefined || fx.game.card(card)?.zone !== "field") return;
      yield* fx.giveStats(card, 1, 1);
      yield* fx.giveKeyword(card, "rush");
    },
  },
  { filter: hasTrait("傭兵") },
);

/**
 * "[Resolving spell] ... If there's a 0. Lhynkal, The Fool on your field, put this card into its
 * owner's EX area" (BP10-043, 047): the spell goes there instead of the cemetery (like BP07-058).
 */
export function* toExWithLhynkal(fx: EffectContext) {
  if (lhynkalOnField(fx.game, fx.controller) && fx.game.card(fx.self)?.zone === "resolution") yield* fx.putIntoEx([fx.self]);
}

/**
 * Prudent General (BP10-023 / 024): "Each {[swordcraft]} token on your field has Rush." For
 * `keywordsFor`, so it reads the card's printed data and `typeAndTraits` only.
 */
export const swordcraftTokensHaveRush = (g: GameReader, self: CardId, card: CardId): readonly Keyword[] => {
  const def = g.db.get(g.card(card)!.def);
  const yours = g.controller(card) === g.controller(self);
  return yours && def.token && def.class === "Swordcraft" && g.typeAndTraits(card).type === "follower" ? ["rush"] : [];
};

/** "If there's a Merchant follower not named [name] on your field" (BP10-025, 035). */
export const otherMerchantOnField = (g: GameReader, p: PlayerId, name: string): boolean =>
  g.followers(p).some((id) => hasTrait("商人")(g, id) && !named(name)(g, id));

/**
 * Deathbringer (BP10-078 Fanfare / 079 On Evolve): "Select an enemy follower on the field. Destroy it,
 * deal 2 damage to its leader and give your leader {[defense]}+2."
 */
export const deathbringer: TimingSpec = {
  targets: [enemyFollower()],
  *resolve(fx) {
    const target = fx.targets[0]![0]!;
    const leader = fx.game.leader(fx.game.controller(target));
    yield* fx.destroy([target]);
    yield* fx.dealDamage(leader, 2);
    yield* fx.giveLeaderDefense(fx.controller, 2);
  },
};

/**
 * Sofina (BP10-092 / 093): "If a follower on your field would take more than 3 damage, it takes 3
 * instead." Each damage separately, Sofina too (rulings); a damage-changing passive (CR 10.10.2).
 */
export const sofinaCap = (g: GameReader, self: CardId, damage: DamageInfo): number =>
  g.controller(damage.target) === g.controller(self) && damage.amount > 3 ? 3 - damage.amount : 0;

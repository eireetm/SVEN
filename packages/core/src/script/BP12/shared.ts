// Shared pieces of BP12 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { AutomaticAbility } from "../types";
import { whenDiscarded, whenYourFollowerAttacks } from "../helpers";
import { and, enemyFollower, hasTrait, isFollower, isSpell, isToken, named } from "../targets";
import { hasRoom } from "../BP11/shared";

export { DROID, REPAIR, TREE, countIn, isTree, machina, marine, natura, summonTreeLastWords } from "../BP07/shared";
export { distinctCostsInCemetery, hasRoom, onYourField, tokenOntoFieldOrEx, wasteland, yourTurn } from "../BP11/shared";

type Filter = (g: GameReader, id: CardId) => boolean;

/** 魔法使い (Mage), 妖精 (Pixie), 狩人 (Hunter), 盗賊 (Thief), 魔界 (Demon) cards. */
export const mage = hasTrait("魔法使い");
export const pixie = hasTrait("妖精");
export const hunter = hasTrait("狩人");
export const thief = hasTrait("盗賊");
export const demon = hasTrait("魔界");
export const mageFollower = and(isFollower, mage);
export const mageSpell = and(isSpell, mage);
/** A Pixie (妖精) token, e.g. a Fairy (BP12-011, 016). */
export const pixieToken = and(isToken, pixie);
/** A card named Repair Mode (the BP07-T02 token). */
export const isRepairMode = named("Repair Mode");

/** Token names used by several BP12 cards. */
export const SPARKLE = "Carbuncle's Sparkle";
export const FAIRY = "Fairy";
export const ARMORED = "Armored Tentacle";
export const ASSAULT = "Assault Tentacle";
export const HOLY_FALCON = "Holy Falcon";
export const LECIA = "Lecia, Sky Saber";
export const NANO = "Nano, the Dawnblade";
export const AZORD = "Azord, Duke of the Mists";

/** "The number of Mage followers in your cemetery" (BP12-037, 040, 043). */
export const mageFollowersInCemetery = (g: GameReader, p: PlayerId): number =>
  g.cards(p, "cemetery").filter((id) => mageFollower(g, id)).length;

/** "The number of Mage followers on your field" (BP12-050, 051). */
export const mageFollowersOnField = (g: GameReader, p: PlayerId): number => g.followers(p).filter((id) => mage(g, id)).length;

/** "[Matching] cards on your field and/or in your EX area" — counted together (BP12-019, 105 rulings). */
export const onFieldAndEx = (g: GameReader, p: PlayerId, filter: Filter): number =>
  [...g.cards(p, "field"), ...g.cards(p, "ex")].filter((id) => filter(g, id)).length;

/**
 * "When this card is discarded, you may put it into your EX area." (BP12-021, 054, 063) — valid in
 * the hand (CR 10.3.4), also when it is discarded at the hand limit in the end phase (rulings). A
 * full EX area can't receive it (CR 4.8.3.2), so nothing is asked then.
 */
export const discardedToEx: AutomaticAbility = whenDiscarded({
  *resolve(fx) {
    if (fx.game.card(fx.self)?.zone !== "cemetery" || !hasRoom(fx.game, fx.controller, "ex")) return;
    if (yield* fx.confirm()) yield* fx.putIntoEx([fx.self]);
  },
});

/**
 * BP12-008 / 009 Forest Defender: "Whenever another Hunter follower on your field attacks, select an
 * enemy follower on the field and deal it 3 damage." (It resolves before the quick timing — ruling.)
 */
export const forestDefenderTrigger: AutomaticAbility = whenYourFollowerAttacks(
  {
    targets: [enemyFollower()],
    *resolve(fx) {
      yield* fx.dealDamage(fx.targets[0]![0]!, 3);
    },
  },
  hunter,
  { another: true },
);

// Abilities shared by several BP07 cards (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { EffectContext } from "../../engine/effects/context";
import type { GameReader } from "../../engine/query";
import type { Proc } from "../../engine/runtime/proc";
import type { AutomaticAbility, FieldPassives, TargetSpec } from "../types";
import { atStartOfYourEndPhase, lastWords, strike, whenCardEntersYourField } from "../helpers";
import { and, costAtMost, enemyFollower, hasTrait, inYourZone, isClass, isSpell, named } from "../targets";

export const TREE = "Naterran Great Tree";
export const REPAIR = "Repair Mode";
export const DROID = "Assembly Droid";

/** A card named Naterran Great Tree (the BP07-T03 token). */
export const isTree = named(TREE);
/** Natura (自然), Machina (機械), Fable (童話), Marine (海洋) cards. */
export const natura = hasTrait("自然");
export const machina = hasTrait("機械");
export const fable = hasTrait("童話");
export const marine = hasTrait("海洋");

/** "If there is a [name] on your field". */
export const onYourField = (g: GameReader, p: PlayerId, name: string): boolean =>
  g.cards(p, "field").some((id) => named(name)(g, id));

/** The number of [matching] cards in one of the player's zones. */
export const countIn = (g: GameReader, p: PlayerId, zone: "field" | "ex" | "cemetery", filter: (g: GameReader, id: CardId) => boolean): number =>
  g.cards(p, zone).filter((id) => filter(g, id)).length;

/** Is there room in the player's field / EX area (CR 4.4.4, 4.8.3)? */
export const hasRoom = (g: GameReader, p: PlayerId, zone: "field" | "ex"): boolean =>
  g.cards(p, zone).length < (zone === "field" ? g.state.config.rules.fieldLimit : g.state.config.rules.exAreaLimit);

/**
 * "You may put a Naterran Great Tree token onto your field or into your EX area." Putting it
 * nowhere is allowed, also when one of them is full (rulings on BP07-018 / 030 / 107 / 112).
 * Only zones with room are offered (a full zone would receive nothing, CR 4.4.4.2 / 4.8.3.2).
 */
export function* treeOntoFieldOrEx(fx: EffectContext): Proc<void> {
  const options: { id: string; label: string }[] = [];
  if (hasRoom(fx.game, fx.controller, "field")) options.push({ id: "field", label: "Put it onto your field" });
  if (hasRoom(fx.game, fx.controller, "ex")) options.push({ id: "ex", label: "Put it into your EX area" });
  if (options.length === 0) return;
  options.push({ id: "none", label: "Don't put it" });
  const [pick] = yield* fx.choose(options);
  if (pick === "field") yield* fx.summon([TREE]);
  else if (pick === "ex") yield* fx.tokensToEx([TREE]);
}

/** "Put an Assembly Droid or Repair Mode token into your EX area" (BP07-046, 106, 116). */
export function* droidOrRepairToEx(fx: EffectContext): Proc<void> {
  const [pick] = yield* fx.choose([
    { id: "droid", label: "Put an Assembly Droid into your EX area" },
    { id: "repair", label: "Put a Repair Mode into your EX area" },
  ]);
  yield* fx.tokensToEx([pick === "droid" ? DROID : REPAIR]);
}

// Moved to script/helpers.ts (also used by BP09-037); re-exported for BP07's scripts.
export { selectWithinTotalCost } from "../helpers";

/**
 * "Select a [named / matching] spell in your cemetery and play it for 0 play points" (BP07-020, 053,
 * 108): the card is selected even if it can't be played (e.g. no target for it); then nothing
 * happens (BP07-020 / 053 / 108 rulings, CR 1.3.2). A played spell goes to the cemetery as usual.
 */
export function* playSelectedForZero(fx: EffectContext, card: CardId | undefined): Proc<void> {
  if (card === undefined || fx.game.card(card)?.zone !== "cemetery") return;
  if (fx.game.canPlay(card, fx.controller, { cost: 0 })) yield* fx.playCard(card, { cost: 0 });
}

/** A spell in your cemetery matching `filter` (a required selection, BP07-020 ruling). */
export const spellInYourCemetery = (filter: (g: GameReader, id: CardId) => boolean): TargetSpec =>
  inYourZone("cemetery", { filter: and(isSpell, filter) });

/** "{[lastwords]} Summon a Naterran Great Tree token." (BP07-060 / 061 / 062) */
export const summonTreeLastWords: AutomaticAbility = lastWords({
  *resolve(fx) {
    yield* fx.summon([TREE]);
  },
});

/** "Summon up to N Naterran Great Tree tokens" (BP07-064, 068): any number up to N, 0 too (rulings). */
export function* upToTrees(fx: EffectContext, max: number): Proc<void> {
  const options = Array.from({ length: max + 1 }, (_, i) => ({ id: String(i), label: `Summon ${i}` }));
  const [n] = yield* fx.choose(options);
  yield* fx.summon(Array<string>(Number(n)).fill(TREE));
}

/** BP07-001 / 002 Ladica: "Whenever a Naterran Great Tree is put onto your field, recover 1 play point." */
export const ladicaRecovers: AutomaticAbility = whenCardEntersYourField(
  {
    *resolve(fx) {
      yield* fx.recoverPlayPoints(1);
    },
  },
  { filter: isTree },
);

/**
 * BP07-005 / 006 Setus: "At the start of your end phase, give your leader {[defense]}+4 and, if a
 * follower was put from your field into the cemetery this turn, give this follower +2/+2." Tokens
 * count; a follower changed into an amulet doesn't (rulings).
 */
export const setusEndPhase: AutomaticAbility = atStartOfYourEndPhase({
  *resolve(fx) {
    yield* fx.giveLeaderDefense(fx.controller, 4);
    if (fx.game.followersToCemeteryThisTurn(fx.controller) > 0) yield* fx.giveStats(fx.self, 2, 2);
  },
});

/** BP07-022 / 023 Leod: "While this follower is reserved on your field, it has Intimidate and Aura." */
export const leodKeywords: NonNullable<FieldPassives["keywordsFor"]> = (g, self, card) =>
  card === self && g.card(self)?.engaged === false ? ["intimidate", "aura"] : [];

/** BP07-022 / 023 Leod: "At the start of your end phase, select an enemy follower and deal it 1 damage." */
export const leodEndPhase: AutomaticAbility = atStartOfYourEndPhase({
  targets: [enemyFollower()],
  *resolve(fx) {
    yield* fx.dealDamage(fx.targets[0]![0]!, 1);
  },
});

/**
 * BP07-094 / 095 Robofalcon: "Strike - Put a Repair Mode token into your EX area. Then, if there are
 * at least 3 cards named Repair Mode in your EX area, give this follower +1/+0." (Also when the EX
 * area was full — ruling.)
 */
export const robofalconStrike: AutomaticAbility = strike({
  *resolve(fx) {
    yield* fx.tokensToEx([REPAIR]);
    if (countIn(fx.game, fx.controller, "ex", named(REPAIR)) >= 3) yield* fx.giveStats(fx.self, 1, 0);
  },
});

/**
 * BP07-108 / 109 Maisha: "Strike - Select a Neutral spell that costs 3 or less in your cemetery and
 * play it for 0 play points." (元のコスト.) The attack target doesn't change if the spell removes it
 * (ruling, CR 8.4).
 */
export const maishaStrike: AutomaticAbility = strike({
  targets: [spellInYourCemetery(and(isClass("Neutral"), costAtMost(3)))],
  *resolve(fx) {
    yield* playSelectedForZero(fx, fx.targets[0]![0]);
  },
});

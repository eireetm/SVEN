import type { GrantedAbilityId } from "../../model/state";
import type { AbilityDef } from "../../script/types";
import { enemyFollower } from "../../script/targets";

/**
 * Abilities an effect can give a card (`EffectChange` kind "grantedAbility"). They are not
 * printed on a definition, so pending instances use the pseudo definition id "grant:<id>".
 * The card that has the effect is "this card"; its current controller is the ability's
 * controller (CR 3.1.2.3). Automatic abilities trigger through engine/abilities/triggers.ts;
 * activated ones are listed among the card's abilities (engine/state/characteristics.ts).
 */
export const GRANT_PREFIX = "grant:";

export const GRANT_ABILITIES: Record<GrantedAbilityId, AbilityDef> = {
  // BP03-062 "At the start of your end phase, destroy this card."
  destroyAtEnd: {
    kind: "automatic",
    timing: "other",
    trigger: (e, me) => !me.lookBack && e.type === "phaseStarted" && e.phase === "end" && e.player === me.controller,
    *resolve(fx) {
      yield* fx.destroy([fx.self]);
    },
  },
  // BP03-112 "At the start of your end phase, put this card on the bottom of its owner's deck."
  bottomAtEnd: {
    kind: "automatic",
    timing: "other",
    trigger: (e, me) => !me.lookBack && e.type === "phaseStarted" && e.phase === "end" && e.player === me.controller,
    *resolve(fx) {
      if (fx.game.card(fx.self)?.zone === "field") yield* fx.putOnDeck([fx.self], "bottom");
    },
  },
  // BP03-011 (given by Wood of Brambles while it is on the field): "Follower Strike: Deal 2
  // damage to the enemy follower." Not a select, so it hits through Aura (ruling).
  followerStrike2: {
    kind: "automatic",
    timing: "strike",
    trigger: (e, me, game) =>
      !me.lookBack && e.type === "attackDeclared" && e.attacker === me.card && game.card(e.target)?.zone === "field",
    *resolve(fx) {
      if (fx.event?.type === "attackDeclared") yield* fx.dealDamage(fx.event.target, 2);
    },
  },
  // BP05-001 "Activate {[cost02]}: Put this card into its owner's cemetery." (given to the
  // follower it changes into an amulet).
  activateBury2: {
    kind: "activated",
    cost: { playPoints: 2 },
    *resolve(fx) {
      yield* fx.bury([fx.self]);
    },
  },
  // BP06-018 "Strike - Refresh this follower. Perform only once per turn." (CR 10.7.2.2)
  strikeRefreshOnce: {
    kind: "automatic",
    timing: "strike",
    oncePerTurn: true,
    trigger: (e, me) => !me.lookBack && e.type === "attackDeclared" && e.attacker === me.card,
    *resolve(fx) {
      yield* fx.refresh([fx.self]);
    },
  },
  // BP07-038 "{[lastwords]} Banish this follower." (given with Storm when it is summoned from the
  // cemetery). Triggers with the information it had on the field (CR 10.7.4.1); "this follower"
  // is the card in the cemetery (CR 4.1.4.1).
  lastWordsBanishSelf: {
    kind: "automatic",
    timing: "lastWords",
    trigger: (e, me) =>
      me.lookBack &&
      e.type === "cardsMoved" &&
      e.moves.some((m) => m.card === me.card && m.from?.zone === "field" && m.to.zone === "cemetery"),
    *resolve(fx) {
      if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.banish([fx.self]);
    },
  },
  // BP08-106 "At the start of your end phase, return this card to its owner's hand." The ability
  // belongs to the summoned follower and remains if Sahaquiel leaves (CR 10.9.1.2).
  returnToHandAtEnd: {
    kind: "automatic",
    timing: "other",
    trigger: (e, me) => !me.lookBack && e.type === "phaseStarted" && e.phase === "end" && e.player === me.controller,
    *resolve(fx) {
      if (fx.game.card(fx.self)?.zone === "field") yield* fx.returnToHand([fx.self]);
    },
  },
  // BP03-083 "Strike: Select an enemy follower and deal it damage equal to this follower's attack."
  strikeByAttack: {
    kind: "automatic",
    timing: "strike",
    trigger: (e, me) => !me.lookBack && e.type === "attackDeclared" && e.attacker === me.card,
    targets: [enemyFollower()],
    *resolve(fx) {
      const target = fx.targets[0]?.[0];
      if (target === undefined) return;
      yield* fx.dealDamage(target, fx.game.info(fx.self).attack ?? 0);
    },
  },
  // BP12-029/030 (given by Lilje, Butler of the Mists to each Azord, Duke of the Mists on its
  // field): "Strike - Give this follower +2/+2."
  strikePlus2: {
    kind: "automatic",
    timing: "strike",
    trigger: (e, me) => !me.lookBack && e.type === "attackDeclared" && e.attacker === me.card,
    *resolve(fx) {
      if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
    },
  },
  // BP11-011 (given to Pixie tokens for the rest of the turn): "Activate {[engage]}: Select an
  // enemy follower on the field. Deal 3 damage to it and 1 damage to its leader."
  activateEngageDamage3: {
    kind: "activated",
    cost: { engageSelf: true },
    targets: [enemyFollower()],
    *resolve(fx) {
      const target = fx.targets[0]![0]!;
      const leader = fx.game.leader(fx.game.controller(target));
      yield* fx.dealDamage(target, 3);
      yield* fx.dealDamage(leader, 1);
    },
  },
};

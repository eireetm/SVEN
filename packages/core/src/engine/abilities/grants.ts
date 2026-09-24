import type { GrantedAbilityId } from "../../model/state";
import type { AutomaticAbility } from "../../script/types";
import { enemyFollower } from "../../script/targets";

/**
 * Abilities an effect can give a card (`EffectChange` kind "grantedAbility"). They are not
 * printed on a definition, so pending instances use the pseudo definition id "grant:<id>".
 * The card that has the effect is "this card"; its current controller is the ability's
 * controller (CR 3.1.2.3).
 */
export const GRANT_PREFIX = "grant:";

export const GRANT_ABILITIES: Record<GrantedAbilityId, AutomaticAbility> = {
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
};

// BP10-004 Spinaria & Lucille, Keepers — Forestcraft advanced follower, 10, 6/6. 超克.
// {[fanfare]} Deal 6 damage to each enemy leader and enemy follower on the field. Look at the top 2
// cards of your deck. You may put up to 2 of them into your EX area. Bury the rest.
// Whenever an enemy follower is put onto the field, {[engage]}: Deal it 6 damage. (Once however
// many enter together: one of them; not a "select", so Aura doesn't stop it; also in your turn; if
// this card has left, the cost can't be paid — rulings.)
// At the start of your end phase, refresh this card.
import type { EffectContext } from "../../engine/effects/context";
import { engageThis } from "../costs";
import { atStartOfYourEndPhase, defineCard, fanfare, lookAtTopCards } from "../helpers";
import type { AutomaticAbility } from "../types";

/** The enemy followers that entered in the triggering event and are still on the field. */
function entered(fx: EffectContext): string[] {
  const e = fx.event;
  if (e?.type !== "cardsMoved") return [];
  const opponent = fx.game.opponent(fx.controller);
  return e.moves
    .filter((m) => m.to.zone === "field" && m.from?.zone !== "field" && m.to.player === opponent && m.newCard !== null)
    .map((m) => m.newCard!)
    .filter((id) => fx.game.card(id)?.zone === "field" && fx.game.info(id).type === "follower");
}

const punish: AutomaticAbility = {
  kind: "automatic",
  timing: "other",
  trigger: (e, me, g) =>
    !me.lookBack &&
    e.type === "cardsMoved" &&
    e.moves.some(
      (m) =>
        m.to.zone === "field" &&
        m.from?.zone !== "field" &&
        m.to.player !== me.controller &&
        m.newCard !== null &&
        g.card(m.newCard)?.zone === "field" &&
        g.info(m.newCard).type === "follower",
    ),
  cost: engageThis,
  *resolve(fx) {
    const [target] = yield* fx.chooseCards(entered(fx), 1, 1);
    if (target !== undefined) yield* fx.dealDamage(target, 6);
  },
};

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.game.leader(opponent), ...fx.game.followers(opponent)], 6);
        yield* lookAtTopCards(fx, 2, { filter: () => true, to: "ex", max: 2, rest: "cemetery" });
      },
    }),
    punish,
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
      },
    }),
  ],
});

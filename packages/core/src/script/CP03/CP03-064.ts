// CP03-064 Seal Dragon, Blockade — Dragoncraft follower, 2, 3/2. ヴァンガード・かげろう.
// During your turn, whenever an opponent plays a spell, deal 2 damage to their leader. (It resolves even if the spell destroyed
// this — ruling.)
// Once on each of your turns, when a Kagero card you control deals ability damage to an enemy follower on the field, draw a card.
// (Ability damage: any damage but combat and attack damage — ruling; the source as it is when it deals it.)
import type { AutomaticAbility } from "../types";
import { defineCard } from "../helpers";
import { isSpell } from "../targets";

const opponentPlaysSpell: AutomaticAbility = {
  kind: "automatic",
  timing: "other",
  trigger: (e, me, game) =>
    !me.lookBack && e.type === "cardPlayed" && e.player !== me.controller && game.activePlayer === me.controller && isSpell(game, e.card),
  *resolve(fx) {
    yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
  },
};

const kageroAbilityDamage: AutomaticAbility = {
  kind: "automatic",
  timing: "other",
  oncePerTurn: true,
  trigger: (e, me, game) => {
    if (me.lookBack || e.type !== "damageDealt" || e.kind !== "ability" || e.amount <= 0 || game.activePlayer !== me.controller) return false;
    const source = e.source === null ? undefined : game.card(e.source);
    const target = game.card(e.target);
    if (!source || !target || target.zone !== "field" || target.controller === me.controller || source.controller !== me.controller) return false;
    return game.info(e.source!).traits.includes("かげろう") && game.info(e.target).type === "follower";
  },
  *resolve(fx) {
    yield* fx.draw(1);
  },
};

export default defineCard({
  abilities: [opponentPlaysSpell, kageroAbilityDamage],
});

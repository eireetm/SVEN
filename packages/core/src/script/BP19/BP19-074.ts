// BP19-074 Istyndet, Soul Convict — Abysscraft follower, 2, 3/2. 八獄・死霊術師.
// Once on each of your turns, whenever you have at least 10 cards in your cemetery and another 3-cost or lower Condemned
// follower on your field is put into the cemetery, summon it. Its {[fanfare]} abilities don't activate.
// (Also when this leaves at the same time, CR 10.7.4.2; the 10 cards are counted before that follower arrives: 9 plus it is
// not enough — rulings. 元のコスト.)
// {[fanfare]} Bury the top 2 cards of your deck.
// Activate {[engage]} this and bury a Condemned follower on your field not named Istyndet, Soul Convict: Select an enemy
// follower on the field and destroy it.
import type { AutomaticAbility, CustomCost } from "../types";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, named } from "../targets";
import { condemnedFollower } from "./shared";

const istyndet = named("Istyndet, Soul Convict");

const raiseCondemned: AutomaticAbility = {
  kind: "automatic",
  timing: "other",
  oncePerTurn: true,
  triggerIf: (g, c) => g.activePlayer === c,
  trigger: (e, me, game) => {
    if (e.type !== "cardsMoved" || me.zone !== "field") return false;
    const intoMyCemetery = e.moves.filter((m) => m.to.zone === "cemetery" && m.to.player === me.controller).length;
    if (game.cards(me.controller, "cemetery").length - intoMyCemetery < 10) return false;
    return e.moves
      .filter(
        (m) =>
          m.card !== me.card &&
          m.from?.zone === "field" &&
          m.to.zone === "cemetery" &&
          m.before !== null &&
          m.before.controller === me.controller &&
          m.newCard !== null &&
          game.db.get(m.before.abilityDef).type === "follower" &&
          (m.before.traits ?? []).includes("八獄") &&
          (game.db.get(m.def).cost ?? Infinity) <= 3,
      )
      .map((m) => ({ card: m.newCard! }));
  },
  *resolve(fx) {
    const card = fx.data?.card;
    if (card === undefined || fx.game.card(card)?.zone !== "cemetery") return;
    for (const id of yield* fx.putOntoField([card])) yield* fx.blockFanfare(id);
  },
};

const buryOtherCondemned: CustomCost = {
  canPay: (g, c) => g.followers(c).some((id) => condemnedFollower(g, id) && !istyndet(g, id)),
  *pay(fx) {
    const cards = fx.game.followers(fx.controller).filter((id) => condemnedFollower(fx.game, id) && !istyndet(fx.game, id));
    yield* fx.bury(yield* fx.chooseCards(cards, 1, 1));
  },
};

export default defineCard({
  abilities: [
    raiseCondemned,
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
    activated(
      { engageSelf: true, custom: buryOtherCondemned },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      },
    ),
  ],
});

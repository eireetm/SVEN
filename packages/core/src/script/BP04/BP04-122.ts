// BP04-122 Staircase to Paradise — Neutral amulet, 1. 天使.
// Whenever a follower is put from your field into a cemetery, put a soul counter on this card.
// Once per follower (two at once: two counters), tokens included (they go to the cemetery, then
// vanish); a banished follower does not count (rulings).
// Activate {[engage]}, put this card into its owner's cemetery: Look at the top 5 cards of your
// deck. You may reveal up to 2 followers from among them and add them to your hand. Put the
// remaining cards on the bottom of your deck in any order. This ability can be activated if this
// card has at least 6 soul counters.
import type { GameEvent } from "../../events/types";
import type { TriggerSubject } from "../types";
import type { GameReader } from "../../engine/query";
import { activated, defineCard } from "../helpers";
import { isFollower } from "../targets";

function followersToCemetery(e: GameEvent, me: TriggerSubject, game: GameReader) {
  // Not when this card itself leaves at the same time: it could not hold the counter.
  if (me.lookBack || e.type !== "cardsMoved") return [];
  return e.moves
    .filter(
      (m) =>
        m.from?.zone === "field" &&
        m.to.zone === "cemetery" &&
        m.before?.controller === me.controller &&
        game.db.get(m.before.abilityDef).type === "follower",
    )
    .map(() => ({}));
}

export default defineCard({
  abilities: [
    {
      kind: "automatic",
      timing: "other",
      trigger: followersToCemetery,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.addCounters(fx.self, "soul", 1);
      },
    },
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, _p, self) => g.counters(self, "soul") >= 6,
        *resolve(fx) {
          const top = fx.topCards(5);
          const followers = top.filter((id) => isFollower(fx.game, id));
          const chosen = yield* fx.selectCards(followers, 0, Math.min(2, followers.length), fx.controller, top);
          if (chosen.length > 0) {
            yield* fx.reveal(chosen);
            yield* fx.returnToHand(chosen);
          }
          yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
        },
      },
    ),
  ],
});

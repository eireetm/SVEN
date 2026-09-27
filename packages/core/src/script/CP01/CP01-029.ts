// CP01-029 Daiwa Scarlet — Runecraft follower, 4, 3/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Search your deck for an Umamusume spell, reveal it, and add it to your hand.
// While this card is on your field, the 1st Umamusume spell you play each turn costs 1 less to play. (Spells played before it
// came count; two of them make it 2 less; on the opponent's turn too — rulings; CR 10.4.4.1.)
// When you play a spell, if it's your 3rd this turn, select an Umamusume follower on your field. Give it and this follower
// Storm. (It may select itself; spells played before it came count — rulings.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare, serveAbility, whenYouPlay } from "../helpers";
import { isSpell, yourFollower } from "../targets";
import { umamusume } from "./shared";

const spellsPlayed = (g: GameReader, p: PlayerId, filter: (d: { type: string; traits: readonly string[] }) => boolean) =>
  g.cardsPlayedThisTurn(p).filter((def) => filter(g.db.get(def))).length;
const umamusumeSpell = (d: { type: string; traits: readonly string[] }) => d.type === "spell" && d.traits.includes("ウマ娘");

export default defineCard({
  field: {
    playCostOf: (g, self, card, player) =>
      player === g.card(self)!.controller && isSpell(g, card) && umamusume(g, card) && spellsPlayed(g, player, umamusumeSpell) === 0 ? -1 : 0,
  },
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => isSpell(fx.game, id) && umamusume(fx.game, id));
      },
    }),
    whenYouPlay(
      {
        triggerIf: (g, c) => spellsPlayed(g, c, (d) => d.type === "spell") === 3,
        targets: [yourFollower({ filter: umamusume })],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.giveKeyword(target, "storm");
          if (target !== fx.self && fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
        },
      },
      isSpell,
    ),
  ],
});

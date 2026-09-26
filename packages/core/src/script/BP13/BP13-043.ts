// BP13-043 Whims of Chaos — Runecraft spell, 6. 魔法使い・禁忌.
// Each player declares a follower on their field and, starting with the active player, gives control of it
// to another player of their choice. (Move it to the field of another player whose field isn't full.)
// (CR 5.22.2. Rulings: the active player declares, then the other player, knowing it; then the active
// player gives theirs, then the other player. Declaring is not selecting, so Aura doesn't stop it. A
// given card keeps its damage and effects, doesn't trigger Fanfare, can't attack that turn without Storm
// or Rush, and goes to its owner's zones when it leaves the field.)
import type { CardId } from "../../model/ids";
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const active = fx.game.activePlayer;
        const players = [active, fx.game.opponent(active)];
        const declared: (CardId | undefined)[] = [];
        for (const p of players) {
          const [card] = yield* fx.chooseCards(fx.game.followers(p), 1, 1, p);
          declared.push(card);
        }
        for (const [i, p] of players.entries()) {
          const card = declared[i];
          if (card !== undefined && fx.game.card(card)?.zone === "field" && fx.game.controller(card) === p) {
            yield* fx.giveControl(card, fx.game.opponent(p));
          }
        }
      },
    }),
  ],
});

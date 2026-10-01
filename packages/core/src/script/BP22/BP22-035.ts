// BP22-035 清白の騎士 — Swordcraft follower, 1, 2/2. 指揮官.
// ファンファーレEXエリアの兵士・フォロワー1枚を消滅：1枚引く。
// (Fanfare - Banish an Officer follower from your EX area (CR 10.4.3): draw a card.)
import { banishFromYourEx } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { isFollower } from "../targets";
import { officer } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYourEx((g, id) => isFollower(g, id) && officer(g, id), 1),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});

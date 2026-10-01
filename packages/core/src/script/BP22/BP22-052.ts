// BP22-052 氷塊のゴーレム — Runecraft follower, 8, 7/7. ゴーレム.
// ファンファーレ自分のデッキから「これと同名を除くゴーレム・フォロワー」1枚を探し、場に出す。
// (Fanfare - Search your deck for a Golem follower not named 氷塊のゴーレム and summon it (it may be left unfound, CR 5.8.1.2).)
import { defineCard, fanfare } from "../helpers";
import { isFollower, named } from "../targets";
import { golem, ICEBLOCK_GOLEM } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isFollower(g, id) && golem(g, id) && !named(ICEBLOCK_GOLEM)(g, id), { to: "field" });
      },
    }),
  ],
});

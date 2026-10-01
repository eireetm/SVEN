// BP22-026 クレイモアマスター — Swordcraft follower, 5, 4/4. 指揮官.
// これをプレイする際、自分のエボルヴデッキの表向きのエボルヴフォロワーが5枚以上なら、コストを-3する。自分のエボルヴデッキの表向きのエボル
// ヴフォロワーが10枚なら、代わりに-5する。
// 【疾走】
// (This costs 3 less to play if there are at least 5 faceup evolved followers in your evolve deck, 5 less if there are 10.
// Storm. Faceup Drive Points, Carrots, advanced followers and evolved amulets don't count (rulings).)
import { defineCard } from "../helpers";
import { isEvolvedFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  playCost: (g, _self, player) => {
    const n = g.faceUpEvolveDeck(player).filter((id) => isEvolvedFollower(g, id)).length;
    return n === 10 ? -5 : n >= 5 ? -3 : 0;
  },
});

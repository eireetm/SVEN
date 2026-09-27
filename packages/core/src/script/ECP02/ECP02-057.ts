// ECP02-057 Takumi Mukai [No One Can Stop Me] — Abysscraft follower, 6, 5/5. デレマス・パッション.
// Rush. Assail.
// {[fanfare]} Select a Passion follower in your cemetery that costs 3 or less and summon it. (元のコスト.)
// During your turn, whenever an iM@S CG card on your field deals damage to 1 or more enemy followers on the field, deal 1 damage to
// each enemy leader. (Combat damage too; once for damage dealt at the same time; a follower with 0 or less attack deals none; a
// Fanfare resolved after its follower was destroyed counts, by its last-known information — rulings. Only damage from the field:
// an iM@S CG spell's damage and an ability used from the hand (ECP02-041) don't count — a judge's answer, via the project owner.)
import { defineCard, fanfare, whenYourCardDamagesEnemyFollowers } from "../helpers";
import { costAtMost, inYourZone } from "../targets";
import { damageEnemyLeader, followerThat, passion } from "./shared";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: (g, id) => followerThat(passion)(g, id) && costAtMost(3)(g, id) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
    whenYourCardDamagesEnemyFollowers(
      {
        triggerIf: (g, c) => g.activePlayer === c,
        *resolve(fx) {
          yield* damageEnemyLeader(fx, 1);
        },
      },
      (by) => by.onField && by.traits.includes("デレマス"),
    ),
  ],
});

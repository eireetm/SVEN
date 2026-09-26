// BP08-024 Durandal the Incorruptible — Swordcraft amulet, 3. 指揮官.
// Activate, engage: choose +1 attack, +1 defense, or cap each damage instance at 3 for this turn
// and during each opponent's next turn (rulings; CR 5.18, 10.10.2).
import { activated, defineCard } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        modes: [
          {
            id: "attack",
            label: "Give a follower +1 attack",
            targets: [yourFollower()],
            *resolve(fx) { yield* fx.giveStats(fx.targets[0]![0]!, 1, 0); },
          },
          {
            id: "defense",
            label: "Give a follower +1 defense",
            targets: [yourFollower()],
            *resolve(fx) { yield* fx.giveStats(fx.targets[0]![0]!, 0, 1); },
          },
          {
            id: "cap",
            label: "A follower takes at most 3 damage from each instance",
            targets: [yourFollower()],
            *resolve(fx) { yield* fx.capDamage(fx.targets[0]![0]!, 3, "endOfOpponentsNextTurn"); },
          },
        ],
      },
    ),
  ],
});

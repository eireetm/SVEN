// CP04-114 Ameth (Evolved) — Neutral, 3/3. プリコネ.
// {[ub]} On Evolve - Choose 1. (1) Select another follower on your field and give it Ward. (2) Select a PriConne follower on your
// field not named Ameth and, if {[ub]} abilities you control have executed at least 2 other times this turn, execute 1 of its {[ub]}
// abilities without paying its cost. (CR 14.5.1.4. Rulings: this one and the executed one both count, each triggering "whenever a
// {[ub]} ability ... is executed"; a "once per turn" one already used can be executed; costs are not paid, X is 0; one given by
// equipment counts as its own; one it lost, or an evolved follower without any, does nothing; (1) without another follower can't be
// chosen. The scraped official English text belongs to another card.)
import { defineCard, onEvolve, ub } from "../helpers";
import { anotherYourFollower, named, yourFollower } from "../targets";
import { otherUnionBursts, priconne } from "./shared";

export default defineCard({
  abilities: [
    ub(
      onEvolve({
        modes: [
          {
            id: "1",
            label: "Give another follower Ward",
            targets: [anotherYourFollower()],
            *resolve(fx) {
              yield* fx.giveKeyword(fx.targets[0]![0]!, "ward");
            },
          },
          {
            id: "2",
            label: "Execute a Union Burst ability of a PriConne follower",
            targets: [yourFollower({ filter: (g, id) => priconne(g, id) && !named("Ameth")(g, id) })],
            *resolve(fx) {
              const target = fx.targets[0]![0]!;
              if (otherUnionBursts(fx) >= 2 && fx.game.card(target)?.zone === "field") yield* fx.executeUnionBurst(target);
            },
          },
        ],
      }),
    ),
  ],
});

// BP18-120 Togh Keyoh, Neometropolis — Neutral amulet, 1. 透京.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a Togh Keyoh card not named Togh Keyoh, Neometropolis from
// among them and add it to your hand. Put the rest on the bottom of your deck in any order.
// {[act]} {[cost01]}, engage this, banish this: Select a Togh Keyoh follower on your field. Give it
// {[attack]}+1/{[defense]}+1 and your leader {[defense]}+1. (Not without a target — ruling.)
import { banishThis } from "../costs";
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { named, yourFollower } from "../targets";
import { toghKeyoh } from "./shared";

const neometropolis = named("Togh Keyoh, Neometropolis");

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: (g, id) => toghKeyoh(g, id) && !neometropolis(g, id), to: "hand" });
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, custom: banishThis },
      {
        targets: [yourFollower({ filter: toghKeyoh })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});

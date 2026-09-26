// BP19-007 Warden of Balms — Forestcraft follower, 6, 6/6. 八獄・植物族・虫族.
// Ward.
// {[fanfare]}/{[lastwords]} Deal 3 damage to each enemy leader.
// Activate Discard this: Select a Condemned follower on your field and destroy it. Deal 1 damage to each enemy leader. Draw a
// card. (Valid in the hand; not without a target — rulings.)
import { discardThis } from "../costs";
import { activated, defineCard, fanfare, lastWords, type TimingSpec } from "../helpers";
import { yourFollower } from "../targets";
import { condemned } from "./shared";

const scorch: TimingSpec = {
  *resolve(fx) {
    yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3);
  },
};

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare(scorch),
    lastWords(scorch),
    activated(
      { custom: discardThis },
      {
        validIn: ["hand"],
        targets: [yourFollower({ filter: condemned })],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});

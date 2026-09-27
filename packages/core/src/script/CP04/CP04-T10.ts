// CP04-T10 Skullfather — Abysscraft follower token, 1, 2/1. プリコネ・ディアボロス.
// Rush.
// {[lastwords]} Select up to 2 Diabolos followers on your field and give them {[attack]}+1.
import { defineCard, lastWords } from "../helpers";
import { yourFollower } from "../targets";
import { diabolos } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    lastWords({
      targets: [yourFollower({ filter: diabolos, count: 2, upTo: true })],
      *resolve(fx) {
        for (const id of fx.targets[0]!) yield* fx.giveStats(id, 1, 0);
      },
    }),
  ],
});

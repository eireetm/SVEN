// BP18-066 Neon-Tailed Prefect — Dragoncraft follower, 2, 1/3. 透京・ドラゴニュート・武闘竜人.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select another Draconic Duelist follower on your field and give it {[attack]}+1.
// Whenever a Draconic Duelist follower with at least 4 attack on your field attacks, give it {[attack]}+1.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";
import { draconicDuelist } from "./shared";
import { prefectPush } from "./shared-dragon";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [anotherYourFollower({ filter: draconicDuelist })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 0);
      },
    }),
    prefectPush,
  ],
});

// BP17-016 Elf Sorcerer — Forestcraft follower, 6, 5/5. エルフ族.
// {[fanfare]}/{[lastwords]} Select an enemy follower on the field and give it {[attack]}-5/{[defense]}-5.
import { defineCard, fanfare, lastWords, type TimingSpec } from "../helpers";
import { enemyFollower } from "../targets";

const curse: TimingSpec = {
  targets: [enemyFollower()],
  *resolve(fx) {
    yield* fx.giveStats(fx.targets[0]![0]!, -5, -5);
  },
};

export default defineCard({ abilities: [fanfare(curse), lastWords(curse)] });

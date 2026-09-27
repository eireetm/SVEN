// CP03-110 Evil-Eye Princess, Euryale — Havencraft follower, 2, 2/3. ヴァンガード・オラクルシンクタンク.
// Rush. Twin Drive.
// Once on each of your turns, when you drive check a Trigger, draw a card. (Only a resolved Trigger — ruling.)
import { defineCard, whenYouDriveCheckTrigger } from "../helpers";

export default defineCard({
  keywords: ["rush", "twinDrive"],
  abilities: [
    whenYouDriveCheckTrigger({
      oncePerTurn: true,
      triggerIf: (g, c) => g.activePlayer === c,
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});

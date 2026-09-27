// CP03-021 Officer Cadet, Erikk — Forestcraft amulet, 2. ヴァンガード・アクアフォース.
// Starting Amulet. (All cards with Starting Amulet in your deck must share the same name.) (CR 14.4.4: the deck check and the
// facedown start on the field are the engine's.)
// Activate {[engage]}, bury this card: Select a 1-cost Aqua Force follower on your field and give it Storm. (元のコスト.)
import { activated, defineCard } from "../helpers";
import { yourFollower } from "../targets";
import { aquaForce } from "./shared";

export default defineCard({
  keywords: ["startingAmulet"],
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: (g, id) => aquaForce(g, id) && g.info(id).cost === 1 })],
        *resolve(fx) {
          yield* fx.giveKeyword(fx.targets[0]![0]!, "storm");
        },
      },
    ),
  ],
});

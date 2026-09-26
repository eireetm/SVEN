// BP16-099 Salefa, Guardian of Water — Havencraft follower, 2, 2/3. 信仰・先導・光輝.
// {[fanfare]} {[engage]} an amulet on your field: Select an enemy follower on the field. It can't attack enemies during
// its controller's next turn.
// Activate {[engage]} an amulet on your field: Select an enemy follower on the field. It can't attack enemies during its
// controller's next turn. Activate only once per turn. (Neither followers nor leaders — ruling; a reserved amulet,
// CR 10.4.6.)
import { engageYourCards } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { isAmulet } from "../targets";
import { frostwardLock } from "./shared-forest";

export default defineCard({
  abilities: [
    fanfare({ ...frostwardLock, cost: engageYourCards(isAmulet) }),
    activated({ custom: engageYourCards(isAmulet) }, { oncePerTurn: true, ...frostwardLock }),
  ],
});

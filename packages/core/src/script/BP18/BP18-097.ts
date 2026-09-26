// BP18-097 Seishiro, Admonishing Faith — Havencraft follower, 3, 3/3. 透京・信仰.
// {[evolve]} {[cost01]}: Evolve this.
// Whenever your leader gains {[defense]}, select an enemy follower on the field and deal it 2 damage.
import { defineCard, evolveAbility } from "../helpers";
import { judgment } from "./shared-haven";

export default defineCard({
  abilities: [evolveAbility(1), judgment],
});

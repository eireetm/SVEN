// BP18-062 Dragon-Eyed Secretary — Dragoncraft follower, 2, 2/2. 透京・ドラゴニュート・武闘竜人.
// {[evolve]} {[cost01]}: Evolve this.
// Whenever a Draconic Duelist follower with at least 4 attack on your field attacks, give your leader{[defense]}+1.
import { defineCard, evolveAbility } from "../helpers";
import { secretaryHeal } from "./shared-dragon";

export default defineCard({
  abilities: [evolveAbility(1), secretaryHeal],
});

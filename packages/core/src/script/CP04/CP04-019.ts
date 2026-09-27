// CP04-019 Pecorine — Swordcraft follower, 3, 3/3. プリコネ・美食殿.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} {[cost02]} Equip this with a Princess Sword token.
import { defineCard, equipFanfare, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [evolveAbility(1), equipFanfare("Princess Sword", 2)],
});

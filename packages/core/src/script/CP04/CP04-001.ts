// CP04-001 Kokkoro — Forestcraft follower, 1, 1/1. プリコネ・美食殿.
// {[ub]}{[fanfare]} Give your leader {[defense]}+1.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} {[cost02]} Equip this with an Ameth Amulet token. (Both Fanfares resolve in any order — ruling.)
import { defineCard, equipFanfare, evolveAbility, fanfare, ub } from "../helpers";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      }),
    ),
    evolveAbility(1),
    equipFanfare("Ameth Amulet", 2),
  ],
});

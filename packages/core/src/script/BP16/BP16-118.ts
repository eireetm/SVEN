// BP16-118 Apollo, Heaven's Envoy — Neutral follower, 3, 3/3. 大神.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Deal 1 damage to each enemy leader and each enemy follower on the field.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { heavensEnvoyRain } from "./shared-neutral";

export default defineCard({ abilities: [evolveAbility(1), fanfare({ resolve: heavensEnvoyRain })] });

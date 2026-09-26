// BP16-119 Apollo, Heaven's Envoy (Evolved) — Neutral follower, 4/4. 大神.
// On Evolve - Deal 1 damage to each enemy leader and each enemy follower on the field.
import { defineCard, onEvolve } from "../helpers";
import { heavensEnvoyRain } from "./shared-neutral";

export default defineCard({ abilities: [onEvolve({ resolve: heavensEnvoyRain })] });

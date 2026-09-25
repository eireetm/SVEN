// BP07-002 Ladica, the Stoneclaw (Evolved) — 6/6.
// Storm.
// Whenever a Naterran Great Tree is put onto your field, recover 1 play point.
import { defineCard } from "../helpers";
import { ladicaRecovers } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [ladicaRecovers],
});

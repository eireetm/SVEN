// BP12-026 Nano, the Dawnblade (Evolved) — Swordcraft follower, 2/2. 兵士・超克.
// Bane.
// While there's a Lecia, Sky Saber on your field, this follower has Assail. (A passive: it follows
// Lecia; an attack already declared goes on without it — rulings.)
import { defineCard } from "../helpers";
import { nanoAssail } from "./shared-sword";

export default defineCard({ keywords: ["bane"], selfKeywords: nanoAssail });

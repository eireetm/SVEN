import type { CardClass, CardDefinition } from "../model/card";

/**
 * Synthetic card definitions for rule tests. Tests of rules should not depend on real card
 * data (which changes as sets are added); they build exactly the cards they need.
 */
interface Common {
  name?: string;
  class?: CardClass;
  traits?: string[];
  text?: string;
}

function base(id: string, o: Common): Omit<CardDefinition, "type" | "cost" | "attack" | "defense" | "evolved" | "token"> {
  const name = o.name ?? id;
  return {
    id,
    printings: [id],
    name,
    names: { en: name, cn: null, ja: null },
    class: o.class ?? "Neutral",
    traits: o.traits ?? [],
    text: { en: o.text ?? "", cn: null, ja: null },
  };
}

export function testFollower(id: string, cost: number, attack: number, defense: number, o: Common = {}): CardDefinition {
  return { ...base(id, o), type: "follower", cost, attack, defense, evolved: false, token: false };
}

/** An evolved card for the follower named `baseName` (CR 5.16.1.1.1 matches by name). */
export function testEvolved(id: string, baseName: string, attack: number, defense: number, o: Common = {}): CardDefinition {
  return { ...base(id, { ...o, name: baseName }), type: "follower", cost: null, attack, defense, evolved: true, token: false };
}

export function testSpell(id: string, cost: number, o: Common = {}): CardDefinition {
  return { ...base(id, o), type: "spell", cost, attack: null, defense: null, evolved: false, token: false };
}

export function testAmulet(id: string, cost: number, o: Common = {}): CardDefinition {
  return { ...base(id, o), type: "amulet", cost, attack: null, defense: null, evolved: false, token: false };
}

export function testToken(id: string, cost: number, attack: number, defense: number, o: Common = {}): CardDefinition {
  return { ...base(id, o), type: "follower", cost, attack, defense, evolved: false, token: true };
}

export function testLeader(id: string, cls: CardClass, o: Common = {}): CardDefinition {
  return { ...base(id, { ...o, class: cls }), type: "leader", cost: null, attack: null, defense: null, evolved: false, token: false };
}

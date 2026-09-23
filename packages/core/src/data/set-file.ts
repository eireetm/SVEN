import type { CardDefinition } from "../model/card";
import { CardDataError } from "./normalize";

/** Format version of the generated `packages/core/data/<SET>.json` files. */
export const CARD_SET_FORMAT = 1;

export interface CardSetFile {
  format: number;
  set: string;
  /** Number of physical printings merged into `cards`. */
  printings: number;
  cards: CardDefinition[];
}

/** Light structural check of a generated set file (it is produced by tools/build-card-data.ts). */
export function readCardSetFile(json: unknown): CardSetFile {
  const f = json as Partial<CardSetFile>;
  if (!f || f.format !== CARD_SET_FORMAT || typeof f.set !== "string" || !Array.isArray(f.cards)) {
    throw new CardDataError(`unsupported card set file (format ${String(f?.format)}); re-run npm run build:cards`);
  }
  return f as CardSetFile;
}

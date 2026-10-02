/// <reference types="vite/client" />
// The restriction lists (restrictions/*.json, see the README there): the cards a format bans or limits to 1 copy, per region.
// Every file of the folder is read (a new list is a new file); its name is the list's id.
import type { FormatId } from "../engine/protocol";

export interface ListedCard {
  /** A card number (any printing of the card). */
  card: string;
  /** The name the official page gives (checked against the card data by the tests). */
  name: string;
  since: string;
  note?: string;
}

export interface RestrictionList {
  /** The file's name ("01_26_JPN"). */
  id: string;
  format: Exclude<FormatId, "unlimited">;
  /** asia: the Japanese site's lists; en: the English site's; china: mainland China's. */
  region: "asia" | "en" | "china";
  /** The official list's last update (YYYY-MM-DD). */
  updated: string;
  /** The official page, if there is one. */
  source?: string;
  /** Cross Craft: cards of each leader's class the main deck needs at least (the region's rule; CR Appendix B-2: 1). */
  minimumPerLeaderClass?: number;
  /** Not one copy in a deck. */
  banned: readonly ListedCard[];
  /** One copy at most (殿堂入り, "Restricted to 1"). */
  limited: readonly ListedCard[];
}

const files = import.meta.glob<Omit<RestrictionList, "id">>("../../restrictions/*.json", { eager: true, import: "default" });

/** Every list, the newest first. */
export const RESTRICTION_LISTS: readonly RestrictionList[] = Object.entries(files)
  .map(([path, list]) => ({ ...list, id: path.replace(/^.*\//, "").replace(/\.json$/, "") }))
  .sort((a, b) => b.updated.localeCompare(a.updated) || a.id.localeCompare(b.id));

/** The lists of a format. */
export const listsFor = (format: FormatId): RestrictionList[] => RESTRICTION_LISTS.filter((list) => list.format === format);

/** A list by its id; none for none or a list that isn't there any more. */
export const restrictionList = (id: string | null | undefined): RestrictionList | null => (id ? (RESTRICTION_LISTS.find((list) => list.id === id) ?? null) : null);

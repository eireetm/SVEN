import { useCallback } from "react";
import { useSettings, type UiLang } from "../app/settings";
import { en, type MessageKey } from "./en";
import { zh } from "./zh";

export type { MessageKey } from "./en";

const MESSAGES: Record<UiLang, Record<MessageKey, string>> = { en, zh };

export type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

/** A message with "{name}" parameters filled in. */
export function translate(lang: UiLang, key: MessageKey, params?: Record<string, string | number>): string {
  const text = MESSAGES[lang][key] ?? en[key];
  return params ? text.replace(/\{(\w+)\}/g, (all, name: string) => (name in params ? String(params[name]) : all)) : text;
}

export function useT(): Translate {
  const { uiLang } = useSettings();
  return useCallback<Translate>((key, params) => translate(uiLang, key, params), [uiLang]);
}

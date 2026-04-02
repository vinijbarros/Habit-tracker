import { en } from '../locales/en';
import { es } from '../locales/es';
import { ptBR } from '../locales/pt-BR';

export const locales = {
  'pt-BR': ptBR,
  en,
  es,
};

export type Language = keyof typeof locales;
export type LocaleDictionary = (typeof locales)[Language];

export const defaultLanguage: Language = 'pt-BR';

export const languageOptions: Array<{ code: Language; flag: string; label: string }> = [
  { code: 'pt-BR', flag: '🇧🇷', label: 'Português (BR)' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
];

export function translate(
  dictionary: LocaleDictionary,
  key: string,
  params?: Record<string, string | number>,
): string {
  const value = key.split('.').reduce<unknown>((accumulator, currentKey) => {
    if (typeof accumulator === 'object' && accumulator !== null && currentKey in accumulator) {
      return (accumulator as Record<string, unknown>)[currentKey];
    }

    return undefined;
  }, dictionary);

  if (typeof value !== 'string') {
    return key;
  }

  if (!params) {
    return value;
  }

  return value.replace(/\{\{(.*?)\}\}/g, (_, token: string) => String(params[token.trim()] ?? ''));
}

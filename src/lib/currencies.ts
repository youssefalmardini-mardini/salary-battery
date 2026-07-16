export interface CurrencyOption {
  code: string
  label: string
  locale: string
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'EUR', label: 'Euro', locale: 'nl-NL' },
  { code: 'GBP', label: 'British Pound', locale: 'en-GB' },
  { code: 'CHF', label: 'Swiss Franc', locale: 'de-CH' },
  { code: 'SEK', label: 'Swedish Krona', locale: 'sv-SE' },
  { code: 'NOK', label: 'Norwegian Krone', locale: 'nb-NO' },
  { code: 'DKK', label: 'Danish Krone', locale: 'da-DK' },
  { code: 'PLN', label: 'Polish Złoty', locale: 'pl-PL' },
  { code: 'CZK', label: 'Czech Koruna', locale: 'cs-CZ' },
  { code: 'HUF', label: 'Hungarian Forint', locale: 'hu-HU' },
  { code: 'RON', label: 'Romanian Leu', locale: 'ro-RO' },
  { code: 'BGN', label: 'Bulgarian Lev', locale: 'bg-BG' },
  { code: 'ISK', label: 'Icelandic Króna', locale: 'is-IS' },
]

export const DEFAULT_CURRENCY_CODE = 'EUR'

export function localeForCurrency(code: string): string {
  return CURRENCIES.find((currency) => currency.code === code)?.locale ?? 'nl-NL'
}
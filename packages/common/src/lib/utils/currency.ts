import { CURRENCY_SYMBOLS } from '@gauzy/contracts';

export function getCurrencySymbol(currency: string) {
    return CURRENCY_SYMBOLS[currency] ?? currency;
}

export function currencyFormat(value: number) {
    return Number(value).toFixed(2);
}

export function currencyWithSymbol(value: number, currency: string) {
    return `${getCurrencySymbol(currency)} ${currencyFormat(value)}`;
}

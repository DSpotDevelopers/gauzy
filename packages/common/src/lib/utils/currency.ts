import { CURRENCY_MAP } from '@gauzy/contracts';

export function getCurrencySymbol(currency: string) {
    return CURRENCY_MAP[currency] ?? currency;
}

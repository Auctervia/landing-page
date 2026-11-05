import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";
import { countryOfTimeZone } from "./tzCountry";

export type Country = { iso: CountryCode; name: string; dial: string; flag: string };

/** Flag emoji from an ISO country code (regional indicator letters). */
export const flagOf = (iso: string) => String.fromCodePoint(...[...iso].map((c) => 127397 + c.charCodeAt(0)));

let cache: Country[] | undefined;

/** Every country with its calling code, sorted by name. */
export function countries(): Country[] {
  if (!cache) {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    cache = getCountries()
      .map((iso) => ({ iso, name: names.of(iso) ?? iso, dial: getCountryCallingCode(iso), flag: flagOf(iso) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  return cache;
}

export const countryByIso = (iso: string) => countries().find((c) => c.iso === iso);

/** Best guess at the visitor's country: from their time zone, then their browser locale, then India. */
export function defaultCountry(tz: string): CountryCode {
  const known = (iso?: string): iso is CountryCode => !!iso && !!countryByIso(iso);
  const fromZone = countryOfTimeZone(tz);
  if (known(fromZone)) return fromZone;
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    if (known(region)) return region;
  } catch {
    /* fall through */
  }
  return "IN";
}

/** A valid phone number for that country (a leading + overrides it), or null. */
export function parsePhone(input: string, iso: CountryCode) {
  const p = parsePhoneNumberFromString(input.trim(), iso);
  return p?.isValid() ? p : null;
}

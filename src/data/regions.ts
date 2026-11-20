/** Countries and first-level regions used by the solo leaderboards. */

export type CountryCode = "IN" | "US";

export interface Region {
  code: string;
  name: string;
}

export const COUNTRIES: { code: CountryCode; name: string; flag: string; regionLabel: string }[] = [
  { code: "IN", name: "India", flag: "🇮🇳", regionLabel: "State / UT" },
  { code: "US", name: "United States", flag: "🇺🇸", regionLabel: "State" },
];

export const REGIONS: Record<CountryCode, Region[]> = {
  IN: [
    ["AN", "Andaman and Nicobar Islands"],
    ["AP", "Andhra Pradesh"],
    ["AR", "Arunachal Pradesh"],
    ["AS", "Assam"],
    ["BR", "Bihar"],
    ["CH", "Chandigarh"],
    ["CG", "Chhattisgarh"],
    ["DN", "Dadra and Nagar Haveli and Daman and Diu"],
    ["DL", "Delhi"],
    ["GA", "Goa"],
    ["GJ", "Gujarat"],
    ["HR", "Haryana"],
    ["HP", "Himachal Pradesh"],
    ["JK", "Jammu and Kashmir"],
    ["JH", "Jharkhand"],
    ["KA", "Karnataka"],
    ["KL", "Kerala"],
    ["LA", "Ladakh"],
    ["LD", "Lakshadweep"],
    ["MP", "Madhya Pradesh"],
    ["MH", "Maharashtra"],
    ["MN", "Manipur"],
    ["ML", "Meghalaya"],
    ["MZ", "Mizoram"],
    ["NL", "Nagaland"],
    ["OD", "Odisha"],
    ["PY", "Puducherry"],
    ["PB", "Punjab"],
    ["RJ", "Rajasthan"],
    ["SK", "Sikkim"],
    ["TN", "Tamil Nadu"],
    ["TG", "Telangana"],
    ["TR", "Tripura"],
    ["UP", "Uttar Pradesh"],
    ["UK", "Uttarakhand"],
    ["WB", "West Bengal"],
  ].map(([code, name]) => ({ code, name })),
  US: [
    ["AL", "Alabama"],
    ["AK", "Alaska"],
    ["AZ", "Arizona"],
    ["AR", "Arkansas"],
    ["CA", "California"],
    ["CO", "Colorado"],
    ["CT", "Connecticut"],
    ["DE", "Delaware"],
    ["DC", "District of Columbia"],
    ["FL", "Florida"],
    ["GA", "Georgia"],
    ["HI", "Hawaii"],
    ["ID", "Idaho"],
    ["IL", "Illinois"],
    ["IN", "Indiana"],
    ["IA", "Iowa"],
    ["KS", "Kansas"],
    ["KY", "Kentucky"],
    ["LA", "Louisiana"],
    ["ME", "Maine"],
    ["MD", "Maryland"],
    ["MA", "Massachusetts"],
    ["MI", "Michigan"],
    ["MN", "Minnesota"],
    ["MS", "Mississippi"],
    ["MO", "Missouri"],
    ["MT", "Montana"],
    ["NE", "Nebraska"],
    ["NV", "Nevada"],
    ["NH", "New Hampshire"],
    ["NJ", "New Jersey"],
    ["NM", "New Mexico"],
    ["NY", "New York"],
    ["NC", "North Carolina"],
    ["ND", "North Dakota"],
    ["OH", "Ohio"],
    ["OK", "Oklahoma"],
    ["OR", "Oregon"],
    ["PA", "Pennsylvania"],
    ["RI", "Rhode Island"],
    ["SC", "South Carolina"],
    ["SD", "South Dakota"],
    ["TN", "Tennessee"],
    ["TX", "Texas"],
    ["UT", "Utah"],
    ["VT", "Vermont"],
    ["VA", "Virginia"],
    ["WA", "Washington"],
    ["WV", "West Virginia"],
    ["WI", "Wisconsin"],
    ["WY", "Wyoming"],
  ].map(([code, name]) => ({ code, name })),
};

export function isCountry(c: unknown): c is CountryCode {
  return c === "IN" || c === "US";
}

export function regionName(country: string, code: string): string {
  return REGIONS[country as CountryCode]?.find((r) => r.code === code)?.name ?? code;
}

export function isRegion(country: CountryCode, code: unknown): code is string {
  return typeof code === "string" && REGIONS[country].some((r) => r.code === code);
}

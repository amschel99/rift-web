interface Country {
  countryname: string;
  flag: string;
  code: string;
}

const COUNTRY_PHONES: Array<Country> = [
  { countryname: "Kenya", flag: "🇰🇪", code: "+254" },
  { countryname: "Uganda", flag: "🇺🇬", code: "+256" },
  { countryname: "Ghana", flag: "🇬🇭", code: "+233" },
  { countryname: "Ethiopia", flag: "🇪🇹", code: "+251" },
];

export default COUNTRY_PHONES;

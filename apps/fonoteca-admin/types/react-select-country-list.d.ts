declare module 'react-select-country-list' {
  interface CountryOption {
    label: string;
    value: string;
  }

  interface CountryList {
    getData(): CountryOption[];
    getValue(label: string): string;
    getLabel(value: string): string;
    getLabels(): string[];
    getValues(): string[];
  }

  function countries(): CountryList;
  export default countries;
}

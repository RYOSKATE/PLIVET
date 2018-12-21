export type Lang = 'ja' | 'en';
export type ProgLang = 'c_cpp' | 'java';
export type Theme = 'light' | 'dark';

export interface LangProps extends React.Props<{}> {
  lang: Lang;
}

export interface ProgLangProps extends React.Props<{}> {
  progLang: ProgLang;
}

export interface ThemeProps extends React.Props<{}> {
  theme: Theme;
}

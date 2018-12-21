import ja from './ja';
import en from './en';
const translate = (lang: string, key: string) => {
  if (lang === 'ja') {
    return (ja as any)[key];
  }
  return (en as any)[key];
};
export default translate;

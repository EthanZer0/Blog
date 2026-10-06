import map from '../../lib/upstream-code-languages.json';
export const languageToColorMap: Record<string,string>=Object.fromEntries(Object.entries(map).map(([key,val])=>[key,val.color]));
export const languageToIconMap: Record<string,React.FC<{className?:string}>>=Object.fromEntries(Object.entries(map).map(([key,val])=>[key,({className})=><span className={className} dangerouslySetInnerHTML={{__html:val.svg}}/>]));

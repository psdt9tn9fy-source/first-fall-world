/* Shared 2134 flag paths, used by the state archive and mobile map. */
import { ext } from "./data.js?v=20261007-refactor-3";

export function flagUrl(key){
  const suffix=ext[key]||"jpg";
  return `./assets/flags-hq/${key}-2134.${suffix}`;
}

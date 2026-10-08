import { initIntro } from "./intro.js?v=20261007-refactor-3";
import {initMilitary} from "./military.js?v=20261007-refactor-3";
import { initCharacters } from "./characters.js?v=20261008-character-v9";
import { initAccess } from "./access.js?v=20261007-refactor-3";
import { initNavigation } from "./navigation.js?v=20261007-refactor-3";
import { initNations } from "./nations.js?v=20261007-refactor-3";
import { initEidolon } from "./eidolon.js?v=20261008-brute-focus-zoom-v3";
import { initWorld } from "./world.js?v=20261007-refactor-3";
import { initWorldMobile } from "./world-mobile.js?v=20261007-refactor-3";

initIntro();
initAccess();
initNavigation();
initNations();
initEidolon();
initMilitary();
initCharacters();
initWorld();
initWorldMobile();

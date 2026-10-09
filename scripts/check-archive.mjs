// Pure history-source regression. The archive must not invent a second chronology.
import {strict as assert} from "node:assert";
import {EVENTS} from "../js/data.js";
import {historyRowsFor,HISTORY_PERIODS} from "../js/archive.js";
const expected=["all","chaos","war","counter","rebuild"];
assert.deepEqual(Object.keys(HISTORY_PERIODS),expected);
assert(EVENTS.length>50,"Expected substantial historical chronology");
assert.equal(historyRowsFor("all").length,EVENTS.length);
assert.equal(historyRowsFor("bad").length,0);
const grouped=expected.slice(1).flatMap(key=>historyRowsFor(key));
assert.equal(grouped.length,EVENTS.length,"Period boundaries should cover each event once");
assert.deepEqual(grouped,EVENTS,"Period filtering must retain original chronological sequence");
assert(historyRowsFor("chaos").some(x=>x[0]===2031),"First Descent era missing");
assert(historyRowsFor("rebuild").some(x=>x[0]===2134),"Current era missing");
console.log("PASS: all history events, 4 eras, stable chronological source, filter completeness");

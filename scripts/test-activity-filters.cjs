const assert = require("node:assert/strict");
const filters = require("../assets/js/activity-filters.js");
const activities = [
  {name:"Goal Rush",story:"Score in an open goal",skills:["finishing"],phaseId:"explore",playerCount:{minimum:4,maximum:12},durationMax:12,equipment:["balls","mini-goals"]},
  {name:"Roll and Race",story:"Keeper rolls to a friend",skills:["goalkeeper-distribution","receiving"],phaseId:"explore",playerCount:{minimum:4,maximum:12},durationMax:12,equipment:["balls","goals"]},
  {name:"Win It, Score It",story:"Defend then counter",skills:["defending","transition"],phaseId:"opposed-practice",playerCount:{minimum:4,maximum:10},durationMax:14,equipment:["balls","bibs","mini-goals"]}
];
assert.deepEqual(filters.apply(activities,{}),activities);
assert.deepEqual(filters.apply(activities,{query:"keeper"}).map(x=>x.name),["Roll and Race"]);
assert.deepEqual(filters.apply(activities,{skill:"defending"}).map(x=>x.name),["Win It, Score It"]);
assert.deepEqual(filters.apply(activities,{phase:"opposed-practice"}).map(x=>x.name),["Win It, Score It"]);
assert.deepEqual(filters.apply(activities,{players:"11"}).map(x=>x.name),["Goal Rush","Roll and Race"]);
assert.deepEqual(filters.apply(activities,{maxDuration:"12"}).map(x=>x.name),["Goal Rush","Roll and Race"]);
assert.deepEqual(filters.apply(activities,{equipment:"bibs"}).map(x=>x.name),["Win It, Score It"]);
assert.deepEqual(filters.apply(activities,{goalkeeper:true}).map(x=>x.name),["Roll and Race"]);
assert.deepEqual(filters.apply(activities,{skill:"finishing",equipment:"goals"}),[]);
assert.deepEqual(filters.normalize({query:" x ",players:"-2",maxDuration:"abc",goalkeeper:"true"}),{query:"x",skill:"",phase:"",players:"",maxDuration:"",equipment:"",goalkeeper:false});
assert.deepEqual(filters.options(activities,"equipment"),["balls","bibs","goals","mini-goals"]);
console.log("ok - activity filter behavior");

(function (root, factory) {
  const api = factory();
  if (typeof window !== "undefined") window.SmallSideActivityFilters = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
}(this, function () {
  "use strict";
  const empty = () => ({ query: "", skill: "", phase: "", players: "", maxDuration: "", equipment: "", goalkeeper: false });
  const text = value => typeof value === "string" ? value.trim() : "";
  const positiveInteger = value => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? String(parsed) : "";
  };
  const normalize = value => ({
    query: text(value?.query).slice(0, 80),
    skill: text(value?.skill),
    phase: text(value?.phase),
    players: positiveInteger(value?.players),
    maxDuration: positiveInteger(value?.maxDuration),
    equipment: text(value?.equipment),
    goalkeeper: value?.goalkeeper === true
  });
  const matches = (activity, input) => {
    const state = normalize(input);
    const query = state.query.toLocaleLowerCase();
    if (query && ![activity.name, activity.story, ...(activity.skills || [])].join(" ").toLocaleLowerCase().includes(query)) return false;
    if (state.skill && !(activity.skills || []).includes(state.skill)) return false;
    if (state.phase && activity.phaseId !== state.phase) return false;
    if (state.equipment && !(activity.equipment || []).includes(state.equipment)) return false;
    if (state.goalkeeper && !(activity.skills || []).includes("goalkeeper-distribution")) return false;
    if (state.players) {
      const count = Number(state.players);
      if (!activity.playerCount || count < activity.playerCount.minimum || count > activity.playerCount.maximum) return false;
    }
    if (state.maxDuration && (!Number.isFinite(activity.durationMax) || activity.durationMax > Number(state.maxDuration))) return false;
    return true;
  };
  const apply = (activities, state) => activities.filter(activity => matches(activity, state));
  const options = (activities, field) => [...new Set(activities.flatMap(activity => Array.isArray(activity[field]) ? activity[field] : activity[field] ? [activity[field]] : []))].sort();
  return { empty, normalize, matches, apply, options };
}));

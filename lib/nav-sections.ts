export const NAV_SECTIONS: Record<string, { id: string; title: string }[]> = {
  "/brief": [
    { id: "goal",        title: "Goal" },
    { id: "problem",     title: "Problem" },
    { id: "methodology", title: "Methodology" },
    { id: "assumptions", title: "Assumptions" },
    { id: "solution",    title: "Solution" },
    { id: "limitations", title: "Limitations" },
  ],
  "/solution": [
    { id: "overview",       title: "Overview" },
    { id: "how-it-works",   title: "How it works" },
    { id: "pillars",        title: "Pillars & formula" },
    { id: "data-capture",   title: "Data capture map" },
    { id: "design-choices", title: "Design choices" },
    { id: "how-to-use",     title: "How to use it" },
    { id: "outputs",        title: "Outputs" },
    { id: "privacy",        title: "Privacy & consent" },
    { id: "deployment",     title: "Deployment timeline" },
  ],
  "/prototype": [
    { id: "data-collection", title: "How data is collected" },
    { id: "attendee-view",   title: "What an attendee sees" },
    { id: "scoreboard",      title: "The scoreboard" },
    { id: "data-model",      title: "Data model" },
  ],
};

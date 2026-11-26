export const NAV_SECTIONS: Record<string, { id: string; title: string }[]> = {
  "/brief": [
    { id: "goal",        title: "Context" },
    { id: "problem",     title: "Problem and Consideration" },
    { id: "methodology", title: "Methodology" },
    { id: "solution",    title: "Solution" },
    { id: "limitations", title: "Limitations" },
  ],
  "/model": [
    { id: "how-it-works",    title: "How it works" },
    { id: "data-capture",    title: "Data capture map" },
    { id: "design-choices",  title: "Design choices" },
    { id: "how-to-use",      title: "How to use it" },
    { id: "outputs",         title: "Outputs" },
    { id: "deployment-privacy", title: "Deployment & Privacy" },
    { id: "additional-info", title: "Additional info" },
  ],
};

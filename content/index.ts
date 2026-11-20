import raw from "./portfolio.json";
import { portfolioSchema, type Portfolio } from "./schema";

/**
 * Loads and validates portfolio.json once at module load.
 * Invalid content fails loudly (in dev overlay and at build) instead of rendering half a site.
 */
function load(): Portfolio {
  const result = portfolioSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  • ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`content/portfolio.json is invalid:\n${details}`);
  }
  return result.data;
}

export const portfolio: Portfolio = load();

export const { profile, education, experience, projects, skills, settings } = portfolio;

export { isTodo } from "./schema";
export type * from "./schema";

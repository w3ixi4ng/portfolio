import { z } from "zod";

/**
 * Single source of truth for the shape of content/portfolio.json.
 * Used by content/index.ts (runtime validation), the /admin editor (field errors)
 * and the /api/admin route (validate before write).
 *
 * Convention: any string beginning with "TODO" is a placeholder awaiting real content.
 * Use `isTodo()` to hide/soften placeholders in the UI.
 */

const nonEmpty = (label: string) => z.string().trim().min(1, `${label} is required`);

/** Empty string is allowed so a link can be left blank in the editor. */
const optionalUrl = z.union([z.literal(""), z.url("Must be a full URL (https://…)")]).optional();

/** A path inside /public, e.g. "/projects/bidly.png". Empty or TODO allowed. */
const publicPath = z.string().refine((v) => v === "" || v.startsWith("TODO") || v.startsWith("/"), {
  message: 'Must start with "/" (a path inside /public), or be empty',
});

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex colour like #FF6B6B");

export const islandThemes = ["city", "forest", "beach", "desert", "snow"] as const;

export const profileSchema = z.object({
  name: nonEmpty("Name"),
  title: nonEmpty("Title"),
  pitch: nonEmpty("Pitch"),
  /** Short bio for the About (freefall) cloud card. */
  bio: z.string(),
  location: z.string(),
  email: z.email("Must be a valid email"),
  links: z.object({
    linkedin: optionalUrl,
    github: optionalUrl,
  }),
  resume: publicPath,
  avatar: z.object({
    suitColor: hexColor,
  }),
});

export const educationSchema = z.object({
  school: nonEmpty("School"),
  degree: nonEmpty("Degree"),
  start: nonEmpty("Start"),
  end: nonEmpty("End"),
  highlights: z.array(nonEmpty("Highlight")),
});

export const experienceSchema = z.object({
  company: nonEmpty("Company"),
  team: z.string().optional(),
  role: nonEmpty("Role"),
  start: nonEmpty("Start"),
  end: nonEmpty("End"),
  summary: z.string(),
  bullets: z.array(nonEmpty("Bullet")),
});

export const projectSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only"),
  title: nonEmpty("Title"),
  tagline: nonEmpty("Tagline"),
  badge: z.string().optional(),
  description: nonEmpty("Description"),
  highlights: z.array(nonEmpty("Highlight")),
  role: nonEmpty("Role"),
  stack: z.array(nonEmpty("Stack item")),
  year: z.number().int().min(2000).max(2100),
  period: z.string().optional(),
  links: z.object({
    live: optionalUrl,
    repo: optionalUrl,
    caseStudy: optionalUrl,
  }),
  thumbnail: publicPath,
  islandTheme: z.enum(islandThemes),
  featured: z.boolean().optional(),
});

export const skillGroupSchema = z.object({
  group: nonEmpty("Group name"),
  items: z.array(nonEmpty("Skill")),
});

export const settingsSchema = z.object({
  showResumeDownload: z.boolean(),
  singaporeTouch: z.boolean(),
  easterEggsEnabled: z.boolean(),
  soundDefaultOn: z.boolean(),
  /** Canonical site URL for metadata. "TODO" until a domain is chosen. */
  siteUrl: z.string().refine((v) => v.startsWith("TODO") || URL.canParse(v), {
    message: "Must be a full URL, or start with TODO",
  }),
});

export const portfolioSchema = z
  .object({
    profile: profileSchema,
    education: z.array(educationSchema),
    experience: z.array(experienceSchema),
    projects: z.array(projectSchema),
    skills: z.array(skillGroupSchema),
    funFacts: z.array(nonEmpty("Fun fact")),
    settings: settingsSchema,
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.projects.forEach((p, i) => {
      if (seen.has(p.slug)) {
        ctx.addIssue({
          code: "custom",
          path: ["projects", i, "slug"],
          message: "Slug must be unique",
        });
      }
      seen.add(p.slug);
    });
  });

export type Portfolio = z.infer<typeof portfolioSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type IslandTheme = (typeof islandThemes)[number];

export const isTodo = (v: string | undefined | null): boolean =>
  !v || v.trim() === "" || v.trim().toUpperCase().startsWith("TODO");

---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

# Others
- Every design has its own folder. Should be saved in `src/designs/<design-name>`. design-name is <category>-<index>, for example: "retro-001".
- Every design MUST be based on bootstrap3, Use the local bootstrap files in the `src/public` folder and do not use other third-party libraries, fonts etc.
- Page designs by sections. Each section should be a separate component. For example, a page with a header, hero, features, and footer would have components(if js required): header.component.js, hero.component.js, features.component.js, footer.component.js. This promotes modularity and reusability.
- Use CSS modules for styling. Each component should have its own CSS module file (e.g., header.module.css) that defines styles scoped to that component. Avoid global/shared styles unless absolutely necessary.
- Use unsplash for images. Avoid generic stock photos; choose images that add character and context to the design.

# Notes

- Font font size of html tag is 10px. So, if you want to use font size in rem, you need to multiply it by 10. For example, if you want to use font size of 16px, you can use 1.6rem. But the font size of body tag is 16px, please note this.
- CSS should avoid using syntax that requires compilation, such as nesting and variables in SCSS. Pure CSS or CSS modules can be used to write styles.
- When designing, don't be limited by existing designs, such as functionality, style, layout, etc. The new design should have its own characteristics.

# Verify all image URLs and replace broken ones

Unsplash images can become 404 over time (photo removed, ID changed, etc.). Always verify every image URL before and after deployment.

## Steps to verify

1. **Collect all image URLs** — Use `grep_search` to find all `images.unsplash.com` references across the design's files.

2. **Check via fetch** — Use `fetch_webpage` on any suspected broken URL. A `HTTP error 404` response confirms it's broken.

3. **Find replacements** — Search Unsplash for alternative photo IDs that fit the same category (lighting, furniture, objects, etc.). Verify each candidate with `fetch_webpage` before using it.


## Common causes
- Unsplash photo was deleted or made private by the uploader
- Photo ID was mistyped (usually a 25-char alphanumeric hash after `/photo-`)
- URL params (`?w=...&q=...&auto=format...`) are malformed — always validate the base ID works without params first

---
description: "Article creation pipeline: web research → draft → editorial review → update catalog"
---

# New Article

Write a new article on: **$article_topic**.

## Steps

1. **Check for duplicates** — Search `Content/catalog.json` for any article with similar title or tags. If one exists, decide whether this is a revision or a separate piece.

2. **Web research** — Use `@article-writer` with web search to gather at least 3 authoritative sources on the topic. Summarize key facts, current industry framing, and any relevant statistics.

3. **Draft the article** — Use `@article-writer` to write the full article at `Content/Articles/{article_slug}.md`. Required structure:
   - YAML frontmatter: `type: article`, `title`, `description`, `tags`, `author`, `published_date`
   - Lead paragraph framing the topic for a learner audience
   - Body (800–1500 words unless topic demands more)
   - Callout boxes where appropriate (use `<Callout>` component)
   - Closing with 1–2 actionable takeaways

4. **Editorial review** — Use `@content-editor` to check readability, accuracy, internal link opportunities, and frontmatter completeness. Apply all required fixes.

5. **Update catalog.json** — Add the article entry to `Content/catalog.json`.

## Output

- `Content/Articles/{slug}.md`
- Updated `Content/catalog.json`

---
title: "Shortcodes Reference"
build:
  list: never
  render: always
---

# Editorial Shortcodes Reference

Block-based shortcodes for creating dynamic, editorial-style page layouts.
Stack them in any order in your Markdown content.

---

## `{{</* hero */>}}` — Full-bleed hero image

```markdown
{{< hero src="featured.jpg" overlay="**Title**\nSubtitle text" height="75" >}}
```

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `src` | ✅ | — | Image filename in page bundle |
| `overlay` | ❌ | — | Text overlaid on image (supports markdown) |
| `height` | ❌ | `70` | Hero height in vh (e.g. `60`, `80`, `100`) |
| `alt` | ❌ | `""` | Alt text |

---

## `{{</* content-block */>}}` — Text section (block pair)

```markdown
{{< content-block side="center" width="narrow" >}}
Your **markdown** content here...
{{< /content-block >}}
```

| Param | Default | Options |
|-------|---------|---------|
| `side` | `center` | `center`, `left`, `right` |
| `width` | `narrow` | `narrow` (65ch), `wide` (full) |
| `class` | `""` | Extra CSS classes |

---

## `{{</* image-block */>}}` — Single image

```markdown
{{< image-block src="scenery.jpg" caption="Optional caption" align="wide" >}}
```

| Param | Required | Default | Options |
|-------|----------|---------|---------|
| `src` | ✅ | — | Image filename in page bundle |
| `alt` | ❌ | `""` | — |
| `caption` | ❌ | `""` | Supports markdown |
| `align` | ❌ | `wide` | `contained` (max 800px), `wide`, `full` (full bleed) |
| `ratio` | ❌ | `""` | `portrait` or `landscape` to constrain height |

---

## `{{</* grid */>}}` + `{{</* grid-img */>}}` — Image grid (block pair)

```markdown
{{< grid cols="2" caption="Optional caption" >}}
  {{< grid-img src="photo1.jpg" >}}
  {{< grid-img src="photo2.jpg" >}}
{{< /grid >}}
```

**Grid params:** `cols` (default `2`, also `3`), `caption` (optional)

**Grid-img params:** `src` (required), `alt`, `width`, `height`

---

## `{{</* pullquote */>}}` — Styled quote

```markdown
{{< pullquote align="center" author="Xuan Tan" >}}
The summit doesn't reward speed. It rewards persistence.
{{< /pullquote >}}
```

| Param | Required | Default | Options |
|-------|----------|---------|---------|
| `quote` | ❌ | inner text | Use block content or this param |
| `author` | ❌ | `""` | Attribution line |
| `align` | ❌ | `center` | `center`, `left`, `right` |

---

## `{{</* section-divider */>}}` — Visual spacer

```markdown
{{< section-divider size="s" >}}
```

| Param | Default | Options |
|-------|---------|---------|
| `size` | `m` | `s` (60px), `m` (120px), `l` (full width) |

---

## Page setup

In your front matter, set the editorial layout:

```yaml
---
title: "My Story"
layout: editorial
---
```

This removes the default prose width constraints so shortcodes can use full-bleed and wide layouts.

---

## Checklist

1. [ ] `layout: editorial` in front matter
2. [ ] Images in page bundle folder
3. [ ] Write content as a sequence of shortcode blocks
4. [ ] Run `hugo server` to preview

# Session 5 Menu Space Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enlarge slide 6's restaurant board, remove the hanging rail, and keep the deck navigation hub on a dedicated light band.

**Architecture:** Keep the existing single-file deck structure and change only the slide-specific CSS and slide 6 markup in `ingles/sesion-5.html`. Extend the existing structural test so the approved composition cannot regress, then verify the shared deck chrome at desktop, laptop and mobile sizes.

**Tech Stack:** HTML, CSS, Node.js assertions, Playwright with Microsoft Edge.

---

### Task 1: Lock the approved composition in the structural test

**Files:**
- Modify: `scripts/test-session-5-menu.cjs`
- Test: `scripts/test-session-5-menu.cjs`

- [ ] **Step 1: Add failing assertions**

Add these assertions after the current `restaurant-scene` assertion:

```js
assert.doesNotMatch(source, /ceiling-rail/);
assert.match(html, /linear-gradient\(180deg,#292826 0 82%,#aaa49a 82% 100%\)/);
```

- [ ] **Step 2: Run the structural test and confirm RED**

Run:

```powershell
& 'C:\Users\Usuario\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'scripts\test-session-5-menu.cjs'
```

Expected: FAIL because slide 6 still contains `ceiling-rail`.

### Task 2: Build the dominant-screen composition

**Files:**
- Modify: `ingles/sesion-5.html:43-88`
- Modify: `ingles/sesion-5.html:212-244`
- Test: `scripts/test-session-5-menu.cjs`

- [ ] **Step 1: Remove suspension markup and CSS**

Delete this markup:

```html
<div class="ceiling-rail" aria-hidden="true"><i></i><i></i></div>
```

Delete the `.ceiling-rail`, `.ceiling-rail i`, and child positioning rules. Remove `.ceiling-rail{display:none}` from the mobile media query.

- [ ] **Step 2: Replace the restaurant scene geometry**

Use this desktop geometry:

```css
.menu-slide{padding:0!important;background:#aaa49a!important;justify-content:center}
.restaurant-scene{position:relative;width:100%;height:100%;display:flex;flex-direction:column;
  justify-content:flex-start;padding:clamp(2rem,4.5vh,3.4rem) clamp(1.5rem,3vw,3.6rem) 18vh;
  background:
    linear-gradient(90deg,transparent 49.85%,rgba(40,38,35,.13) 50%,transparent 50.15%) 0 0/18rem 82%,
    linear-gradient(180deg,#292826 0 82%,#aaa49a 82% 100%)}
.restaurant-scene::after{content:"";position:absolute;inset:0 0 18%;pointer-events:none;
  background:radial-gradient(ellipse at 50% 0,rgba(255,255,255,.12),transparent 62%)}
.scene-meta{position:relative;z-index:3;margin:0 0 .65rem;font-family:var(--font-mono);font-size:.56rem;
  letter-spacing:.19em;color:#ddd8d0;text-transform:uppercase}
.menu-rig{position:relative;z-index:3;width:100%;flex:1;min-height:0;display:grid;
  grid-template-columns:1fr 1.12fr 1fr;gap:5px;padding:5px;background:#090909;
  box-shadow:0 24px 55px rgba(0,0,0,.72)}
.menu-panel{min-width:0;background:#f5f3ed;color:#151515;padding:clamp(1rem,1.7vw,1.5rem);
  box-shadow:inset 0 0 32px rgba(255,255,255,.9);overflow:hidden}
```

Keep the red counter immediately below `.menu-rig`.

- [ ] **Step 3: Preserve the mobile layout**

Use this mobile override:

```css
@media(max-width:820px){
  .menu-slide{overflow-y:auto!important;justify-content:flex-start!important;background:#242321!important}
  .restaurant-scene{height:auto;min-height:100%;padding:4.5rem 1.25rem 7.5rem;background:#242321}
  .menu-rig{grid-template-columns:1fr;gap:.65rem;background:transparent;padding:0}
  .scene-meta{line-height:1.5}.order-counter{grid-template-columns:auto 1fr;margin-top:.65rem}
  .order-counter>span:last-child{display:none}.menu-panel .nombre{font-size:.76rem}.menu-panel .precio{font-size:.7rem}
}
```

- [ ] **Step 4: Run the structural test and confirm GREEN**

Run the Task 1 command.

Expected: `session-5 menu structure: PASS`.

### Task 3: Verify the hub and responsive layout visually

**Files:**
- Verify: `ingles/sesion-5.html`

- [ ] **Step 1: Open slide 6 at desktop size**

Use Playwright with Edge at `1440×900`. Confirm:

```text
3 menu panels visible
No ceiling rail visible
Restaurant dark wall ends at 82% of viewport height
Deck navigation controls remain entirely on the light lower band
No horizontal overflow
```

- [ ] **Step 2: Repeat at laptop and mobile sizes**

Check `1280×720` and `390×844`. At mobile width, confirm the three panels stack and horizontal overflow equals zero.

- [ ] **Step 3: Run final verification**

Run:

```powershell
& 'C:\Users\Usuario\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'scripts\test-session-5-menu.cjs'
git diff --check -- 'ingles/sesion-5.html' 'scripts/test-session-5-menu.cjs'
```

Expected: test PASS and no whitespace errors.

- [ ] **Step 4: Commit the implementation**

```powershell
git add -- 'ingles/sesion-5.html' 'scripts/test-session-5-menu.cjs' 'docs/superpowers/plans/2026-08-19-session-5-menu-space-refinement.md'
git commit -m "fix: amplía el menú y protege la navegación"
```

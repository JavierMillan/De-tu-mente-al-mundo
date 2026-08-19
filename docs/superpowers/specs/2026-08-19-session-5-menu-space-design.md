# Session 5 Menu Space Refinement

## Objective

Make slide 6 feel like a wall of dominant restaurant menu screens while protecting the deck navigation hub from low contrast and visual competition.

## Approved direction

The selected direction is **B · Pantallas dominantes**.

- Remove the ceiling rail and both hanging supports from the markup and styles.
- Replace the current cream ceiling band with a dark restaurant wall that begins at the top of the slide.
- Move the role-play metadata near the top of the wall and enlarge the complete menu assembly.
- Keep the three illuminated menu panels and the red order counter as one physical unit.
- Reserve the bottom 18–20% of the slide as a light floor/navigation-safe band.
- Keep all current menu items, prices and role-play copy unchanged.

## Layout

On desktop, the restaurant wall occupies the upper 82% of the viewport. The menu assembly uses 94% of the available width and fills the wall between the metadata and the counter. The metadata sits directly above it instead of below decorative ceiling hardware.

The shared deck hub remains in the bottom light band. No dark surface or decorative object may pass underneath the hub labels or controls.

On screens up to 820px wide, the menu panels remain stacked vertically. The slide may scroll, but it must not create horizontal overflow. Extra bottom padding protects the fixed deck navigation.

## Visual system

The existing restaurant palette remains unchanged:

- Restaurant wall: `#292826`
- Illuminated screens: `#f5f3ed`
- Counter red: `#c8102e`
- Counter yellow: `#ffbc0d`
- Navigation-safe floor: warm gray from the English deck theme

The defining visual element is the oversized three-screen board, not suspension hardware.

## Accessibility and behavior

- The menu remains a single labeled group.
- Text contrast must remain readable on both the dark wall and light panels.
- Existing reduced-motion behavior stays intact.
- Keyboard and deck navigation behavior do not change.

## Verification

- Structural test confirms the ceiling rail is absent and all three menu panels remain.
- Desktop checks at 1440×900 and 1280×720 confirm that the menu does not overlap the navigation hub.
- Mobile check at 390×844 confirms stacked panels and no horizontal overflow.
- Visual screenshots confirm that the board uses materially more of the restaurant wall than the previous version.

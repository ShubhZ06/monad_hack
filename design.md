# DESIGN.md — Monad Web3 PWA: Gen Z Demand & Discovery Platform

> **Product:** a PWA where Gen Z (1) discovers trusted venues and (2) proves group demand with money held in smart-contract escrow while organizers bid to deliver it. Built on **Monad Testnet**.
>
> **Visual direction:** matches the *Talk Sense* (Phenomenon Studio) screenshot: soft pink-lilac gradient, white rounded surfaces, editorial serif headlines, hot-pink accent, pill chips, peeking carousels, chat bubbles and the checklist note card. The README's "Obsidian Dark & Electric Lime" styling is **not** used.
>
> **Platforms:** one responsive codebase covering **Android (Chrome, Samsung Internet, installed PWA)**, **iOS**, **tablets/foldables**, and **desktop browsers (Chrome, Edge, Firefox, Safari, installed desktop PWA)**. Mobile is designed first; larger layouts re-arrange the same components rather than introducing new visual styles.
>
> **Functionality:** from the project README (venue discovery, communities, escrow loop, organizer portal).
>
> Hex values and sizes are visual estimates from the screenshot. Tune by eye. Items marked **[Proposed]** go beyond the README; confirm against `tasks.md` before building.

---

## 1. Visual Signature (must look like the screenshot on every screen size)

1. **Pink-lilac atmosphere.** Screens sit on a soft pink gradient with blurred lilac/pink clouds behind. On desktop the gradient fills the whole window.
2. **Serif hero headlines.** Large, 2 lines, near-black.
3. **One hot-pink accent** (`#E0245E`) for small emphasis: scope label, @mentions, active states, primary actions.
4. **White and frosted surfaces.** White cards and bubbles, translucent white chips, icon buttons, navigation. No dark UI, no heavy borders.
5. **Pill controls, large radii.** Chips, inputs and buttons are pills; cards 20 px; bubbles 18 px.
6. **Peeking horizontal rows.** Chip rows and card carousels are cropped at the edge on touch; on desktop they get arrow buttons and a fade mask.
7. **Collage imagery.** Paper-cut illustrations on cards; tilted, overlapping photos in chat and galleries.
8. **Composer at the bottom.** `(+)` circle, white input pill, mic icon on every chat-like screen.
9. **Frosted note card.** Pink-to-white gradient card with date, avatar stack, serif title and checklist.

### Template → platform mapping

| Screenshot element | Used in this app as |
|---|---|
| "Ready to bring new life to your social media?" hero | `/home` hero: "What's the plan this weekend?" |
| "SMM model ⟳" pink switcher | **Scope switcher**: `Your college ⟳` (college / city / everywhere) |
| Suggestion chips (2 staggered rows) | Category and vibe filter chips |
| "Ride the trend" + trend cards | **Trending demands** carousel with pledge progress |
| Composer `(+) [Type a message here… 🎤]` | Chat composer; `(+)` attaches photo, venue or demand |
| Group chat "Girls 🌸" | Community and event chat |
| Photo collage message | Venue/event galleries and chat photo messages |
| Trip Prep Checklist note | **Event plan card**: milestones for a demand |
| Reaction chip `😮 2` | Message reactions |
| Two phone frames on pink backdrop | Desktop landing hero visual |

---

## 2. Design Principles

1. **Soft, not loud.** Quiet UI; the pink background and content (photos, collages) provide the personality.
2. **Trust in every money moment.** State how much, where it's held, and how to get it back.
3. **Chain is invisible until it matters.** Say "Pledge", "Held in escrow", "Confirm in MetaMask". Hashes and addresses sit behind a tap.
4. **One accent.** Hot pink marks emphasis and primary action. Status colors (green/amber/red) appear only on status indicators.
5. **Serif for voice, sans for function.**
6. **Decisions in one screen.** Enough on a card to decide without leaving for Maps or Instagram.
7. **Social first.** Communities, chat and shared plans lead; money follows the group.
8. **Same product, right-sized layout.** Phones get one focused column; desktops get side navigation, split panes and inline panels, never a stretched phone screen.
9. **Testnet is honest.** MON on testnet has no value. Say so wherever money appears.

---

## 3. Roles

| Role | How they get it | Can do |
|---|---|---|
| **Visitor** | Opens the app | Browse landing, feed, venues (read-only) |
| **Connected** | Connects MetaMask | Save venues, view events, see wallet |
| **Verified Student** | Connected + college verification **[Proposed: college email code via Supabase]** | Join communities, create demands, pledge, review venues |
| **Organizer / Venue** | Connected + organizer profile | List venues (pays listing fee), place bids, manage payouts |

Ask for a wallet or verification only when an action needs it, in a sheet/dialog that explains why.

---

## 4. Color Tokens

### Core (from the screenshot)

| Token | Hex (approx.) | Usage |
|---|---|---|
| `--bg-lilac` | `#B9A8CC` | Ambient background, lilac cloud |
| `--bg-pink` | `#F2B5C8` | Ambient background, pink cloud |
| `--screen-top` | `#F7E1E8` | App gradient, top |
| `--screen-bottom` | `#EBD7E2` | App gradient, bottom |
| `--surface` | `#FFFFFF` | Cards, bubbles, inputs |
| `--surface-frost` | `rgba(255,255,255,0.55)` | Chips, icon buttons, tab bar, nav rail/sidebar |
| `--surface-note-top` | `#FBE3EA` | Note card, top |
| `--surface-note-bottom` | `#FFF6F8` | Note card, bottom |
| `--text-primary` | `#1C1A1F` | Headlines, message text, titles |
| `--text-secondary` | `#5E5A63` | Descriptions, dates, placeholders |
| `--text-tertiary` | `#9A949E` | Timestamps, struck-through items |
| `--accent` | `#E0245E` | Fills, large text, active icons |
| `--accent-strong` | `#C81E52` | **Small accent text** (labels, mentions, links) |
| `--accent-soft` | `#F8C8D6` | Selected chip/nav fill, checked checkbox, tinted badges |
| `--border-subtle` | `rgba(28,26,31,0.08)` | Chip outlines, hairlines |

### Interaction tokens (pointer and keyboard)

| Token | Value | Usage |
|---|---|---|
| `--accent-hover` | `#CE1F55` | Primary button hover |
| `--accent-pressed` | `#B91A4C` | Primary button pressed |
| `--surface-hover` | `#FFF7F9` | White card/chip hover fill |
| `--ripple` | `rgba(224,36,94,0.12)` | Android-style press ripple (optional) |
| `--focus-ring` | `0 0 0 2px #FFFFFF, 0 0 0 4px #C81E52` | Keyboard focus on every interactive element |

### Status colors (indicators only)

| Token | Hex | Used for |
|---|---|---|
| `--success` | `#2F9E6E` | Confirmed tx, completed, released |
| `--warning` | `#E39B2D` | Pending, ending soon, wrong network, Testnet badge |
| `--danger` | `#D6303F` | Failed tx, cancelled, refund needed |
| `--info` | `#7A66A8` | Bid selected, informational |

### Gradients

```css
--app-gradient: linear-gradient(180deg, #F7E1E8 0%, #F1DAE4 55%, #EBD7E2 100%);
--ambient-gradient: linear-gradient(135deg, #B9A8CC 0%, #E8B5C9 55%, #F2B5C8 100%);
--note-gradient: linear-gradient(180deg, #FBE3EA 0%, #FFF6F8 100%);
```

Behind the app gradient, add 2–3 blurred radial blobs (pink `#F2B5C8`, lilac `#B9A8CC`, 60–90 px blur, 50–70% alpha). On desktop, scale blobs up (≈ 480–720 px) and anchor them to the viewport (`position: fixed`) so they don't move with scrolling.

### Event / escrow status mapping

| State | Color | Pill text |
|---|---|---|
| Open | Accent soft fill, accent-strong text | `Open` |
| Bid selected | Lilac tint `#E6DDF0`, info text | `Bid selected` |
| Locked in escrow | White fill, ink text, lock icon | `Locked` |
| Completed / released | Success tint, success text | `Completed` |
| Pending tx / ending soon | Warning tint | `Pending`, `Ends in 3h` |
| Refunded / cancelled / failed | Danger tint | `Refunded`, `Cancelled` |

Always pair color with an icon and text.

---

## 5. Typography

| Role | Family | Notes |
|---|---|---|
| **Display / serif** | `Newsreader` (alt: `Source Serif 4`, `Merriweather`) | Hero, section headers, venue/event/card titles, note titles |
| **UI / sans** | `Inter` (fallbacks: `Roboto` on Android, `-apple-system` on iOS/macOS, `Segoe UI` on Windows) | Everything functional; `tabular-nums` for amounts and countdowns |
| **Mono** | `JetBrains Mono` (alt: `ui-monospace`) | Wallet addresses, tx hashes, contract addresses only |

Load fonts with `font-display: swap`, subset to Latin, and keep fallback metrics close (Android has no SF Pro, so Inter must load reliably).

### Responsive scale

| Token | Font | Compact (<1024) | Desktop (≥1024) | Weight | Used for |
|---|---|---|---|---|---|
| `display-hero` | Serif | 34 / 38 | 56 / 60 | 500 | Landing hero |
| `display` | Serif | 30 / 34 | 40 / 44 | 500 | `/home` hero |
| `title-lg` | Serif | 20 / 24 | 24 / 30 | 400–500 | Section headers |
| `title-md` | Serif | 17 / 22 | 18 / 24 | 600 | Card, venue, event, note titles |
| `nav-title` | Sans | 16 / 20 | 16 / 20 | 500 | Top bar title |
| `body` | Sans | 15 / 20 | 15 / 22 | 400 | Chat, descriptions, reviews |
| `body-sm` | Sans | 13 / 18 | 13 / 18 | 400 | Meta, list rows, checklist items |
| `chip` | Sans | 13 / 16 | 13 / 16 | 500 | Chips |
| `label-accent` | Sans | 13 / 16 | 14 / 18 | 600 | Scope switcher label |
| `amount-xl` | Sans | 32 / 36 | 36 / 40 | 600 tabular | Raised total |
| `amount-md` | Sans | 17 / 22 | 17 / 22 | 600 tabular | Pledge and price figures |
| `caption` | Sans | 11 / 14 | 12 / 16 | 400 | Timestamps, dates |
| `input` | Sans | 14 / 20 | 15 / 20 | 400 | Placeholders |
| `mono-sm` | Mono | 12 / 16 | 12 / 16 | 400 | `0x12…9aF`, hashes |

Rules: sentence case, no all-caps labels. Hero headlines are centered on compact and in single-column desktop sections; in the two-column desktop landing hero they are left-aligned. Everything else is left-aligned. Amounts always show the unit (`12.5 MON`). Keep body line length under ~70 characters on desktop (cap text blocks at `max-w-prose`).

---

## 6. Spacing, Radius, Elevation

**Spacing (4 pt):** `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`.

| Context | Screen margin | Section gap | Card gap |
|---|---|---|---|
| Compact | 16–20 | 24–40 | 12 |
| Medium | 24 | 32–40 | 16 |
| Expanded / Large | 24–32 | 40–56 | 20–24 |

Chip gap 8. Bubble gap 6–8 (same sender), 12–16 (sender change).

| Token | Value | Usage |
|---|---|---|
| `--r-pill` | 999px | Chips, buttons, inputs, tab bar, status pills |
| `--r-card` | 20px | Trend/demand cards, venue cards, bid cards, note card |
| `--r-panel` | 24px | Desktop sidebar/rail, side panels, dialogs' inner panels |
| `--r-bubble` | 18px | Chat bubbles (sender-side corner ~6px) |
| `--r-photo` | 14px | Photos in collage and card covers |
| `--r-sheet` | 28px | Bottom sheets (top corners) and desktop dialogs (all corners) |

```css
--shadow-card:    0 4px 16px rgba(120, 70, 100, 0.08);
--shadow-hover:   0 10px 28px rgba(120, 70, 100, 0.14);   /* desktop card hover */
--shadow-bubble:  0 1px 2px rgba(120, 70, 100, 0.06);
--shadow-photo:   0 6px 18px rgba(60, 40, 60, 0.18);
--shadow-dialog:  0 24px 64px rgba(60, 30, 50, 0.22);
```

Frost (chips, icon buttons, nav): `background: rgba(255,255,255,0.55); border: 1px solid rgba(28,26,31,0.08); backdrop-filter: blur(12px);`. Provide a solid `rgba(255,255,255,0.85)` fallback where `backdrop-filter` is unsupported or the device is low-end (some budget Android devices).

---

## 7. Platforms & Responsive System

### 7.1 Targets

| Target | Typical viewport | Notes |
|---|---|---|
| **Android phone** (Pixel, Galaxy, Redmi…) | 360–412 px wide | Chrome, Samsung Internet, installed WebAPK. System back gesture/button, gesture or 3-button nav bar |
| **iPhone** | 375–430 px | Safari, installed PWA. Dynamic Island, home indicator |
| **Tablet / foldable / large phone landscape** | 640–1023 px | Android tablets, Galaxy Fold unfolded, iPad portrait |
| **Laptop / desktop browser** | 1024–1919 px | Chrome, Edge, Firefox, Brave (MetaMask extension), Safari |
| **Desktop installed PWA** | 1024+ px | Own window, no browser chrome |

Design frame for compact: **393 × 852** (same as the screenshot), test down to **360 × 640**. Design frame for desktop: **1440 × 900**, test 1024, 1280, 1920.

### 7.2 Breakpoints and layout classes

Aligned with Tailwind v4 defaults (`sm 640`, `lg 1024`, `xl 1280`) and Android's window size classes (compact / medium / expanded).

| Class | Width | Navigation | Content | Overlays |
|---|---|---|---|---|
| **Compact** | 0–639 | Floating bottom tab bar | 1 column, full-bleed carousels | Bottom sheets |
| **Medium** | 640–1023 | Left **nav rail** (80 px, icons + labels) | 1 centered column (max 640), 2-col grids for cards | Centered dialogs (max 480) |
| **Expanded** | 1024–1279 | Left **nav rail** (80 px) | 2 panes where useful (feed + panel, list + chat) | Dialogs, popovers, side sheets |
| **Large** | ≥1280 | Left **sidebar** (248 px, labels) | Main column + optional right rail (320 px) | Dialogs, popovers, side sheets |

Cap the whole app at **1440 px** and center it; the pink gradient and clouds continue to fill wider windows.

### 7.3 Grid and containers

| Class | Columns | Margin | Gutter | Main column max |
|---|---|---|---|---|
| Compact | 4 | 16 | 12 | 100% |
| Medium | 8 | 24 | 16 | 640 |
| Expanded | 12 | 24 | 24 | 720 (+ 320–360 side panel) |
| Large | 12 | 32 | 24 | 720–760 (+ 320 right rail) |

```
Large (≥1280):
┌ sidebar 248 ┬──────── main (≤760) ────────┬─ right rail 320 ─┐
Expanded (1024–1279):
┌ rail 80 ┬────────── main (≤720) ──────────┬─ side panel 320 ─┐   (panel only on event/dashboard pages)
Medium (640–1023):
┌ rail 80 ┬──────── main (≤640, centered) ──────────┐
Compact (<640):
┌────────────── main (100%) ──────────────┐
│          floating tab bar               │
```

### 7.4 What changes at each size

| Element | Compact | Medium | Expanded / Large |
|---|---|---|---|
| Navigation | Floating tab bar | Nav rail | Rail (expanded) → full sidebar (large) |
| Top bar | Back · title · network + wallet | Title · network + wallet | Title · **global search** · network · notifications · wallet |
| Primary "Propose" action | Center pink circle in tab bar | Pink circle atop the rail | Full-width pink button `Start a demand` in sidebar |
| Hero | Centered serif, 2 lines | Centered | Centered in feed; left-aligned in landing two-column hero |
| Filter chips | Two staggered rows, cropped at edge | Same, wider | Wrapping rows, or scroll with arrow buttons |
| Carousels | Touch scroll, cropped last card | Same | Arrow buttons on hover/focus, edge fade mask, 3–4 cards visible |
| Venue cards | Full-width, 1 column | 2-column grid | 2-column grid (3 at ≥1536 without right rail) |
| Demand card size | 150 × 220 | 170 × 240 | 200 × 260 (larger collage) |
| Bottom sheets | Bottom sheet | Centered dialog | Dialog / popover / inline panel (see §7.6) |
| Chat | Full-screen thread | Full-screen thread | **Split view**: thread list + conversation (+ info rail at large) |
| Event pledge | Sticky bottom action bar + sheet | Sticky bar + dialog | **Sticky right panel** with inline pledge form |
| Dashboard lists | Stacked cards | Stacked cards | Sortable **data tables** |
| Hover | None (touch) | None / pointer-dependent | Lift, tooltip, focus ring |
| Toasts | Above tab bar, centered | Bottom center | Top-right, under top bar |

### 7.5 Input modality

Style by capability, not just width, because a tablet can be touch-only and a laptop can have a touchscreen.

```css
@media (hover: hover) and (pointer: fine) { /* hover lift, tooltips, cursor:pointer, thin scrollbars */ }
@media (pointer: coarse)                   { /* 44 px minimum targets, no hover-only UI */ }
```

Anything revealed on hover (carousel arrows, tooltips, row actions) must also be reachable by keyboard focus and by touch.

### 7.6 Sheet → dialog mapping

| Overlay | Compact | Medium | Expanded / Large |
|---|---|---|---|
| Connect wallet | Bottom sheet | Dialog 420 | Dialog 420 |
| Pledge | Bottom sheet | Dialog 440 | **Inline panel** on event page (modal only for tx) |
| Transaction | Bottom sheet | Dialog 440 | Dialog 440 |
| Wallet / My pledges | Bottom sheet | Side sheet 360 | Popover anchored to wallet chip (340) |
| Filters | Bottom sheet | Side sheet 360 | Side sheet 380 or anchored popover |
| Scope switcher | Bottom sheet | Dialog | Popover anchored to the label |
| Verification | Bottom sheet | Dialog 440 | Dialog 440 |
| Propose (start a demand) | Full-height bottom sheet | Dialog 560 | Dialog 560 |
| List a venue | Full-screen steps | Full page | **Full page wizard** (stepper + form + live preview) |

Dialogs: white, `--r-sheet`, `--shadow-dialog`, backdrop `rgba(28,26,31,0.35)` with 4 px blur, focus trap, `Esc` closes, focus returns to the trigger.

### 7.7 Android specifics

| Topic | Design / build rule |
|---|---|
| **System back** | Back gesture/button must behave natively. Opening a sheet pushes a history entry so Back **closes the sheet first**, then navigates. The top-bar back chevron mirrors browser back. |
| **Edge-to-edge** | Draw the gradient behind the status and navigation bars. Apply `env(safe-area-inset-*)` to top bar, tab bar, sticky bars and composer. Keep at least 8 px above the gesture bar. |
| **Status bar color** | `theme-color: #F7E1E8` (light) so dark status icons stay legible. |
| **Keyboard** | Set viewport `interactive-widget=resizes-content` and use `100dvh` so the composer sits above the keyboard and the thread scrolls to the latest message. On phones, `Enter` inserts a newline and the send button sends. |
| **Install (WebAPK)** | Chrome shows an install prompt when the manifest and service worker are valid. Provide a custom `Install app` card via `beforeinstallprompt`. Include maskable icons, `shortcuts` (`Start a demand`, `My pledges`) and narrow `screenshots`. |
| **Pull-to-refresh** | Chrome's native pull-to-refresh can fire inside scrollers. Use `overscroll-behavior-y: contain` on chat and sheets; allow it on the feed. |
| **Press feedback** | Scale to 0.97 everywhere. On Android, add an optional `--ripple` tinted ripple on chips, cards and list rows. |
| **Haptics** | Optional short `navigator.vibrate(10)` on confirmed transactions and successful pledges (Android Chrome only; never rely on it). |
| **Emoji** | Noto Color Emoji renders differently from Apple's; keep emoji inline and don't size layouts around glyph shape. |
| **Low-end devices** | Provide the solid frost fallback (no `backdrop-filter`), limit blur blobs to CSS gradients, avoid animating filters or large shadows. |
| **Web Share** | Use `navigator.share` to share a demand link to WhatsApp/Instagram; fall back to `Copy link`. **[Proposed]** |
| **Push notifications** | Bid selected, goal reached, funds released, refund available. **[Proposed]** Ask permission only after the first pledge. |
| **Wallet** | The injected MetaMask provider is only present inside MetaMask's in-app browser. From Chrome or an installed PWA use WalletConnect or a MetaMask deep link (verify the current link format in MetaMask docs). See §12. |
| **Tablets/foldables** | Use the Medium layout (nav rail) and react to fold/resize without reloading state. |

### 7.8 Desktop specifics

| Topic | Design / build rule |
|---|---|
| **Layout** | Floating frosted sidebar/rail (inset 16 px, radius 24), main column, optional right rail. Never stretch phone layouts wider than 760 px. |
| **Wallet** | MetaMask extension is the default path: one-click connect through the injected connector (EIP-6963 discovery so multiple wallets are listed). If no wallet is detected, show `Install MetaMask` and a WalletConnect QR option. The MetaMask extension exists for Chrome, Edge, Firefox and Brave; show WalletConnect fallback in other browsers. |
| **Approval popup** | Approval happens in a browser popup outside the page. The Transaction dialog shows `Check the MetaMask popup` and a hint `Can't see it? Click the MetaMask icon in your toolbar.` |
| **Hover** | Cards lift 2 px with `--shadow-hover`; chips fill with `--surface-hover`; primary buttons use `--accent-hover`. Transition 120 ms. |
| **Tooltips** | On every icon-only button after 400 ms hover or on focus. |
| **Focus** | Visible `--focus-ring` on every control; never remove outlines. |
| **Keyboard** | `/` focus search · `Esc` close dialog/popover · `Enter` send (chat) · `Shift+Enter` newline · `←/→` move within tabs and carousels · `Cmd/Ctrl+K` quick switcher **[Proposed]**. Logical tab order: sidebar → top bar → main → right rail. |
| **Scrollbars** | Thin and tinted: `scrollbar-width: thin; scrollbar-color: rgba(28,26,31,0.25) transparent`. |
| **Carousels** | Arrow buttons (white circles, 40 px) appear at the edges on hover/focus; trackpad and drag scrolling still work; edge fade mask replaces the cropped card. |
| **Copy** | Addresses and hashes have `Copy` buttons and are selectable. |
| **Windowing** | Installed desktop PWA opens in its own window (`display: standalone`). Handle resize down to 360 px without breaking. |
| **Multitasking** | Persist pending transaction hashes in `sessionStorage` and resume status polling on `visibilitychange`, so switching tabs or approving in a popup never loses state. |
| **Right-click / drag** | Don't override the context menu; images use `draggable="false"` in carousels. |

---

## 8. App Shell & Navigation

### 8.1 Compact (phones, Android and iOS)

```
┌───────────────────────────────────┐
│ ▓▓ system status bar ▓▓           │  gradient extends behind it
│ ‹     Screen title    (Testnet)👛 │  Top bar
├───────────────────────────────────┤
│           Page content            │
├───────────────────────────────────┤
│  (+)  [ Type a message here… 🎤 ] │  Composer (chat screens only)
│     ⌂     ◎    ＋    ▦            │  Floating frosted tab bar
└───────────────────────────────────┘
```

**Tab bar:** floating frosted-white pill, 64 px, 16 px from the bottom, 1 px subtle border.

| Tab | Route | Notes |
|---|---|---|
| Discover | `/home` | Venue feed and trending demands |
| Communities | `/communities` | College hubs |
| **＋ Propose** (center, pink filled circle, white plus) | opens sheet | "Start a demand"; requires Verified Student |
| Dashboard | `/dashboard` | Organizer portal; others see "Become an organizer" |

Active tab: pink icon + label. Inactive: `--text-secondary`.

### 8.2 Medium and Expanded: navigation rail (640–1279)

```
┌────┐
│logo│
│ ⌂  │ Discover
│ ◎  │ Communities
│ ＋ │ (pink circle)
│ ▦  │ Dashboard
│    │
│ 🔔 │
│ 👛 │
└────┘
```

- 80 px wide frosted-white panel, `--r-panel`, inset 16 px, full height minus insets.
- Icon 24 px with 12 px label beneath. Active item: `--accent-soft` pill behind the icon, `--accent-strong` icon and label.
- `＋` Propose sits below Communities as a 48 px pink circle.
- Tooltips on hover; keyboard focus ring.

### 8.3 Large: sidebar (≥1280)

```
┌──────────────────┐
│ ◈ AppName        │
│                  │
│ ⌂  Discover      │  ← active: accent-soft pill, accent-strong text
│ ◎  Communities   │
│ ▦  Dashboard     │
│ ♡  Saved         │
│                  │
│ [ ＋ Start a     │
│     demand ]     │  ← pink primary, full width
│                  │
│ ┌──────────────┐ │
│ │ Testnet      │ │  ← note card gradient
│ │ MON has no   │ │
│ │ real value.  │ │
│ └──────────────┘ │
│ (o) 0x12…9aF     │  ← wallet mini row
└──────────────────┘
```

- 248 px wide, same frosted panel treatment as the rail.
- Items: 44 px tall pills, 16 px icon + `body` label; hover `--surface-hover`.
- The Testnet note uses the note gradient and `caption` text; it is a permanent, honest reminder.

### 8.4 Top bar (all sizes)

| Size | Contents |
|---|---|
| Compact | Back chevron · centered `nav-title` · network pill + wallet chip (or `···` overflow on chat, as in the screenshot) |
| Medium | Page title (serif) · network pill · wallet chip |
| Expanded / Large | Page title (serif) left · **global search** pill (white, 360–440 px, `/` shortcut hint) · network pill · notifications bell **[Proposed]** · wallet chip |

Top bar is transparent, no divider, sticky; on scroll it gains a frosted background.

- **Network pill:** small frosted pill `Monad Testnet` with a dot. Becomes a warning-tinted `Wrong network` when the wallet isn't on chain `10143`; click/tap switches network.
- **Wallet chip:**

| State | Appearance |
|---|---|
| Disconnected | Pink filled pill `Connect` |
| Connecting | Spinner in frosted pill |
| Connected | Avatar + `0x12…9aF` + `4.20 MON` in frosted pill |
| Wrong network | Warning-tinted pill `Switch to Monad` |
| No wallet detected (desktop) | Pink pill `Connect` → dialog shows Install MetaMask + WalletConnect |

Connected chip opens the **Wallet panel** (bottom sheet on compact, popover on desktop): address (copy), balance, faucet hint, **My pledges** (active, refundable, history), disconnect.

### 8.5 Right rail (Large, feed pages only)

Cards stacked with 16 px gap, sticky under the top bar:
1. **My pledges** (active, refundable, `See all`).
2. **Ending soon** (2–3 demands with mini progress).
3. **Your communities** (avatars, quick links).
4. **Need testnet MON?** (short faucet hint).

Hidden below 1280. On `/events/[id]` and `/dashboard` the right column is repurposed (see §10.4, §10.5).

---

## 9. Global Components

### 9.1 Buttons

| Type | Style | Hover (pointer) | Use |
|---|---|---|---|
| Primary | `--accent` fill, white text, pill. 48 px compact / 44 px desktop | `--accent-hover`, pressed `--accent-pressed` | Pledge, Connect, Confirm, Start demand |
| Secondary | White fill, `--text-primary`, subtle border, pill | `--surface-hover` | Save, Share, Cancel |
| Icon | 44 px white circle (like the `(+)` button) | `--surface-hover` + tooltip | Add, filter, mic |
| Ghost | No fill, `--accent-strong` text | Underline | Inline links, "See all" |
| Danger | White fill, `--danger` text and outline | Danger tint fill | Withdraw, cancel event |
| Disabled | 45% opacity + reason text below | `not-allowed` cursor | Always explain why |

### 9.2 Suggestion chips (from screenshot)
Height 32–34, padding `0 12px`, pill, frost fill, 1 px subtle border, leading 16 px outline icon + `chip` label.
- **Compact/Medium:** two staggered rows that overflow off the edge.
- **Desktop:** rows wrap within the main column, or scroll horizontally with arrow buttons (choose wrap when ≤ 2 rows fit).
- States: default → hover `--surface-hover` → pressed white → selected (`--accent-soft` fill, `--accent-strong` icon and text).

### 9.3 Cards
White, radius 20, padding 12–14, `--shadow-card`. Pressed: scale 0.98. Desktop hover: lift 2 px + `--shadow-hover`, cursor pointer (only if the whole card is clickable).

### 9.4 Vibe Rating **[Proposed model]**
- **Vibe score** 1–5 with one decimal (`4.6`) in a small white badge, `--accent-strong` numeral, followed by 5 dots (filled `--accent`, empty `rgba(28,26,31,0.12)`).
- **Vibe tags** as small frosted chips: `Good for groups`, `Budget-friendly`, `Aesthetic`, `Chill`, `Late night`.
- **Verified visit** badge on reviews from wallets that pledged to a **completed** event at that venue.

### 9.5 Badges

| Badge | Look | Meaning |
|---|---|---|
| Verified student | Lilac tint pill + check | Passed college verification |
| Verified venue | `--accent-soft` pill + shield | Paid the on-chain listing fee |
| Testnet | Warning-tinted outline `Testnet` | On every money surface |
| On-chain | Tiny chain icon | Value read from contract; opens explorer |

### 9.6 Pledge progress bar
Track `rgba(28,26,31,0.08)`, fill `--accent`, 8 px tall (10 px on desktop panel), pill ends. Above: `amount-xl` raised. Below: `of 40 MON goal · 18 backers · 2d left`. Goal reached: pink gradient fill, soft glow, `Goal reached` tag. Updates optimistically, then reconciles.

### 9.7 Avatar & stack
Circular photos: 26–28 px in chat (aligned to bubble bottom), 18 px in stacks (−6 px overlap). Fallback: initials on `--accent-soft`.

### 9.8 Overlays
Bottom sheets on compact, dialogs/popovers/side sheets on larger screens per §7.6. Same white surface, `--r-sheet`, drag handle only on bottom sheets.

### 9.9 Toast
Frost white pill, 4 s. Compact: above the tab bar. Desktop: top-right below the top bar, stacked (max 3). Success: green check. Error: danger icon; persists if action is needed. Announce via `aria-live="polite"`.

### 9.10 Data table (desktop dashboard)
White card, radius 20, rows 56 px, hairline row dividers `--border-subtle`, sortable headers with chevrons, sticky header, hover row `--surface-hover`, status pills in cells, mono hashes with copy icon. Collapses to stacked cards on compact.

### 9.11 Tooltip
Small ink pill (`--text-primary` background, white text, 12 px, radius 10), 400 ms hover delay, shows on focus, dismissible with `Esc`.

### 9.12 Empty / error / loading
- **Skeletons** match final geometry; shimmer white ↔ frost.
- **Empty:** one line + one action (`No demands yet. Start the first one.`).
- **Errors:** what happened and how to fix it. No apologies.

---

## 10. Page Specs

Each page shows the compact layout first, then the desktop layout.

### 10.1 `/` — Landing

**Job:** explain in ten seconds, then get a wallet connection.

**Compact**
```
   (Monad Testnet ●)                 [Connect]

        Plan it together.
        Pay when it's real.
     ── serif, centered, 2 lines ──
   Find places your crowd loves and turn
   "we should go" into a booked plan.

        [ Connect MetaMask ]        ← pink primary
        [ Explore venues   ]        ← white secondary

   [ tilted photo collage ]

   ── How it works ──
   1  Pick a plan      Choose a venue or start a demand
   2  Pledge           Money is held in escrow, refundable
   3  Organizers bid   Best offer wins, you confirm
   4  Go               Funds release after the event

   Ride the trend        [trend cards carousel]

   Built on Monad · fast confirms · low fees      [ Install app ]
```

**Desktop (≥1024)**
```
┌ ◈ AppName    How it works   Explore   Communities        (Testnet●) [Connect] ┐
│                                                                                │
│  Plan it together.                     ┌────────┐   ┌────────┐                │
│  Pay when it's real.                   │ phone  │   │ phone  │  ← two tilted  │
│  Find places your crowd loves and      │ assist │   │  chat  │    frames like │
│  turn "we should go" into a plan.      │ screen │   │ screen │    the shot    │
│  [ Connect MetaMask ] [ Explore ]      └────────┘   └────────┘                │
│                                                                                │
│  How it works   ① Pick a plan  ② Pledge  ③ Organizers bid  ④ Go   (4 columns)  │
│                                                                                │
│  Ride the trend                                                    ‹   ›       │
│  [card][card][card][card]                                                      │
│                                                                                │
│  Why Monad: fast confirms · low fees · verify it yourself     [ Install app ]  │
│  footer                                                                        │
└────────────────────────────────────────────────────────────────────────────────┘
```

- Compact: hero centered, `display-hero` serif, over the gradient with clouds. Desktop: two-column hero (text left-aligned, visuals right).
- The desktop hero visual recreates the screenshot: two tilted device frames (AI/discovery screen and group chat) on the pink backdrop, ±3–5° rotation, `--shadow-photo`. Use static images or lightweight HTML mock screens.
- "How it works" is numbered because it is a real sequence: stacked on compact, four columns on desktop.
- **Connect flow:** opens a sheet (compact) or dialog (desktop) with `MetaMask` (primary) and `WalletConnect`. If the wallet is on another chain, prompt to add/switch Monad Testnet (chain id `10143`, RPC `https://testnet-rpc.monad.xyz`, symbol `MON`, explorer `https://testnet.monadexplorer.com`).
- Connected users skip to `/home`. Install prompt after second visit or first connect (see §17).

### 10.2 `/home` — Discovery Feed

**Job:** decide where to go or what to join without leaving the app. The hero and chips mirror the AI Assistant screen.

**Compact**
```
 ‹              Discover               ···

     What's the plan
     this weekend?
     Your college ⟳            ← pink scope switcher

 [🔍 Cafes] [🏝 Resorts] [🎮 Fun…
 [💸 Budget] [👥 Good for groups] [🌙 Late…

 Ride the trend                          ⚌
 ┌────────────┐ ┌────────────┐
 │ collage    │ │ collage    │   ← demand cards (peek)
 │ Goa weekend│ │ Board game │
 │ ▓▓▓▓░ 72%  │ │ ▓▓░░░ 40%  │
 │ 29/40 MON  │ │ 8/20 MON   │
 └────────────┘ └────────────┘

 Top vibes near you
 ┌───────────────────────────────┐
 │ [cover photo]         ♡   🛡  │
 │ Blue Door Café      4.6 ●●●●○ │
 │ Cafe · 1.2 km · ₹₹            │
 │ [Aesthetic] [Good for groups] │
 │ [ Start a plan here ]         │
 └───────────────────────────────┘
```

**Desktop, Large (≥1280)**
```
┌ sidebar ┬─────────────── main (≤760) ─────────────┬──── right rail 320 ────┐
│ ◈ App   │ [🔍 Search venues, plans…  /] (Testnet)👛 │ My pledges             │
│ ⌂ Disc. │                                          │  Goa weekend  2 MON    │
│ ◎ Comm. │       What's the plan this weekend?      │ Ending soon            │
│ ▦ Dash. │            Your college ⟳                │  Board game night      │
│ ♡ Saved │ [🔍 Cafes][🏝 Resorts][🎮 Fun][💸 Budget] │ Your communities       │
│         │ [👥 Groups][🌙 Late night][+ More]        │  (IIT) (VIT) (MU)      │
│ [＋ Start│                                          │ Need testnet MON?      │
│  demand]│ Ride the trend                  ‹   ›    │  faucet hint           │
│         │ [card][card][card][card]                 │                        │
│ Testnet │ Top vibes near you                       │                        │
│  note   │ [venue card ][venue card ]               │                        │
│ (o)0x12…│ [venue card ][venue card ]               │                        │
└─────────┴──────────────────────────────────────────┴────────────────────────┘
```

At Expanded (1024–1279): nav rail instead of sidebar, no right rail (its content moves into the wallet popover and `My pledges`).

**Functionality**
- Category chips + filter (distance, price, vibe score, tags, open now). `⚌` opens a bottom sheet (compact) or side sheet (desktop).
- Search: full-screen search on compact; always-visible pill in the top bar on desktop (`/` focuses it). Results reuse the same cards.
- **Scope switcher** (`Your college ⟳`): bottom sheet on compact, popover on desktop.
- **Ride the trend:** carousel of live demands sorted by pledge velocity **[Proposed]**. Desktop shows arrows and a fade mask.
- **Top vibes:** infinite scroll; 1 column compact, 2 columns from Medium up.
- Save (♡) for connected users; visitors get the connect prompt.
- `Start a plan here` pre-fills the Propose flow with that venue.

**Demand card** (from the trend card): white, radius 20. Collage illustration/cover on top, serif `title-md` title, one-line meta (`12 going`), thin progress bar, `29/40 MON` in `amount-md`. Sizes: 150 × 220 compact, 200 × 260 desktop. On compact the next card is cropped at the edge.

**Venue card:** cover (16:10, radius 14) with frost save button (top-right) and Verified shield (top-left). Serif title, meta line, vibe badge + dots, up to 2 tag chips, `Start a plan here` secondary button. Desktop: 2-column grid, hover lift.

**Venue detail [Proposed route `/venues/[id]`]**
- Compact: full-screen page with tilted photo collage header.
- Desktop: two columns. Left: collage gallery, description, reviews. Right (sticky, 340): vibe breakdown, hours, `Open in Maps`, active demands, `Start a plan here` primary button, `Listed on-chain` proof.
- Reviews: avatar, score, text, photos, `Verified visit` badge; `Write a review` (Verified Students; photo upload).

### 10.3 `/communities` — College Hubs

**Compact**
```
 ‹          Communities            ···

     Find your people
     on campus
     [🔍 Search your college]

 Your hubs
 ┌──────────┐ ┌──────────┐
 │ logo IIT │ │ logo VIT │  ← peeking carousel
 │ 1.2k     │ │ 640      │
 └──────────┘ └──────────┘

 All colleges
 ┌───────────────────────────────┐
 │ (logo) Mumbai University      │
 │ 2.4k students · 6 open demands│
 │ [ Join ]  or  🔒 Verify first │
 └───────────────────────────────┘
```

**Desktop**
- `/communities`: centered serif hero + search; **Your hubs** as a row of larger cards; **All colleges** as a 2–3 column card grid (Large: 3 columns).
- `/communities/[slug]` **[Proposed]**: split view.

```
┌ nav ┬────── left column (≤520) ──────┬────────── chat pane (sticky, full height) ─────────┐
│     │ ‹ Mumbai University   [Joined]  │ Girls of MU 🌸                          ···       │
│     │ [ Feed ] [ Demands ]            │  (o) photo collage                                │
│     │ post                            │       ┌ Omg we look so cute 😂💗 ┐                │
│     │ demand card                     │  ┌ @kira let's print one ┐                        │
│     │ demand card                     │  [ event plan note card ]                         │
│     │                                 │ (+) [ Type a message here…            🎤 ]        │
└─────┴─────────────────────────────────┴───────────────────────────────────────────────────┘
```

Compact keeps three tabs: **Feed · Demands · Chat**. Desktop shows Feed/Demands on the left and Chat permanently on the right.

**Functionality**
- **Join gating:** requires Verified Student. If not verified: enter college email → 6-digit code → success (sheet on compact, dialog on desktop). **[Proposed: Supabase email OTP with per-college domain allow-list.]**
- Community card: logo, member count, active demands, `Join` / `Joined ✓`.
- Chat uses §10.6. **[Proposed: Supabase Realtime.]**

### 10.4 `/events/[id]` — The Escrow Loop (core screen)

**Job:** let a group pledge into escrow, let organizers bid, and keep state and money always clear.

**Compact / Medium**
```
 ‹                Goa weekend            ···
 [ tilted photo collage / cover ]
 Goa weekend for 12                (serif)
 IIT Bombay · started by @kira ✓

 ● Open ─ ○ Bid selected ─ ○ Locked ─ ○ Done     ← stepper

 ┌───────────────────────────────────────┐
 │  29.0 MON                     🔗       │
 │  ▓▓▓▓▓▓▓▓▓░░░  of 40 MON goal          │
 │  18 backers · ends in 2d 4h            │
 │  Held in contract 0x91…c2 · Refundable │
 └───────────────────────────────────────┘

 [ Overview ] [ Bids · 4 ] [ Backers · 18 ] [ Chat ]
 ───────────────────────────────────────
 sticky bar:   2 MON · Refundable   [ Pledge ]
```

**Desktop (Expanded / Large)**
```
┌ nav ┬──────────── main (≤720) ─────────────┬────── sticky pledge panel 340 ──────┐
│     │ ‹ Back to Discover                    │ 29.0 MON                       🔗   │
│     │ [ tilted photo collage / cover ]      │ ▓▓▓▓▓▓▓▓▓░░░  of 40 MON goal        │
│     │ Goa weekend for 12         (serif)    │ 18 backers · ends in 2d 4h          │
│     │ IIT Bombay · started by @kira ✓       │ ─────────────────────────────────── │
│     │ ● Open ─ ○ Bid selected ─ ○ Locked ─ ○│ Amount   [ −  2.00 MON  + ]         │
│     │                                       │ (0.5) (1) (2) (5)                   │
│     │ [Overview][Bids·4][Backers·18][Chat]  │ Network fee            ~0.001 MON   │
│     │ Description …                         │ Refundable until       bid locked   │
│     │ Bid cards (horizontal layout)         │ [ Confirm in MetaMask ]             │
│     │                                       │ Contract 0x91…c2 ↗                  │
│     │                                       │ ┌ Event plan (note card) ┐           │
│     │                                       │ │ ☑ Goal reached …       │           │
└─────┴───────────────────────────────────────┴─────────────────────────────────────┘
```

On desktop the pledge form lives **inline in the sticky right panel**; only the transaction confirmation opens a dialog. The right panel replaces the sticky bottom bar.

**Lifecycle and UI states** (drives stepper, pill and CTA on all sizes)

| # | State | What's happening | CTA (student) | CTA (organizer) |
|---|---|---|---|---|
| 1 | **Open** | Pledges and bids accepted until deadline | `Pledge` | `Place bid` |
| 2 | **Bid selected** | Winning bid chosen; backers can still withdraw until lock | `Withdraw` (secondary) | `View terms` |
| 3 | **Locked** | Goal met + bid accepted; funds locked | `View plan` | `Deliver event` info |
| 4a | **Completed** | Attendees confirm; funds released | `Write a review` | `Payout released` |
| 4b | **Refunded / Cancelled** | Goal missed, deadline passed, or cancelled | `Claim refund` | `Closed` |

**Overview tab**
- Description, venue card, date window, goal, deadline.
- **Event plan card** (the screenshot's Trip Prep Checklist): frosted pink-to-white note, date top-left, avatar stack top-right, serif title, items `Goal reached`, `Bid selected`, `Funds locked`, `Event happened`, `Funds released`. Done: `--accent-soft` checked box, struck-through, tertiary text. Upcoming: outlined box. Desktop: shown in the right panel under the pledge form.
- Terms in plain language (`Refundable until a bid is locked or the goal is missed`).

**Bids tab**
- Compact: stacked white bid cards. Desktop: wider cards with organizer and venue left, price and backers center, `Back this bid` right.
- Content: organizer avatar + name + Verified venue badge; venue; `price per head` and `total` in `amount-md`; inclusion chips; proposed date; backers count; `Back this bid` (Verified Student) or `Your bid`.
- Sort: Most backed · Lowest price · Newest. Tags: `Most backed`, `Lowest price`.
- **Default selection rule [Proposed, open decision]:** each pledger backs one bid; the most-backed bid wins at the bidding deadline; the creator breaks ties. Alternatives: creator picks, or lowest price wins.
- Organizer bid form: sheet on compact, dialog on desktop: venue (from own listings), price per head, total, inclusions, date, notes → Transaction sheet/dialog (§12).

**Backers tab**
- Avatar, handle (or `0x12…9aF`), amount, time. Own row highlighted with a pink outline and `Withdraw` when allowed. Desktop: table layout.

**Chat tab**
- §10.6, scoped to the event.

**Pledge form contents** (identical on every size; sheet, dialog or inline panel)

```
 Pledge to Goa weekend                 [Testnet]
 Amount
 [ −   2.00 MON   + ]
 (0.5) (1) (2) (5)   ← quick preset chips
 ─────────────────────────────────
 You pay                     2.00 MON
 Network fee (est.)         ~0.001 MON
 Held in escrow until        Bid locked or 12 Oct
 Refundable if               Goal missed or you withdraw before lock
 ─────────────────────────────────
 [ Confirm in MetaMask ]
 Contract 0x91…c2 ↗
```

### 10.5 `/dashboard` — Organizer Portal

**Compact**
```
 ‹           Dashboard            ···
     Your venues, your bids
 ┌─────────┐┌─────────┐┌─────────┐
 │ Active  ││ Won     ││ Earned  │   ← white stat cards (carousel)
 │ bids 4  ││ 2       ││ 18 MON  │
 └─────────┘└─────────┘└─────────┘
 [Overview] [Listings] [Bids] [Payouts]     ← chip-style tabs
```

**Desktop**
```
┌ nav ┬────────────────────────── main (max 1080) ────────────────────────────────┐
│     │ Dashboard                          [🔍 Search]        (Testnet●) 👛          │
│     │ ┌ Active bids ┐┌ Won ┐┌ Escrow pending ┐┌ Earned ┐   ← 4 stat cards          │
│     │ [Overview][Listings][Bids][Payouts]                                          │
│     │ ┌ Bids table ──────────────────────────────────────────────────────────┐   │
│     │ │ Event        Venue        Price/head  Backers  Status     Action      │   │
│     │ │ Goa weekend  Blue Door    ₹—          18       Leading    View        │   │
│     │ └──────────────────────────────────────────────────────────────────────┘   │
│     │ Open demands matching my venues   [card][card][card]   (Bid now)            │
└─────┴──────────────────────────────────────────────────────────────────────────────┘
```

| Tab | Content |
|---|---|
| **Overview** | Stats, open demands matching my venues (`Bid now`), pending actions |
| **Listings** | My venues with status `Draft · Awaiting payment · Live · Rejected`; `List a venue` |
| **Bids** | Bids with status `Pending · Leading · Won · Lost`, backers, link to event |
| **Payouts** | Released amounts, event, date, tx hash (mono) with explorer link |

**List a venue** (a real sequence, so steps are numbered)
1. Details: name, category, area, price level, description, tags.
2. Photos: multi-upload (Supabase Storage); first is cover; drag to reorder (drag-and-drop on desktop, long-press reorder on touch).
3. Review & pay: listing fee in MON (from contract), summary, `Pay & list`.
4. Transaction (§12). On confirm, venue goes `Live` with the Verified venue badge.

Layout: compact = full-screen steps with a progress indicator. Desktop (Large) = full-page wizard with the numbered stepper on the left, form in the center, and a **live preview** of the venue card on the right.

**Non-organizer view:** short explainer + `Become an organizer`.

### 10.6 Chat UI (community and event)

Direct from the screenshot:
- **Bubbles:** white for both incoming and outgoing; differentiated by alignment and avatar. Radius 18, sender-side corner ~6, padding `10px 14px`, `--shadow-bubble`. Max width 75% compact, `min(60%, 520px)` desktop.
- **Timestamps + read ticks** inside the bubble, bottom-right, `caption`, `--text-tertiary`.
- **Incoming:** 26–28 px avatar to the left, aligned to bubble bottom.
- **@mentions** in `--accent-strong`, weight 500. Desktop shows a mention picker after `@`.
- **Reaction chip:** small frosted/white pill overlapping the bubble's bottom-right (`😮 2`). Desktop: hovering a bubble reveals a quick-react button; touch: long-press.
- **Photo collage message:** 3–4 tilted (±3–6°), overlapping photos with `--shadow-photo`; timestamp in a small frosted pill on the collage corner.
- **Rich message: Demand card.** Inline white card with venue thumbnail, serif title, mini progress bar, `Pledge` pill button.
- **Rich message: Event plan** (checklist note) as in §10.4.
- **System messages** (`Bid selected: Blue Door Events`) centered, tertiary text, no bubble.
- **Composer:** `(+)` white circle (44 px), white input pill (44 px, grows to 5 lines) with placeholder `Type a message here…` and mic icon; mic becomes a send arrow when text is present.
  - Touch devices: `Enter` = newline, send button sends.
  - Desktop: `Enter` sends, `Shift+Enter` newline; drag-and-drop or paste to attach photos; `(+)` opens an anchored popover (photo, venue, demand).

**Desktop split view:** thread list (280–320 px, frosted white panel, avatars, last message, unread pink dot) + conversation pane (max readable width 720 centered in the pane) + optional info rail (members, shared photos, plan) at Large.

---

## 11. Action Bar (compact/medium) and Pledge Panel (desktop)

- **Compact/Medium:** frosted white sticky bar above the safe area (and to the right of the nav rail on Medium). Left: context (`2 MON · Refundable`). Right: primary pink button. It replaces the tab bar on `/events/[id]` so two bars don't compete.
- **Expanded/Large:** the same context and CTA live in the **sticky right panel**, top-aligned 24 px below the top bar, 320–340 px wide, white card with `--shadow-card`.

CTA labels by state are in §10.4.

---

## 12. Transaction & Wallet UX

Every on-chain action (pledge, withdraw, bid, back bid, pay listing fee, confirm completion, claim refund) uses **one shared Transaction overlay** (bottom sheet on compact, dialog on larger screens).

```
 Review ──▶ Confirm in wallet ──▶ Pending ──▶ Confirmed
                    │                │
                 Rejected         Failed
```

| Step | UI |
|---|---|
| **Review** | Summary rows, fee estimate, Testnet badge, primary button |
| **Confirm in wallet** | Mobile: `Check MetaMask` with a pulse. Desktop: `Check the MetaMask popup` + toolbar hint. Button disabled |
| **Pending** | Warning-tinted pill `Pending`, short copy `Confirming…` (Monad confirms quickly) |
| **Confirmed** | Green check draws in, summary, `View on explorer ↗`, `Done`. Page updates instantly |
| **Rejected** | `You cancelled in MetaMask.` + `Try again` |
| **Failed** | Danger message with cause (`Not enough MON for fee`, `Goal already met`, `Deadline passed`) + fix action |

**Pre-flight guards**
1. Wallet connected? Else open the connect overlay.
2. Correct chain (`10143`)? Else `Switch network`.
3. Enough MON for amount + fee? Else show shortfall and a faucet hint.
4. Role allowed? Else open verification or organizer flow.

**Optimistic updates:** on submit, show the pledge as `Pending`; on receipt, mark confirmed; on failure, roll back with an error.

### Wallet connection by environment

| Environment | Connector | Flow |
|---|---|---|
| **Desktop** Chrome/Edge/Firefox/Brave with MetaMask extension | Injected (EIP-6963) | One-click connect; approvals in extension popup |
| **Desktop** without a wallet, or Safari | Install MetaMask link + WalletConnect QR | Scan QR with phone wallet |
| **Android** Chrome / Samsung Internet / installed PWA | WalletConnect (deep link to MetaMask app) or open the site inside MetaMask's in-app browser | Approve in MetaMask, then return to the app |
| **iOS** Safari / installed PWA | Same as Android | Same as Android |
| **Inside MetaMask in-app browser** | Injected | One-click connect, same as desktop |

**Returning from a wallet app (Android/iOS):** the browser tab may be backgrounded or discarded while the user approves. Persist the pending tx hash and event id in `sessionStorage`; on `visibilitychange`/`pageshow` re-fetch status and update the overlay. Show a `Waiting for MetaMask…` state with a `Reopen MetaMask` button.

---

## 13. Data Provenance (on-chain vs off-chain)

| Data | Source | UI treatment |
|---|---|---|
| Pledge amounts, escrow balance, goal, deadline | **Contract (Monad)** | On-chain icon, explorer link |
| Event status, selected bid | **Contract** | Drives stepper and CTA |
| Bids (price, organizer, backers) | **Contract** (commitment) + Supabase (descriptions) **[Proposed split]** | Price shows on-chain icon |
| Venue listing fee / verified status | **Contract** | Verified venue badge |
| Venue photos, descriptions, tags | Supabase | Standard |
| Reviews, vibe scores, saves | Supabase | Verified visit badge from on-chain pledge history |
| Community membership, verification, chat | Supabase | Standard |

If chain and Supabase disagree (indexer lag), trust the chain and show a subtle `Syncing…`.

---

## 14. Suggested Contract Actions the UI Expects **[Proposed]**

Use to align Track 1 (frontend) and Track 2 (contracts). Rename freely.

| UI action | Contract call (suggested) | Emits |
|---|---|---|
| Start demand | `createEvent(goal, deadline, metadataRef)` | `EventCreated` |
| Pledge | `pledge(eventId)` payable | `Pledged` |
| Withdraw pledge | `withdraw(eventId)` (before lock) | `Withdrawn` |
| Place bid | `placeBid(eventId, pricePerHead, total, metadataRef)` | `BidPlaced` |
| Back a bid | `backBid(eventId, bidId)` | `BidBacked` |
| Select winning bid | `finalizeBid(eventId)` | `BidSelected`, `Locked` |
| Confirm event happened | `confirmCompletion(eventId)` | `Completed` |
| Release payout | `release(eventId)` | `Released` |
| Claim refund | `refund(eventId)` | `Refunded` |
| Pay listing fee | `listVenue(venueRef)` payable | `VenueListed` |

---

## 15. Iconography & Imagery

- **Icons:** thin outline (1.5 px stroke), rounded caps and joins. Lucide, Phosphor Regular or SF Symbols. 16 px in chips, 20 px in bars and inputs, 24 px in the tab bar and rail. Use one icon set on all platforms (no platform-specific icon swapping).
- **Default icon color:** `--text-primary`; `--accent` for active states.
- **Card covers:** paper-cut mixed-media collages on white/transparent (hands, objects, torn paper, pastel accents with a few saturated pops). One illustration style across all demand cards. Provide 1× and 2× assets, larger crops for desktop cards.
- **Venue and chat photos:** warm, natural lifestyle photography, lightly rounded and tilted in collages. Serve responsive `srcset` (400 / 800 / 1200 px) and `sizes` per layout class; use AVIF/WebP with JPEG fallback.
- **Avatars:** circular real photos.

---

## 16. Motion

| Moment | Behavior |
|---|---|
| Chip tap | Scale 0.97, fill white, then apply filter |
| Carousels | Touch: native momentum and snap. Desktop: arrow click scrolls one card, 240 ms ease-out |
| Sheet open (compact) | Spring up 240 ms, backdrop fade |
| Dialog open (desktop) | Fade + scale from 0.98, 180 ms |
| Popover | Fade + 4 px slide, 120 ms |
| Page change | 160 ms fade + 8 px slide |
| Card hover (desktop) | Lift 2 px, shadow to `--shadow-hover`, 120 ms |
| Message send | Slide up + fade 180–220 ms |
| Reaction add | Pop scale 0.8 → 1.0, 150 ms |
| Pledge submit | Progress bar animates to the new value (300 ms), soft pink pulse at the end |
| Tx confirmed | Check draws in (220 ms), light confetti (≤ 600 ms, once) |
| Checklist toggle | Box fills, label fades and strikes (150 ms) |

Respect `prefers-reduced-motion` (drop slides, scale, confetti; keep short fades). Non-user-triggered motion is limited to the pending pulse and goal-reached glow.

---

## 17. PWA Requirements

**Manifest**
```json
{
  "name": "<AppName>",
  "short_name": "<AppName>",
  "id": "/",
  "start_url": "/home",
  "scope": "/",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "#F7E1E8",
  "background_color": "#F7E1E8",
  "categories": ["social", "lifestyle"],
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/shots/home-narrow.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow" },
    { "src": "/shots/home-wide.png", "sizes": "1920x1080", "type": "image/png", "form_factor": "wide" }
  ],
  "shortcuts": [
    { "name": "Start a demand", "url": "/home?propose=1" },
    { "name": "My pledges", "url": "/home?pledges=1" }
  ]
}
```
Use `orientation: "any"` so tablets, foldables and desktop windows aren't locked to portrait; phones still default to portrait by usage.

**Shell and viewport**
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">`
- `<meta name="theme-color" content="#F7E1E8">`; apple touch icons and `apple-mobile-web-app-capable` for iOS.
- Use `env(safe-area-inset-*)` and `100dvh` (not `100vh`).

**Service worker**
- Precache the app shell; stale-while-revalidate for images and static assets.
- **Never cache RPC calls, contract reads used for money, or transaction state.**
- Offline: frosted banner with warning dot; cached venues remain browsable; pledge/bid buttons disabled with reason `You're offline`.

**Install UX**
- **Android/Chrome & Samsung Internet:** capture `beforeinstallprompt`; show an `Install app` card after the second visit or first connect; shortcuts appear on long-press of the launcher icon.
- **Desktop Chrome/Edge:** same custom prompt, plus the browser's omnibox install icon; installed app opens in its own window.
- **iOS Safari:** no install event, so show an `Add to Home Screen` tip sheet with the Share icon.
- **Updates:** show a toast `New version available · Refresh` when a new service worker is waiting; never reload mid-transaction.

**Performance**
- Lazy-load images; skeletons first; fixed card sizes to avoid layout shift.
- Budget for mid-range Android: LCP under ~2.5 s on 4G; keep the initial JS lean, load wallet libraries (wagmi/viem connectors) only when Connect is opened where possible.
- Provide the solid-surface fallback for low-end devices (§6).

---

## 18. Tokens (CSS + Tailwind v4)

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Breakpoints (Tailwind defaults, listed for clarity) */
  --breakpoint-sm: 640px;   /* Medium: nav rail */
  --breakpoint-lg: 1024px;  /* Expanded: split panes, desktop type scale */
  --breakpoint-xl: 1280px;  /* Large: full sidebar, right rail */

  /* Color */
  --color-lilac: #B9A8CC;
  --color-blush: #F2B5C8;
  --color-screen-top: #F7E1E8;
  --color-screen-bottom: #EBD7E2;
  --color-note-top: #FBE3EA;
  --color-note-bottom: #FFF6F8;
  --color-ink: #1C1A1F;
  --color-ink-2: #5E5A63;
  --color-ink-3: #9A949E;
  --color-accent: #E0245E;
  --color-accent-strong: #C81E52;
  --color-accent-hover: #CE1F55;
  --color-accent-pressed: #B91A4C;
  --color-accent-soft: #F8C8D6;
  --color-success: #2F9E6E;
  --color-warning: #E39B2D;
  --color-danger: #D6303F;
  --color-info: #7A66A8;

  /* Fonts */
  --font-serif: "Newsreader", "Source Serif 4", Georgia, serif;
  --font-sans: "Inter", Roboto, -apple-system, "Segoe UI", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Radius */
  --radius-card: 20px;
  --radius-panel: 24px;
  --radius-bubble: 18px;
  --radius-photo: 14px;
  --radius-sheet: 28px;

  /* Shadows */
  --shadow-card: 0 4px 16px rgba(120, 70, 100, 0.08);
  --shadow-hover: 0 10px 28px rgba(120, 70, 100, 0.14);
  --shadow-bubble: 0 1px 2px rgba(120, 70, 100, 0.06);
  --shadow-photo: 0 6px 18px rgba(60, 40, 60, 0.18);
  --shadow-dialog: 0 24px 64px rgba(60, 30, 50, 0.22);
}

:root {
  --surface-frost: rgba(255, 255, 255, 0.55);
  --surface-frost-solid: rgba(255, 255, 255, 0.85);
  --surface-hover: #FFF7F9;
  --border-subtle: rgba(28, 26, 31, 0.08);
  --ripple: rgba(224, 36, 94, 0.12);
  --focus-ring: 0 0 0 2px #FFFFFF, 0 0 0 4px #C81E52;

  --app-gradient: linear-gradient(180deg, #F7E1E8 0%, #F1DAE4 55%, #EBD7E2 100%);
  --note-gradient: linear-gradient(180deg, #FBE3EA 0%, #FFF6F8 100%);

  /* Layout */
  --rail-w: 80px;
  --sidebar-w: 248px;
  --rightrail-w: 320px;
  --panel-w: 340px;
  --main-max: 720px;
  --app-max: 1440px;
}

html { min-height: 100dvh; }
body {
  background: var(--app-gradient) fixed;
  color: var(--color-ink);
  font-family: var(--font-sans);
}

.frost {
  background: var(--surface-frost);
  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(12px);
}
@supports not (backdrop-filter: blur(1px)) {
  .frost { background: var(--surface-frost-solid); }
}

*:focus-visible { outline: none; box-shadow: var(--focus-ring); }

@media (hover: hover) and (pointer: fine) {
  .card-hover:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }
  .thin-scroll { scrollbar-width: thin; scrollbar-color: rgba(28,26,31,0.25) transparent; }
}
@media (pointer: coarse) {
  .tap-target { min-height: 44px; min-width: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

**Layout shell (Tailwind sketch)**
```tsx
<div className="mx-auto max-w-[var(--app-max)] min-h-dvh sm:grid sm:grid-cols-[var(--rail-w)_1fr] xl:grid-cols-[var(--sidebar-w)_1fr]">
  <Nav />        {/* hidden <sm (tab bar instead), rail sm–xl, sidebar xl+ */}
  <main className="px-4 sm:px-6 xl:px-8">{children}</main>
</div>
```

---

## 19. Copy Guidelines

- Plain, friendly, direct. Sentence case. No crypto jargon in primary UI.
- **Name actions once and keep them:** `Pledge` → toast `Pledged 2 MON`; `Withdraw` → `Withdrawn`; `Claim refund` → `Refund claimed`.
- Preferred: `Pledge`, `Held in escrow`, `Refundable until…`, `Confirm in MetaMask`, `View on explorer`.
- Avoid: `stake`, `deposit` (use `pledge`), `gas` in primary copy (use `network fee`).
- Wallet copy adapts to environment: `Check MetaMask` (mobile), `Check the MetaMask popup` (desktop).
- Use `Tap` for touch prompts and `Click` for pointer prompts, or neutral verbs (`Choose`, `Select`, `Open`) so copy works on both.
- Errors state cause and fix. No apologies.
- First pledge and first listing flows include: `Testnet: MON has no real value.`

---

## 20. Accessibility

- `--text-primary` on white and on the pink gradient passes AA. Use `--accent-strong` (`#C81E52`) for **small** pink text; `--accent` only for fills, icons and large text.
- White text on `--accent` fills is ~4.6:1; keep button labels 15 px+ and semibold.
- Verify `--text-tertiary` on white and pink for small captions; darken if it fails.
- State is never color-only: icon + label on pills; progress exposes `aria-valuenow`.
- **Keyboard:** everything reachable and operable; visible `--focus-ring`; logical order (nav → top bar → main → right rail/panel); roving focus in tabs and carousels; skip link to main content.
- **Overlays:** dialogs and sheets trap focus, close on `Esc`/back gesture, return focus to the trigger. On Android, Back closes the topmost overlay first.
- **Pointer + touch:** targets ≥ 44 × 44 pt on touch, ≥ 32 px with 8 px spacing for pointer; hover-only affordances must also appear on focus and on touch.
- **Screen readers:** landmarks (`nav`, `main`, `aside`), `aria-live` for toasts and tx status, countdowns announce on minute change, chat log uses `role="log"`.
- Support browser zoom to 200% and Dynamic Type/Android font scaling; cards and bubbles grow in height, layouts reflow rather than clip.
- Alt text for venue photos and demand illustrations.

---

## 21. Do / Don't

**Do**
- Keep surfaces white or frosted so the pink gradient breathes at every size.
- Use the serif for headlines, card titles and note titles only.
- Use pink sparingly: labels, mentions, active states, primary buttons.
- Re-arrange for larger screens (sidebar, split panes, inline panel) instead of scaling up phone screens.
- Show escrow location, amount and refund rule on every money screen.
- Give every disabled button a reason.
- Test Back behavior on Android with every overlay open.

**Don't**
- Introduce dark surfaces or neon colors.
- Add heavy borders, dark shadows or saturated fills to bubbles and cards.
- Use all-caps labels or a second brand accent.
- Mix illustration styles in the demand carousel.
- Rely on hover for any essential action.
- Stretch text or cards edge-to-edge on wide screens; cap columns.
- Show raw hashes or full addresses in primary UI.
- Hide fees, deadlines or refund conditions in fine print.
- Block browsing behind wallet connection.

---

## 22. Build Checklist (map to `tasks.md` tracks)

**Track 1 — Frontend**
- [ ] Fonts (Newsreader, Inter, JetBrains Mono) and tokens from §18
- [ ] Pink-lilac background with fixed cloud blobs
- [ ] Responsive shell: tab bar (<640), nav rail (640–1279), sidebar (≥1280), top bar with search (≥1024)
- [ ] Right rail (≥1280) for feed pages; sticky pledge panel on events (≥1024)
- [ ] Overlay system that switches sheet ↔ dialog ↔ popover per §7.6
- [ ] Primitives: Button, Chip, Card, Badge, StatusPill, Avatar/Stack, Tooltip, Toast, Skeleton, DataTable
- [ ] Domain components: DemandCard, VenueCard, VibeRating, ProgressBar, BidCard, EventPlanCard (note), ChatBubble, ReactionChip, PhotoCollage, Composer, ThreadList
- [ ] Pages: `/`, `/home`, `/communities`, `/events/[id]`, `/dashboard` (compact + desktop layouts)
- [ ] **[Proposed]** `/venues/[id]`, `/communities/[slug]`
- [ ] Shared TransactionOverlay with all six states and resume-on-return
- [ ] Android: history-backed overlays, keyboard-safe composer, edge-to-edge insets, install prompt
- [ ] Desktop: hover states, tooltips, keyboard shortcuts, carousel arrows, focus ring, thin scrollbars
- [ ] PWA: manifest (with screenshots and shortcuts), service worker, offline banner, update toast

**Track 2 — Backend / Web3**
- [ ] Wagmi + Viem config for Monad Testnet (`10143`); connectors: injected (EIP-6963), WalletConnect
- [ ] MetaMask mobile deep link / in-app browser path verified against current docs
- [ ] Contract read/write hooks matching §14
- [ ] Event listeners or indexer → Supabase sync
- [ ] Supabase tables: venues, reviews, communities, memberships, messages, saves, organizer profiles
- [ ] Storage buckets for venue and review images, with responsive image variants
- [ ] Student verification flow (college email code)
- [ ] Row-level security: only verified students write reviews; only organizers write listings

**QA matrix**

| Area | Cases |
|---|---|
| Android phones | Pixel-class (412 × 915) and Galaxy-class (360 × 780) in Chrome and Samsung Internet; installed WebAPK; gesture and 3-button nav; keyboard open in chat; Back with sheet open |
| iOS | iPhone (393 × 852) Safari and installed PWA; safe areas; Add to Home Screen tip |
| Tablet / foldable | 640–1023 layouts; rotate; fold/unfold without state loss |
| Desktop | 1024, 1280, 1440, 1920 widths; Chrome, Edge, Firefox, Safari; MetaMask extension; no-wallet fallback; installed desktop PWA |
| Input | Touch only, mouse only, keyboard only, screen reader smoke test |
| Wallet | Wrong network, rejected tx, insufficient MON, deadline passed, goal already met, return from MetaMask mobile, tab discarded mid-tx |
| Network | Offline, slow 3G/4G, service worker update mid-session |
| Visual | Side-by-side check against the Talk Sense screenshot; contrast audit; text zoom 200% |

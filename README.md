# A Game of Life

Live preview: https://weaponxd253.github.io/gameoflife/

A browser-based life simulation game built with vanilla HTML, CSS, and JavaScript. Players navigate major life decisions — education, career, relationships, housing, and retirement — while managing finances, health, and happiness across a simulated lifetime.

---

## Project Structure

```
├── index.html    # Game markup, jumbotron, choice container, tooltip element
├── styles.css    # Light/dark theming via CSS variables, progress bars, animations
└── script.js     # All game logic, state management, rendering, save/load
```

No build step, no framework, no package manager. Open `index.html` in a browser and play.

---

## How to Play

1. Open `index.html` in any modern browser
2. Read the scenario at the top of each step
3. Hover a choice to preview its stat effects in the tooltip
4. Click your choice, then press **Next →**
5. Watch the stat diff panel flash your changes after each decision
6. Complete all 15 steps to reach your Life Summary

---

## Features

### Core Gameplay
- **15 branching steps** spanning education, career, marriage, children, housing, cars, mid-life pivots, and retirement
- **4 starting paths**: College, direct career, trade school, or entrepreneurship — each leading to distinct career tracks
- **Mid-game branching** at the career crossroads: stay, switch, go back to school, or launch a business

### Stats System
Six tracked stats, all visible in the live dashboard at the top of the screen:

| Stat | Notes |
|---|---|
| **Salary** | Annual income; accumulates multiplicatively across career choices |
| **Savings** | Cash on hand; going negative converts the deficit to debt automatically |
| **Debt** | Negative net worth; partially paid down from savings at game end |
| **Health** | 0–100; capped at both ends, shown as an animated progress bar |
| **Happiness** | 0–100; same as health |
| **Age** | Starts at 18; each step advances by a contextually accurate number of years |

### Gated Choices
Certain options are locked behind stat requirements and shown with a 🔒 icon:

| Choice | Requirement |
|---|---|
| Grand luxury wedding | Savings ≥ $20,000 |
| Luxury home | Salary ≥ $100,000 |
| Luxury sports car | Savings ≥ $30,000 |
| Start a business (mid-game) | Savings ≥ $50,000 |
| Go back to college | Savings ≥ $30,000 |
| Franchise owner | Savings ≥ $75,000 |
| Early retirement | Savings ≥ $300,000 |

### Hover Tooltips
Hovering any unlocked choice shows a colour-coded stat preview — green for gains, red for costs — before you commit.

### Random Life Events
Triggered by a combination of conditions:
- Minimum 2-question cooldown between events
- 15% random chance per step (once cooldown is met)
- Higher chance (40%) when debt exceeds $50,000 or health drops below 50
- No event repeats within the last 3 triggers

12 possible events ranging from lottery wins and stock booms to medical bills, bad investments, and identity theft.

### Stat Diff Panel
After every choice, a flash panel appears between the dashboard and game area showing exactly what changed — salary, savings, debt, health, happiness, and years passed — colour coded positive/negative.

### Save & Load
The game auto-saves to `localStorage` after every step. On returning to the page a banner offers **Continue** (resumes mid-game) or **New Game** (clears the save and starts fresh). The save is cleared automatically when the game ends.

### Life Summary
The end screen shows:
- Your **title** (one of 10, determined by your final stats)
- **Net Worth** (`savings − debt`) with a letter grade from **A+** to **F**
- Final age, career, salary, savings, debt, happiness, health, marital status, dependents
- A full log of every life event you experienced, colour coded positive/negative

### Light / Dark Theme
Toggle via the icon in the top-left of the dashboard. Preference is saved to `localStorage`. All colours are driven by CSS custom properties so both themes are fully consistent, including the life event box.

---

##  Titles

Your end-of-game title is determined by your final stats in priority order:

| Title | Condition |
|---|---|
| 🤑 The Millionaire | Net worth > $1,000,000 |
| 💰 The Debt-Free King/Queen | No debt + savings > $100,000 |
| 💎 The Wealth Builder | Savings > $500,000 |
| 🌟 The Perfect Life Achiever | Health = 100 and Happiness = 100 |
| 😊 The Joyful Guru | Happiness ≥ 80 |
| 💪 The Fitness Master | Health ≥ 90 |
| 🏢 The Corporate Giant | Salary > $150,000 |
| 🚀 The Business Tycoon | Career includes "entrepreneur" or "founder" |
| 👨‍👩‍👧‍👦 The Family Builder | Dependents > 2 |
| 😅 The Risk Taker | Debt > $500,000 |
| 🌎 The Survivor | Everything else |

---

## Dependencies

Loaded via CDN — no local installation required:

| Library | Version | Purpose |
|---|---|---|
| [GSAP](https://greensock.com/gsap/) | 3.9.1 | Question transitions, life event animations, stat diff fades |
| [Font Awesome](https://fontawesome.com/) | 6.5.0 | Theme toggle moon/sun icon |
| [Google Fonts](https://fonts.google.com/) | — | Playfair Display + DM Sans (loaded in `<head>`) |

---

## Question Flow

```
Q0  Education choice
 ├─ College      → Q1  Pick college career  → Q5
 ├─ Career       → Q2  Pick non-college job → Q5
 ├─ Trade School → Q3  Pick trade career    → Q5
 └─ Business     → Q4  Pick business type   → Q5
                          Q5  Work-life balance
                          Q6  Marriage decision
                          Q7  Kids decision
                          Q8  Buy or rent home
                          Q9  Buy a car
                          Q10 Career crossroads
                           ├─ Stay           → Q14
                           ├─ Switch careers → Q12 → Q14
                           ├─ Start business → Q13 → Q14
                           └─ Back to school → Q11 → Q14
                          Q14 Retirement → End
```

---

## Extending the Game

### Adding a Question
1. Add a new object to the `questions` array in `script.js`
2. Set `ageYears` to how many years this step represents
3. Set `next` on each choice to the target question's array index
4. Update any existing `next` values that should route through the new question

### Adding a Life Event
Add an object to the `lifeEvents` array:
```js
{ text: "Description (+/- effects)", savings: 0, health: 0, happiness: 0, debt: 0 }
```
All fields except `text` are optional and default to 0.

### Adding a Gated Choice
Add a `requires` field to any choice object:
```js
{ text: "...", requires: { savings: 50000 }, next: 5, salary: 80000 }
```
Supported stat keys: `savings`, `salary`, `health`, `happiness`, `debt`, `age`.

### Adding a Title
Add a condition to `getTitle()` in `script.js`. Conditions are evaluated top-to-bottom; the first match wins.

---

## 🐛 Known Limitations

- The step counter ("Step X of 15") reflects the question's array index, not the number of steps actually taken. Players who branch through fewer questions will still see "Step 14 of 15" at retirement.
- Life events apply immediately and cannot be undone. A life event can fire before the stat diff panel from the previous choice has finished fading.
- The game is not designed for mobile hover interactions — tooltips are triggered on `mouseenter` and won't appear on touch devices.

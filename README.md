# ⚔️ Aethelgard: The Life RPG

A full-stack, dark-fantasy **Life RPG** web application that transforms real-world tasks, habits, and fitness into an engaging virtual progression system.

Designed from the ground up to solve the "delayed gratification" dilemma of traditional productivity tools, Aethelgard delivers instant feedback loops, non-linear character progression, tactile micro-interactions, procedural audio synthesis, and genuine database persistence.

---

## 🌟 Key Systems & Architecture

### 1. User Authentication & Multi-Tenant Security
- **Secure Authentication**: Built with salted `bcryptjs` password hashing and signed HTTP-only JWT cookies via `jose`.
- **Strict Data Isolation**: Server-authoritative tenancy ensures users can only read, create, update, and complete their own quests, character stats, and inventory.
- **Cross-Device Persistence**: Seamless synchronization across devices backed by a relational database.

### 2. Relational Database & Full CRUD
- **Prisma ORM & SQLite** (compatible with PostgreSQL/MySQL via single environment variable change):
  - **`User`**: Account identity and credential hashes.
  - **`Character`**: Hero class, level, current XP, Gold coins, 5 core attributes, and consecutive day streaks.
  - **`Quest`**: Full CRUD (Create, Read with category/attribute filters, Update, and Delete) with difficulty tiers and server-calculated yields.
  - **`Item` & `InventoryItem`**: Catalog of weapons, armor, relics, potions, and user-forged real-world reward vouchers.
  - **`ActivityLog`**: Immutable historical activity logs of all quest completions, level ups, and item purchases.
  - **`WorldBoss`**: Shared raid target taking direct damage whenever users conquer tasks.

### 3. Server-Authoritative RPG Progression Engine
- **Non-Linear Leveling Curve**:
  $$\text{XP Required for Level } L = \lfloor 100 \times L^{1.5} \rfloor$$
  - Level 1 → 2: 100 XP
  - Level 2 → 3: 282 XP
  - Level 3 → 4: 519 XP
  - Level 4 → 5: 800 XP
  - Level 5 → 6: 1,118 XP
- **Anti-Cheat Validation**: XP, Gold rewards, and boss damage calculations are performed entirely on the backend to prevent client stat manipulation.

### 4. Gamified Elements & Tactile UX
- **Streaks System**: Tracks consecutive days of activity with dynamic bonus multipliers ($+5\%$ bonus Gold & XP per day, up to $+50\%$).
- **5 Core Character Attributes**:
  - ⚔️ **Strength (STR)**: Powered by gym workouts, calisthenics, and physical training.
  - 🔮 **Intellect (INT)**: Powered by coding, reading, and deep study.
  - 🌿 **Vitality (VIT)**: Powered by 8-hour sleep, 2L+ water hydration, and nutrition.
  - ⚡ **Agility (AGI)**: Powered by swift chores, inbox zero, and tidying workspaces.
  - 🎭 **Charisma (CHA)**: Powered by networking, public speaking, and community building.
- **Economy & Bazaar**:
  - Earn Gold Pieces (GP) to buy weapons, armor, and relics that confer active stat bonuses.
  - **Forge Custom Rewards**: Inscribe personal real-world rewards (e.g., "1-Hour Video Game Session - 80 GP", "Order Pizza - 100 GP").
  - **Armory**: Equip and unequip weapons and armor with instant stat recalculation.
- **World Boss Raid**:
  - Fight *"The Procrastination Behemoth"*, an active raid titan whose HP drops whenever quests are marked complete!
- **Tactile Audio & Particle Engine**:
  - Procedural **Web Audio API** sound synthesizer (zero external sound files, runs everywhere, includes global mute toggle):
    - Triumphant multi-voice chord fanfare on level-up.
    - Resonant harmonic chime on quest completion.
    - Twin coin clink on item purchase.
  - Multi-colored **Canvas Confetti** explosions on quest completion and level-up.
  - Spring-bounce interactive checkboxes and floating `+XP / +GP` reward text.

### 5. Accessibility & Responsiveness
- Full responsive design adapted for mobile, tablet, and desktop screens.
- Keyboard navigable: Tab order, Enter/Space activation, Escape to close modals.
- Screen reader friendly semantic tags (`<header>`, `<nav>`, `<main>`, `<article>`).

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.17.0+ or v20+ / v22+
- **NPM**: v9+ or v10+

### 2. Clone and Install Dependencies
```bash
git clone <your-repo-url>
cd techzephyr
npm install
```

### 3. Configure Environment Variables
Copy the template configuration:
```bash
cp .env.example .env
```
Default `.env` contents:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="aethelgard-super-secret-jwt-key-change-in-production-rpg-2024"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Initialize & Seed Database
```bash
# Push schema to SQLite database
npx prisma db push

# Seed initial shop goods and World Boss
node prisma/seed.js
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Production Build & Verification

To verify production bundle compilation:
```bash
npm run build
npm start
```

---

## 📹 Walkthrough Video Guide (90–180 Seconds)

When recording your demonstration screen recording for submission:
1. **Signup / Login** (~20s): Open the app, click *"Awaken New Hero"*, pick a class (Paladin, Mage, Berserker, etc.), fill credentials (or use demo autofill), and enter the guildhall.
2. **Add a Quest** (~25s): Click *"Embark on Quest"*, choose an attribute (e.g. *Intellect* for Coding), difficulty (*Medium*), and submit. Observe live reward calculation preview.
3. **Complete Quest & Tactile Feedback** (~25s): Check the quest. Notice the spring bounce, sound chime, confetti particle burst, and floating `+50 XP, +30 GP`.
4. **Level Up Celebration** (~30s): Complete remaining quests to cross the non-linear XP threshold. Showcase the Level Up modal with celebratory fanfare and particle rain.
5. **Database Persistence Proof** (~20s): Visit the Bazaar to purchase an item, equip it in the Armory, and **hard-refresh the browser** (F5 / Ctrl+R) to prove all stats, quests, gold, and inventory persist from the database.

---

## 📜 License
MIT License. Built for the Life RPG Engineering Challenge.

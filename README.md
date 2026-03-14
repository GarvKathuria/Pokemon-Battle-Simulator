# ⚡ Pokémon Battle Arena

A full-featured browser-based Pokémon battle simulator built with React. Battle across all 9 generations, catch Pokémon, build your team, compete in real-time multiplayer, and climb the Hall of Fame ladder.

![](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png)
![](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png)
![](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png)
![](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png)

---

## 🎮 Features

### Core Gameplay
- **1,010 Pokémon** loaded live from PokéAPI — Generations I through IX (Kanto → Paldea)
- **Turn-based battle system** with real type effectiveness, STAB bonuses, level scaling, and Gen-accurate damage formula
- **Starter selection** — pick your first partner from 12 iconic starters across generations
- **Pokémon ownership** — you only battle with Pokémon you've caught or unlocked. Catch new ones mid-battle using Poké Balls

### Transformations
- **Mega Evolution** — 46 Pokémon with unique mega forms, real sprite changes via PokémonDB, boosted stats and type overrides
- **Gigantamax** — 20 Pokémon with G-Max forms, HP boost, unique G-Max moves (G-Max Wildfire, Volt Crash, etc.)
- **Z-Moves** — all 18 types have Z-Moves with cinematic animations and massive power

### Battle Systems
- **Weather system** — 7 weather conditions (Rain, Harsh Sun, Sandstorm, Hailstorm, Thunderstorm, Dense Fog, Clear) chosen randomly each battle. Animated particle effects render on canvas inside the arena
- **Status effects** — Burn, Poison, Paralysis, Sleep, Freeze with chip damage, turn skips, and live status badges in the UI
- **Type matchup preview** — hover any move button to see effectiveness before committing (💥 Super Effective, 😶 Not Very Effective, ❌ No Effect)
- **Battle items** — Potions, Super/Hyper/Max Potions, Rare Candy, Poké Balls

### Attack Animations
18 unique pixel-art canvas animations — one per type. Fire: rolling fireballs with trails. Electric: zigzag lightning bolt. Ice: crystalline cross shards. Ghost: shadowy orb with wisps. Dragon: energy beam. And so on for all 18 types. Z-Moves, Mega, and G-Max moves get enhanced screen flash versions.

### Progression
- **Win streaks** — consecutive wins multiply coin rewards (×2 at 3 wins, ×3 at 5 wins) with a full-screen banner
- **Coins** — earn by winning battles and completing challenges. Spend in the shop or to unlock Pokémon
- **Daily challenges** — 3 fresh challenges every day. Examples: "Beat a Dragon-type", "Win without items", "Win using Mega Evolution", "Catch a Pokémon"

### Screens
| Screen | Description |
|--------|-------------|
| Home | Profile, coins, quick nav to all features, streak display, daily challenges teaser |
| Pokédex | All 1,010 Pokémon — owned in color, uncaught silhouetted. Completion % bar |
| Team Builder | Manage up to 6 Pokémon from your caught collection |
| Shop | Potions, Pokéballs, Z-Crystals, Mega Stones, Dynamax Bands, Rare Candy |
| Pokémon Center | Select individual Pokémon to heal with checkboxes, or heal all |
| Trainer Card | Avatar, tier badge, starter, W/L/streak/rank — shareable via clipboard |
| Hall of Fame | Ranked ladder: Champion → Elite 4 → Gym Leader → Ace Trainer → Trainer → Rookie |
| Battle | Full arena with weather, status, move hover preview, items, transformations |

### Multiplayer
- Real-time PvP via WebSocket (`server.js`)
- Create or join rooms with a 6-character code, copy invite link
- Pokéball catching disabled in PvP matches

### Character System
- Username with validation and duplicate checking
- **Avatar builder** — 30 emoji avatars OR custom face builder (10 hair styles, 9 hair colors, 5 face shapes, 8 skin tones, 8 eye options)

### Audio
6 distinct music tracks (Web Audio API, zero external files):

| Screen | Track |
|--------|-------|
| Home | Warm peaceful overworld |
| Select/Pokédex | Adventurous exploration |
| Team Builder | Thoughtful strategic theme |
| Shop | Upbeat market jingle |
| Pokémon Center | Soft restorative chimes |
| Battle | Intense chiptune at 188 BPM |
| Victory / Defeat | Fanfare / Sad descending melody |

---

## 🗂️ Code Structure

```
pokemon-battle-simulator/
├── src/
│   └── App.js        ← Entire frontend (~3,000 lines, single file)
├── server.js         ← WebSocket server for multiplayer
├── package.json
└── README.md
```

### App.js — section map

| Section | What it does |
|---------|-------------|
| Constants & Data | Type chart, gen ranges, Mega/Gmax/Z-Move maps, move pool, shop items, weather data, status data, daily challenge pool |
| AudioEngine class | 6 music themes + SFX via Web Audio API — no external audio files |
| AttackAnimation | Canvas pixel-art animations, one unique style per type |
| WeatherCanvas | Animated rain/hail/sand/sun/fog/thunder particle effects |
| UI Components | StatusBadge, WeatherBanner, StreakBanner, MatchupPreview, HPBar, Badge |
| MegaEvolutionAnim | Transformation cutscene canvas animation |
| PokemonSprite | Loads normal/mega/gmax sprites with fallback chain |
| BattleStatCard | HP bar, type badges, level, status display |
| CharacterScreen | Name validation + emoji/custom avatar builder |
| StarterScreen | Pick your starter Pokémon |
| HallOfFame | Ranked leaderboard with tier system + score formula |
| PokedexScreen | Full collection grid, completion tracker |
| TrainerCard | Shareable profile card with rank and stats |
| DailyChallengesScreen | Daily quest UI with progress bars |
| Main App (state) | ~80 useState/useRef declarations |
| Data loading | Batch-fetch all 1,010 Pokémon from PokéAPI |
| Battle logic | useMove, enemyAttackTurn, weather/status/streak/challenge updates |
| Heal / Shop logic | Individual Pokémon selection healing, item purchases |
| Multiplayer logic | WebSocket room create/join, message relay |
| Render | All JSX screens: HOME, SELECT, TEAM, SHOP, HEAL, BATTLE, WAIT, MP, GAMEOVER |

### server.js

Node.js WebSocket server using `ws`:
- Room-based matchmaking via shared 6-character code
- Randomly assigns who attacks first
- Relays moves between players, handles disconnection

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install
npm install ws

# Terminal 1 — React app
npm start
# → http://localhost:3000

# Terminal 2 — Multiplayer server
node server.js
# → ws://localhost:3001
```

---

## 🌐 Deploying

| Service | Hosts | Cost |
|---------|-------|------|
| [Vercel](https://vercel.com) | React frontend | Free |
| [Railway](https://railway.app) | WebSocket server | Free tier |

1. Push repo to GitHub
2. Import to Vercel — auto-detects Create React App, deploy with defaults
3. Deploy to Railway — set start command to `node server.js`, generate a domain
4. In `App.js` change:
```js
const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:3001";
```
5. Add env var in Vercel dashboard: `REACT_APP_WS_URL` = `wss://your-app.up.railway.app`
6. Push — Vercel redeploys automatically

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Create React App) |
| Font | Press Start 2P (Google Fonts) |
| Audio | Web Audio API |
| Animations | HTML5 Canvas |
| Pokémon Data | [PokéAPI](https://pokeapi.co) |
| Sprites | PokeAPI sprites + PokémonDB |
| Multiplayer | WebSocket (`ws` package) |
| Storage | localStorage |

---

## 📝 License

MIT

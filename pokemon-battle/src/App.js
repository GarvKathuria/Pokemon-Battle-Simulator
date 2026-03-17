/* eslint-disable */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// Google Client ID: 661351244640-gnpaf4cejj9uoeg4q4h86uk0ghq2ena8.apps.googleusercontent.com

// ══════════════════════════════════════════════════════════════════════
//  CONSTANTS & DATA
// ══════════════════════════════════════════════════════════════════════
const TC = {
  fire:"#FF6B35",water:"#4FC3F7",grass:"#66BB6A",electric:"#FFD54F",
  psychic:"#F06292",ice:"#80DEEA",dragon:"#7C4DFF",dark:"#8D6E63",
  fairy:"#F48FB1",normal:"#9E9E9E",fighting:"#EF5350",flying:"#90CAF9",
  poison:"#CE93D8",ground:"#FFCC80",rock:"#A1887F",bug:"#C6D62A",
  ghost:"#7E57C2",steel:"#90A4AE",
};

const TYPE_CHART = {
  fire:{grass:2,ice:2,bug:2,steel:2,water:0.5,fire:0.5,rock:0.5,dragon:0.5},
  water:{fire:2,ground:2,rock:2,water:0.5,grass:0.5,dragon:0.5},
  grass:{water:2,ground:2,rock:2,fire:0.5,grass:0.5,poison:0.5,flying:0.5,bug:0.5,dragon:0.5,steel:0.5},
  electric:{water:2,flying:2,grass:0.5,electric:0.5,dragon:0.5,ground:0},
  psychic:{fighting:2,poison:2,psychic:0.5,steel:0.5,dark:0},
  ice:{grass:2,ground:2,flying:2,dragon:2,fire:0.5,water:0.5,ice:0.5,steel:0.5},
  dragon:{dragon:2,steel:0.5,fairy:0},
  fighting:{normal:2,ice:2,rock:2,dark:2,steel:2,poison:0.5,bug:0.5,psychic:0.5,flying:0.5,fairy:0.5,ghost:0},
  ghost:{psychic:2,ghost:2,normal:0,dark:0.5},
  dark:{psychic:2,ghost:2,dark:0.5,fighting:0.5,fairy:0.5},
  steel:{ice:2,rock:2,fairy:2,fire:0.5,water:0.5,electric:0.5,steel:0.5},
  fairy:{fighting:2,dragon:2,dark:2,fire:0.5,poison:0.5,steel:0.5},
  poison:{grass:2,fairy:2,poison:0.5,ground:0.5,rock:0.5,ghost:0.5,steel:0},
  ground:{fire:2,electric:2,poison:2,rock:2,steel:2,grass:0.5,bug:0.5,flying:0},
  normal:{rock:0.5,steel:0.5,ghost:0},
};

const GENS = {
  1:{sub:"Kanto",range:[1,151],col:"#FF6B35"},
  2:{sub:"Johto",range:[152,251],col:"#4FC3F7"},
  3:{sub:"Hoenn",range:[252,386],col:"#66BB6A"},
  4:{sub:"Sinnoh",range:[387,493],col:"#FFD54F"},
  5:{sub:"Unova",range:[494,649],col:"#F06292"},
  6:{sub:"Kalos",range:[650,721],col:"#80DEEA"},
  7:{sub:"Alola",range:[722,809],col:"#CE93D8"},
  8:{sub:"Galar",range:[810,898],col:"#FF8A80"},
  9:{sub:"Paldea",range:[899,1010],col:"#FFAB40"},
};
const getGen = id => { for(const[g,d] of Object.entries(GENS)) if(id>=d.range[0]&&id<=d.range[1]) return{g:+g,...d}; return{g:1,...GENS[1]}; };

const LEGENDARY_IDS = new Set([
  144,145,146,150,151,243,244,245,249,250,251,
  377,378,379,380,381,382,383,384,385,386,
  480,481,482,483,484,485,486,487,488,489,490,491,492,493,
  638,639,640,641,642,643,644,645,646,647,648,649,
  716,717,718,719,720,721,785,786,787,788,789,790,791,792,800,801,802,
  888,889,890,891,892,893,894,895,896,897,898,
]);

// MEGA map with slug-based sprites
const MEGA_MAP = {
  3:{name:"Mega Venusaur",slug:"venusaur-mega",atkMult:1.3,defMult:1.35},
  6:{name:"Mega Charizard X",slug:"charizard-mega-x",typeOverride:["fire","dragon"],atkMult:1.55},
  9:{name:"Mega Blastoise",slug:"blastoise-mega",atkMult:1.35,defMult:1.4},
  15:{name:"Mega Beedrill",slug:"beedrill-mega",typeOverride:["bug","poison"],atkMult:1.9},
  18:{name:"Mega Pidgeot",slug:"pidgeot-mega",typeOverride:["normal","flying"],atkMult:1.3},
  65:{name:"Mega Alakazam",slug:"alakazam-mega",atkMult:1.6,spdMult:1.3},
  80:{name:"Mega Slowbro",slug:"slowbro-mega",typeOverride:["water","psychic"],defMult:1.7},
  94:{name:"Mega Gengar",slug:"gengar-mega",atkMult:1.5,spdMult:1.3},
  115:{name:"Mega Kangaskhan",slug:"kangaskhan-mega",atkMult:1.4},
  127:{name:"Mega Pinsir",slug:"pinsir-mega",atkMult:1.45,typeOverride:["bug","flying"]},
  130:{name:"Mega Gyarados",slug:"gyarados-mega",atkMult:1.45,typeOverride:["water","dark"]},
  142:{name:"Mega Aerodactyl",slug:"aerodactyl-mega",atkMult:1.35,spdMult:1.3},
  150:{name:"Mega Mewtwo Y",slug:"mewtwo-mega-y",atkMult:1.7,spdMult:1.2},
  181:{name:"Mega Ampharos",slug:"ampharos-mega",atkMult:1.4,typeOverride:["electric","dragon"]},
  208:{name:"Mega Steelix",slug:"steelix-mega",typeOverride:["steel","ground"],defMult:2.0},
  212:{name:"Mega Scizor",slug:"scizor-mega",atkMult:1.4,defMult:1.3},
  214:{name:"Mega Heracross",slug:"heracross-mega",atkMult:1.45,defMult:1.3},
  229:{name:"Mega Houndoom",slug:"houndoom-mega",atkMult:1.4,spdMult:1.25},
  248:{name:"Mega Tyranitar",slug:"tyranitar-mega",atkMult:1.4,defMult:1.3},
  257:{name:"Mega Blaziken",slug:"blaziken-mega",atkMult:1.5,spdMult:1.35},
  260:{name:"Mega Swampert",slug:"swampert-mega",atkMult:1.45,defMult:1.35},
  282:{name:"Mega Gardevoir",slug:"gardevoir-mega",atkMult:1.45,typeOverride:["psychic","fairy"]},
  302:{name:"Mega Sableye",slug:"sableye-mega",defMult:1.5},
  303:{name:"Mega Mawile",slug:"mawile-mega",atkMult:1.5,defMult:1.4,typeOverride:["steel","fairy"]},
  306:{name:"Mega Aggron",slug:"aggron-mega",defMult:1.7,typeOverride:["steel"]},
  308:{name:"Mega Medicham",slug:"medicham-mega",atkMult:1.7,typeOverride:["fighting","psychic"]},
  310:{name:"Mega Manectric",slug:"manectric-mega",atkMult:1.4,spdMult:1.3},
  319:{name:"Mega Sharpedo",slug:"sharpedo-mega",atkMult:1.5,spdMult:1.3},
  323:{name:"Mega Camerupt",slug:"camerupt-mega",atkMult:1.45},
  334:{name:"Mega Altaria",slug:"altaria-mega",atkMult:1.35,typeOverride:["dragon","fairy"]},
  354:{name:"Mega Banette",slug:"banette-mega",atkMult:1.5},
  359:{name:"Mega Absol",slug:"absol-mega",atkMult:1.5,spdMult:1.25},
  362:{name:"Mega Glalie",slug:"glalie-mega",atkMult:1.5},
  373:{name:"Mega Salamence",slug:"salamence-mega",atkMult:1.5,typeOverride:["dragon","flying"]},
  376:{name:"Mega Metagross",slug:"metagross-mega",atkMult:1.5,defMult:1.35},
  380:{name:"Mega Latias",slug:"latias-mega",defMult:1.4,spdMult:1.2},
  381:{name:"Mega Latios",slug:"latios-mega",atkMult:1.5,spdMult:1.2},
  384:{name:"Mega Rayquaza",slug:"rayquaza-mega",atkMult:1.6,spdMult:1.3},
  428:{name:"Mega Lopunny",slug:"lopunny-mega",atkMult:1.5,typeOverride:["normal","fighting"]},
  445:{name:"Mega Garchomp",slug:"garchomp-mega",atkMult:1.45,defMult:1.3},
  448:{name:"Mega Lucario",slug:"lucario-mega",atkMult:1.5,typeOverride:["fighting","steel"]},
  460:{name:"Mega Abomasnow",slug:"abomasnow-mega",atkMult:1.35,defMult:1.3},
  475:{name:"Mega Gallade",slug:"gallade-mega",atkMult:1.5,typeOverride:["psychic","fighting"]},
  531:{name:"Mega Audino",slug:"audino-mega",defMult:1.6,typeOverride:["normal","fairy"]},
  658:{name:"Ash-Greninja",slug:"greninja-ash",atkMult:1.45,spdMult:1.3},
  719:{name:"Mega Diancie",slug:"diancie-mega",atkMult:1.6,defMult:1.6,typeOverride:["rock","fairy"]},
};

// Gigantamax IDs and their G-Max move names
const GIGANTAMAX_MAP = {
  6:{name:"G-Max Wildfire",type:"fire",power:320},
  12:{name:"G-Max Befuddle",type:"bug",power:290},
  25:{name:"G-Max Volt Crash",type:"electric",power:300},
  52:{name:"G-Max Gold Rush",type:"normal",power:280},
  68:{name:"G-Max Chi Strike",type:"fighting",power:310},
  94:{name:"G-Max Terror",type:"ghost",power:300},
  99:{name:"G-Max Foam Burst",type:"water",power:290},
  131:{name:"G-Max Resonance",type:"ice",power:300},
  143:{name:"G-Max Replenish",type:"normal",power:285},
  569:{name:"G-Max Malodor",type:"poison",power:295},
  823:{name:"G-Max Wind Rage",type:"flying",power:305},
  826:{name:"G-Max Snooze",type:"dark",power:295},
  834:{name:"G-Max Stonesurge",type:"water",power:290},
  841:{name:"G-Max Tartness",type:"grass",power:295},
  842:{name:"G-Max Sweetness",type:"grass",power:295},
  844:{name:"G-Max Sandblast",type:"ground",power:295},
  851:{name:"G-Max Centiferno",type:"fire",power:305},
  858:{name:"G-Max Smite",type:"fairy",power:300},
  861:{name:"G-Max Malevolence",type:"dark",power:300},
  869:{name:"G-Max Finale",type:"fairy",power:295},
  884:{name:"G-Max Depletion",type:"dragon",power:310},
  892:{name:"G-Max Chi Strike",type:"fighting",power:310},
  898:{name:"G-Max Soma Rush",type:"psychic",power:315},
};
const GIGANTAMAX_IDS = new Set(Object.keys(GIGANTAMAX_MAP).map(Number));

const Z_MOVES = {
  fire:{name:"Inferno Overdrive",power:200},water:{name:"Hydro Vortex",power:200},
  grass:{name:"Bloom Doom",power:200},electric:{name:"Gigavolt Havoc",power:200},
  psychic:{name:"Shattered Psyche",power:195},ice:{name:"Subzero Slammer",power:200},
  dragon:{name:"Devastating Drake",power:210},dark:{name:"Black Hole Eclipse",power:210},
  ghost:{name:"Never-Ending Nightmare",power:205},fighting:{name:"All-Out Pummeling",power:210},
  poison:{name:"Acid Downpour",power:200},ground:{name:"Tectonic Rage",power:195},
  rock:{name:"Continental Crush",power:195},bug:{name:"Savage Spin-Out",power:195},
  flying:{name:"Supersonic Skystrike",power:200},steel:{name:"Corkscrew Crash",power:205},
  fairy:{name:"Twinkle Tackle",power:190},normal:{name:"Breakneck Blitz",power:215},
};

const MOVE_POOL = {
  fire:[{name:"Flamethrower",type:"fire",power:90},{name:"Fire Blast",type:"fire",power:110},{name:"Heat Wave",type:"fire",power:95},{name:"Blast Burn",type:"fire",power:150}],
  water:[{name:"Hydro Pump",type:"water",power:110},{name:"Surf",type:"water",power:90},{name:"Aqua Tail",type:"water",power:90},{name:"Water Spout",type:"water",power:150}],
  grass:[{name:"Solar Beam",type:"grass",power:120},{name:"Energy Ball",type:"grass",power:90},{name:"Leaf Storm",type:"grass",power:130},{name:"Petal Blizzard",type:"grass",power:90}],
  electric:[{name:"Thunderbolt",type:"electric",power:90},{name:"Thunder",type:"electric",power:110},{name:"Wild Charge",type:"electric",power:90},{name:"Zap Cannon",type:"electric",power:120}],
  psychic:[{name:"Psychic",type:"psychic",power:90},{name:"Future Sight",type:"psychic",power:120},{name:"Psystrike",type:"psychic",power:100},{name:"Zen Headbutt",type:"psychic",power:80}],
  ice:[{name:"Blizzard",type:"ice",power:110},{name:"Ice Beam",type:"ice",power:90},{name:"Freeze-Dry",type:"ice",power:70},{name:"Sheer Cold",type:"ice",power:130}],
  dragon:[{name:"Outrage",type:"dragon",power:120},{name:"Draco Meteor",type:"dragon",power:130},{name:"Dragon Pulse",type:"dragon",power:85},{name:"Spacial Rend",type:"dragon",power:100}],
  dark:[{name:"Dark Pulse",type:"dark",power:80},{name:"Foul Play",type:"dark",power:95},{name:"Crunch",type:"dark",power:80},{name:"Night Daze",type:"dark",power:85}],
  ghost:[{name:"Shadow Ball",type:"ghost",power:80},{name:"Phantom Force",type:"ghost",power:90},{name:"Shadow Force",type:"ghost",power:120},{name:"Hex",type:"ghost",power:65}],
  fighting:[{name:"Close Combat",type:"fighting",power:120},{name:"Focus Blast",type:"fighting",power:120},{name:"Cross Chop",type:"fighting",power:100},{name:"Superpower",type:"fighting",power:120}],
  poison:[{name:"Sludge Bomb",type:"poison",power:90},{name:"Gunk Shot",type:"poison",power:120},{name:"Sludge Wave",type:"poison",power:95},{name:"Poison Jab",type:"poison",power:80}],
  ground:[{name:"Earthquake",type:"ground",power:100},{name:"Earth Power",type:"ground",power:90},{name:"Precipice Blades",type:"ground",power:120},{name:"Land's Wrath",type:"ground",power:90}],
  rock:[{name:"Stone Edge",type:"rock",power:100},{name:"Rock Blast",type:"rock",power:75},{name:"Power Gem",type:"rock",power:80},{name:"Diamond Storm",type:"rock",power:100}],
  bug:[{name:"Bug Buzz",type:"bug",power:90},{name:"Megahorn",type:"bug",power:120},{name:"X-Scissor",type:"bug",power:80},{name:"Leech Life",type:"bug",power:80}],
  flying:[{name:"Hurricane",type:"flying",power:110},{name:"Brave Bird",type:"flying",power:120},{name:"Air Slash",type:"flying",power:75},{name:"Aeroblast",type:"flying",power:100}],
  steel:[{name:"Iron Head",type:"steel",power:80},{name:"Flash Cannon",type:"steel",power:80},{name:"Meteor Mash",type:"steel",power:90},{name:"Doom Desire",type:"steel",power:140}],
  fairy:[{name:"Moonblast",type:"fairy",power:95},{name:"Play Rough",type:"fairy",power:90},{name:"Dazzling Gleam",type:"fairy",power:80},{name:"Light of Ruin",type:"fairy",power:140}],
  normal:[{name:"Hyper Beam",type:"normal",power:150},{name:"Body Slam",type:"normal",power:85},{name:"Extreme Speed",type:"normal",power:80},{name:"Boomburst",type:"normal",power:140}],
};
const getMoves = t => (MOVE_POOL[t]||MOVE_POOL.normal).slice(0,4);

const SHOP_ITEMS = [
  {id:"potion",name:"Potion",emoji:"🧪",desc:"+20 HP",heal:20,cost:50},
  {id:"super_potion",name:"Super Potion",emoji:"💊",desc:"+50 HP",heal:50,cost:100},
  {id:"hyper_potion",name:"Hyper Potion",emoji:"⚗️",desc:"+120 HP",heal:120,cost:200},
  {id:"max_potion",name:"Max Potion",emoji:"✨",desc:"Full restore",heal:99999,cost:400},
  {id:"rare_candy",name:"Rare Candy",emoji:"🍬",desc:"+1 Level",cost:300},
  {id:"pokeball",name:"Poké Ball",emoji:"⚪",desc:"35% catch rate",cost:100,isBall:true,catch:0.35},
  {id:"great_ball",name:"Great Ball",emoji:"🔵",desc:"55% catch rate",cost:200,isBall:true,catch:0.55},
  {id:"ultra_ball",name:"Ultra Ball",emoji:"🟡",desc:"75% catch rate",cost:400,isBall:true,catch:0.75},
  {id:"master_ball",name:"Master Ball",emoji:"🟣",desc:"100% catch",cost:2000,isBall:true,catch:1.0},
  {id:"z_crystal",name:"Z-Crystal",emoji:"💎",desc:"Use Z-Move",cost:500},
  {id:"mega_stone",name:"Mega Stone",emoji:"🔮",desc:"Mega Evolve",cost:800},
  {id:"dynamax_band",name:"Dynamax Band",emoji:"⭕",desc:"Gigantamax",cost:1000},
];

// Starter Pokémon choices — Gen 1 starters
const STARTER_CHOICES = [
  // Gen 1 — Kanto
  {id:1,name:"Bulbasaur"},{id:4,name:"Charmander"},{id:7,name:"Squirtle"},
  // Gen 1 extras
  {id:25,name:"Pikachu"},{id:133,name:"Eevee"},
  // Gen 2 — Johto
  {id:152,name:"Chikorita"},{id:155,name:"Cyndaquil"},{id:158,name:"Totodile"},
  // Gen 3 — Hoenn
  {id:252,name:"Treecko"},{id:255,name:"Torchic"},{id:258,name:"Mudkip"},
  // Gen 4 — Sinnoh
  {id:387,name:"Turtwig"},{id:390,name:"Chimchar"},{id:393,name:"Piplup"},
  // Gen 5 — Unova
  {id:495,name:"Snivy"},{id:498,name:"Tepig"},{id:501,name:"Oshawott"},
  // Gen 6 — Kalos
  {id:650,name:"Chespin"},{id:653,name:"Fennekin"},{id:656,name:"Froakie"},
  // Gen 7 — Alola
  {id:722,name:"Rowlet"},{id:725,name:"Litten"},{id:728,name:"Popplio"},
  // Gen 8 — Galar
  {id:810,name:"Grookey"},{id:813,name:"Scorbunny"},{id:816,name:"Sobble"},
  // Gen 9 — Paldea
  {id:906,name:"Sprigatito"},{id:909,name:"Fuecoco"},{id:912,name:"Quaxly"},
];

const MODES = {CHAR:"char",STARTER:"starter",HOME:"home",SELECT:"select",UNLOCK:"unlock",TEAM:"team",BATTLE:"battle",OVER:"over",WAIT:"wait",MP:"mp",MP_SOON:"mp_soon",SHOP:"shop",HEAL:"heal",DEX:"dex",CARD:"card",CHALLENGES:"challenges",STORY:"story",HISTORY:"history",PROFILE:"profile"};

// ══════════════════════════════════════════════════════════════════════
// SUPABASE DATABASE SETUP
// ══════════════════════════════════════════════════════════════════════
// 1. Go to supabase.com → New project (free tier, Southeast Asia region)
// 2. Left sidebar → SQL Editor → New query → paste and run ALL of this:
//
//  -- Players table: tracks every registration and login
//  CREATE TABLE players (
//    id          bigserial PRIMARY KEY,
//    username    text NOT NULL,
//    email       text,
//    action      text,          -- 'register' | 'login' | 'guest'
//    pass_hash   text,          -- hashed password (never plain text)
//    avatar      text,          -- emoji or '[built]'
//    wins        int DEFAULT 0,
//    losses      int DEFAULT 0,
//    coins       int DEFAULT 500,
//    score       int DEFAULT 0,
//    ts          timestamptz DEFAULT now()
//  );
//  -- Battles table: tracks every battle result
//  CREATE TABLE battles (
//    id             bigserial PRIMARY KEY,
//    username       text,
//    winner         text,        -- username of winner
//    player_pokemon text,
//    enemy_pokemon  text,
//    turns          int,
//    ts             timestamptz DEFAULT now()
//  );
//  -- Sessions table: tracks logins for DAU stats
//  CREATE TABLE sessions (
//    id         bigserial PRIMARY KEY,
//    username   text,
//    action     text,            -- 'login' | 'register' | 'guest_start'
//    ts         timestamptz DEFAULT now()
//  );
//  -- Enable Row Level Security
//  ALTER TABLE players  ENABLE ROW LEVEL SECURITY;
//  ALTER TABLE battles  ENABLE ROW LEVEL SECURITY;
//  ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
//  -- Allow anonymous inserts (the game writes, only you read via dashboard)
//  CREATE POLICY "insert_players"  ON players  FOR INSERT WITH CHECK (true);
//  CREATE POLICY "insert_battles"  ON battles  FOR INSERT WITH CHECK (true);
//  CREATE POLICY "insert_sessions" ON sessions FOR INSERT WITH CHECK (true);
//  -- Useful views for your dashboard:
//  CREATE VIEW daily_active_users AS
//    SELECT DATE(ts) as day, COUNT(DISTINCT username) as users FROM sessions GROUP BY day ORDER BY day DESC;
//  CREATE VIEW top_players AS
//    SELECT username, MAX(wins) as wins, MAX(losses) as losses,
//           ROUND(MAX(wins)::numeric/NULLIF(MAX(wins)+MAX(losses),0)*100,1) as win_rate
//    FROM players WHERE action IN ('register','login') GROUP BY username ORDER BY wins DESC LIMIT 50;
//  CREATE VIEW registrations_per_day AS
//    SELECT DATE(ts) as day, COUNT(*) as new_users FROM players WHERE action='register' GROUP BY day ORDER BY day DESC;
//
// 3. Settings → API → copy "Project URL" and "anon public" key → paste below:
const SUPA_URL = "https://hoqsdlpsqdtpvskbfafh.supabase.co";
const SUPA_KEY = "sb_publishable_-4k_spf5R3kfRVDWzF_38w_LMkv4ES2";
const SUPA_READY = SUPA_URL.includes("supabase.co") && !SUPA_URL.includes("YOUR_PROJECT");
function supaTrack(table, data){
  if(!SUPA_READY) return;
  // Support both new sb_publishable_ keys and legacy eyJ... anon keys
  const headers = {
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
  };
  if(SUPA_KEY.startsWith("sb_publishable_")){
    headers["Authorization"] = `Bearer ${SUPA_KEY}`;
    headers["apikey"] = SUPA_KEY;
  } else {
    headers["apikey"] = SUPA_KEY;
    headers["Authorization"] = `Bearer ${SUPA_KEY}`;
  }
  fetch(`${SUPA_URL}/rest/v1/${table}`,{
    method:"POST",
    headers,
    body:JSON.stringify({...data, ts: new Date().toISOString()})
  }).catch(()=>{}); // silent fail — never blocks the game
}
// Track registration (username + email + hashed password)
function supaRegister(username, email, passHash, avatar){
  supaTrack("players",{username,email,action:"register",pass_hash:passHash||"",avatar:avatar||"",wins:0,losses:0,coins:500,score:0});
  supaTrack("sessions",{username,action:"register"});
}
// Track login
function supaLogin(username, email){
  supaTrack("players",{username,email:email||"",action:"login"});
  supaTrack("sessions",{username,action:"login"});
}
// Track guest start
function supaGuest(guestName){
  supaTrack("sessions",{username:guestName,action:"guest_start"});
}
// Track battle result
function supaBattle(username, winner, pName, eName, turns){
  supaTrack("battles",{username,winner,player_pokemon:pName,enemy_pokemon:eName,turns});
}
// Update player stats after battle
function supaUpdateStats(username, wins, losses, coins){
  supaTrack("players",{username,action:"stats_update",wins,losses,coins,score:wins*100-losses*10});
}

// ── EXP & Evolution ─────────────────────────────────────────────────
const EXP_TO_LEVEL = lvl => Math.floor(100 * Math.pow(lvl, 2.2));
const LEVEL_FROM_EXP = exp => { let l=1; while(EXP_TO_LEVEL(l+1)<=exp&&l<100) l++; return l; };
const EVOLVE_MAP = {
  1:{evolvesTo:2,minLevel:16},2:{evolvesTo:3,minLevel:32},4:{evolvesTo:5,minLevel:16},5:{evolvesTo:6,minLevel:36},
  7:{evolvesTo:8,minLevel:16},8:{evolvesTo:9,minLevel:36},10:{evolvesTo:11,minLevel:7},11:{evolvesTo:12,minLevel:10},
  13:{evolvesTo:14,minLevel:7},14:{evolvesTo:15,minLevel:10},16:{evolvesTo:17,minLevel:18},17:{evolvesTo:18,minLevel:36},
  19:{evolvesTo:20,minLevel:20},21:{evolvesTo:22,minLevel:20},23:{evolvesTo:24,minLevel:22},
  27:{evolvesTo:28,minLevel:22},29:{evolvesTo:30,minLevel:16},30:{evolvesTo:31,minLevel:36},
  32:{evolvesTo:33,minLevel:16},33:{evolvesTo:34,minLevel:36},41:{evolvesTo:42,minLevel:22},
  43:{evolvesTo:44,minLevel:21},46:{evolvesTo:47,minLevel:24},48:{evolvesTo:49,minLevel:31},
  50:{evolvesTo:51,minLevel:28},52:{evolvesTo:53,minLevel:28},54:{evolvesTo:55,minLevel:33},
  56:{evolvesTo:57,minLevel:28},58:{evolvesTo:59,minLevel:28},60:{evolvesTo:61,minLevel:25},
  63:{evolvesTo:64,minLevel:16},64:{evolvesTo:65,minLevel:36},66:{evolvesTo:67,minLevel:28},
  67:{evolvesTo:68,minLevel:36},69:{evolvesTo:70,minLevel:21},70:{evolvesTo:71,minLevel:31},
  72:{evolvesTo:73,minLevel:30},74:{evolvesTo:75,minLevel:25},75:{evolvesTo:76,minLevel:36},
  77:{evolvesTo:78,minLevel:40},79:{evolvesTo:80,minLevel:37},81:{evolvesTo:82,minLevel:30},
  84:{evolvesTo:85,minLevel:31},86:{evolvesTo:87,minLevel:34},88:{evolvesTo:89,minLevel:38},
  92:{evolvesTo:93,minLevel:25},96:{evolvesTo:97,minLevel:26},98:{evolvesTo:99,minLevel:28},
  100:{evolvesTo:101,minLevel:30},104:{evolvesTo:105,minLevel:28},109:{evolvesTo:110,minLevel:35},
  111:{evolvesTo:112,minLevel:42},116:{evolvesTo:117,minLevel:32},118:{evolvesTo:119,minLevel:33},
  129:{evolvesTo:130,minLevel:20},147:{evolvesTo:148,minLevel:30},148:{evolvesTo:149,minLevel:55},
  152:{evolvesTo:153,minLevel:17},153:{evolvesTo:154,minLevel:32},155:{evolvesTo:156,minLevel:17},
  156:{evolvesTo:157,minLevel:36},158:{evolvesTo:159,minLevel:18},159:{evolvesTo:160,minLevel:30},
  161:{evolvesTo:162,minLevel:15},163:{evolvesTo:164,minLevel:20},165:{evolvesTo:166,minLevel:31},
  167:{evolvesTo:168,minLevel:22},170:{evolvesTo:171,minLevel:27},179:{evolvesTo:180,minLevel:15},
  180:{evolvesTo:181,minLevel:30},183:{evolvesTo:184,minLevel:18},187:{evolvesTo:188,minLevel:18},
  188:{evolvesTo:189,minLevel:27},194:{evolvesTo:195,minLevel:20},209:{evolvesTo:210,minLevel:23},
  216:{evolvesTo:217,minLevel:30},218:{evolvesTo:219,minLevel:38},220:{evolvesTo:221,minLevel:33},
  223:{evolvesTo:224,minLevel:20},228:{evolvesTo:229,minLevel:24},231:{evolvesTo:232,minLevel:25},
  246:{evolvesTo:247,minLevel:30},247:{evolvesTo:248,minLevel:55},252:{evolvesTo:253,minLevel:16},
  253:{evolvesTo:254,minLevel:36},255:{evolvesTo:256,minLevel:16},256:{evolvesTo:257,minLevel:36},
  258:{evolvesTo:259,minLevel:16},259:{evolvesTo:260,minLevel:36},261:{evolvesTo:262,minLevel:18},
  263:{evolvesTo:264,minLevel:20},270:{evolvesTo:271,minLevel:14},273:{evolvesTo:274,minLevel:14},
  274:{evolvesTo:275,minLevel:36},276:{evolvesTo:277,minLevel:22},278:{evolvesTo:279,minLevel:25},
  280:{evolvesTo:281,minLevel:20},281:{evolvesTo:282,minLevel:30},285:{evolvesTo:286,minLevel:23},
  287:{evolvesTo:288,minLevel:18},288:{evolvesTo:289,minLevel:36},290:{evolvesTo:291,minLevel:20},
  293:{evolvesTo:294,minLevel:20},294:{evolvesTo:295,minLevel:40},296:{evolvesTo:297,minLevel:24},
  300:{evolvesTo:301,minLevel:18},304:{evolvesTo:305,minLevel:32},305:{evolvesTo:306,minLevel:42},
  307:{evolvesTo:308,minLevel:37},309:{evolvesTo:310,minLevel:26},316:{evolvesTo:317,minLevel:26},
  318:{evolvesTo:319,minLevel:30},320:{evolvesTo:321,minLevel:30},325:{evolvesTo:326,minLevel:32},
  328:{evolvesTo:329,minLevel:35},329:{evolvesTo:330,minLevel:45},333:{evolvesTo:334,minLevel:35},
  349:{evolvesTo:350,minLevel:20},353:{evolvesTo:354,minLevel:32},355:{evolvesTo:356,minLevel:37},
  361:{evolvesTo:362,minLevel:42},363:{evolvesTo:364,minLevel:22},364:{evolvesTo:365,minLevel:44},
  371:{evolvesTo:372,minLevel:30},372:{evolvesTo:373,minLevel:50},374:{evolvesTo:375,minLevel:30},
  375:{evolvesTo:376,minLevel:45},387:{evolvesTo:388,minLevel:18},388:{evolvesTo:389,minLevel:32},
  390:{evolvesTo:391,minLevel:14},391:{evolvesTo:392,minLevel:36},393:{evolvesTo:394,minLevel:16},
  394:{evolvesTo:395,minLevel:36},396:{evolvesTo:397,minLevel:14},397:{evolvesTo:398,minLevel:36},
  399:{evolvesTo:400,minLevel:15},401:{evolvesTo:402,minLevel:20},403:{evolvesTo:404,minLevel:15},
  404:{evolvesTo:405,minLevel:42},408:{evolvesTo:409,minLevel:30},410:{evolvesTo:411,minLevel:30},
  418:{evolvesTo:419,minLevel:26},420:{evolvesTo:421,minLevel:25},422:{evolvesTo:423,minLevel:30},
  425:{evolvesTo:426,minLevel:28},431:{evolvesTo:432,minLevel:25},434:{evolvesTo:435,minLevel:34},
  443:{evolvesTo:444,minLevel:24},444:{evolvesTo:445,minLevel:48},447:{evolvesTo:448,minLevel:0,item:true},
  449:{evolvesTo:450,minLevel:34},451:{evolvesTo:452,minLevel:40},453:{evolvesTo:454,minLevel:37},
  456:{evolvesTo:457,minLevel:31},459:{evolvesTo:460,minLevel:40},
};

// Story mode gyms + Elite 4 + Champion
const STORY_GYMS = [
  {id:1, name:"Brock",    badge:"Boulder Badge",type:"rock",    level:14,icon:"⛰️", team:[74,95],       reward:500,  hint:"Use Water or Grass moves."},
  {id:2, name:"Misty",   badge:"Cascade Badge",type:"water",   level:21,icon:"💧", team:[120,121],     reward:700,  hint:"Use Electric or Grass moves."},
  {id:3, name:"Lt. Surge",badge:"Thunder Badge",type:"electric",level:28,icon:"⚡", team:[100,26],      reward:900,  hint:"Use Ground moves."},
  {id:4, name:"Erika",   badge:"Rainbow Badge",type:"grass",   level:32,icon:"🌸", team:[71,114,182],  reward:1100, hint:"Use Fire or Flying moves."},
  {id:5, name:"Koga",    badge:"Soul Badge",   type:"poison",  level:38,icon:"🌫️", team:[109,89,110],  reward:1300, hint:"Use Ground or Psychic moves."},
  {id:6, name:"Sabrina", badge:"Marsh Badge",  type:"psychic", level:43,icon:"🔮", team:[64,122,65],   reward:1500, hint:"Use Bug, Ghost or Dark moves."},
  {id:7, name:"Blaine",  badge:"Volcano Badge",type:"fire",    level:47,icon:"🔥", team:[58,77,78],    reward:1700, hint:"Use Water, Ground or Rock."},
  {id:8, name:"Giovanni",badge:"Earth Badge",  type:"ground",  level:50,icon:"🌍", team:[111,51,112],  reward:2000, hint:"Use Water, Ice or Grass."},
  {id:9, name:"Lorelei", badge:"Elite 4 I",    type:"ice",     level:54,icon:"❄️", team:[87,91,124,131,139],reward:2500,hint:"Elite 4. Use Electric, Rock or Steel."},
  {id:10,name:"Bruno",   badge:"Elite 4 II",   type:"fighting",level:58,icon:"💪", team:[95,99,106,107,68],reward:3000,hint:"Elite 4. Use Psychic or Flying."},
  {id:11,name:"Agatha",  badge:"Elite 4 III",  type:"ghost",   level:60,icon:"👻", team:[92,93,94,93,94],reward:3500,hint:"Elite 4. Use Ghost or Dark."},
  {id:12,name:"Lance",   badge:"Elite 4 IV",   type:"dragon",  level:62,icon:"🐉", team:[148,148,130,142,149],reward:4000,hint:"Elite 4. Use Ice or Dragon."},
  {id:13,name:"Blue",    badge:"Champion!",    type:"normal",  level:65,icon:"👑", team:[18,103,65,112,59,149],reward:5000,hint:"Champion. Mixed team. Bring your best!"},
];
const storyKey = name => `pkmn_story_${name}`;

// Smarter AI — score each move, pick best
function aiPickMove(eMon, pMon, eStatus, weather){
  const moves = eMon.moves;
  let best = moves[0], bestScore = -Infinity;
  for(const mv of moves){
    const {dmg, eff} = calcDmg(eMon, mv, pMon, 50);
    const wxMult = WEATHER_MULT(weather, mv.type);
    let score = dmg * wxMult * (eStatus?.type==="burn" ? 0.5 : 1);
    if(eff >= 2) score *= 2.5;
    if(eff === 0) score = -999;
    if(eMon.types.includes(mv.type)) score *= 1.3;
    if(eff <= 0.5) score *= 0.4;
    if(score > bestScore){ bestScore = score; best = mv; }
  }
  return Math.random() < 0.25 ? moves[Math.floor(Math.random()*moves.length)] : best;
}

// Animated sprite URL
const animSpriteUrl = (id, back=false) => back
  ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`
  : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;

// Battle history record
const makeBattleRecord = (pMon, eMon, winner, turns, pLevel) => ({
  id: Date.now(), date: new Date().toLocaleDateString(),
  pName: pMon.name, pId: pMon.id, pLevel,
  eName: eMon.name, eId: eMon.id, winner, turns,
});

// ── Weather ───────────────────────────────────────────────────────────
const WEATHERS=[
  {id:"clear",  name:"Clear Sky",   icon:"☀️",  typeBoost:null,        typePenalty:null,    chip:0,    desc:"No weather effects."},
  {id:"rain",   name:"Heavy Rain",  icon:"🌧️",  typeBoost:"water",     typePenalty:"fire",  chip:0,    desc:"Water +50%! Fire -50%."},
  {id:"sand",   name:"Sandstorm",   icon:"🌪️",  typeBoost:"rock",      typePenalty:null,    chip:0.06, desc:"Rock protected. Chip dmg each turn."},
  {id:"hail",   name:"Hailstorm",   icon:"🌨️",  typeBoost:"ice",       typePenalty:null,    chip:0.06, desc:"Ice +50%. Chip dmg each turn."},
  {id:"sun",    name:"Harsh Sun",   icon:"🔆",  typeBoost:"fire",      typePenalty:"water", chip:0,    desc:"Fire +50%! Water -50%."},
  {id:"fog",    name:"Dense Fog",   icon:"🌫️",  typeBoost:"ghost",     typePenalty:null,    chip:0,    desc:"Ghost +50%. Accuracy reduced."},
  {id:"thunder",name:"Thunderstorm",icon:"⛈️",  typeBoost:"electric",  typePenalty:null,    chip:0,    desc:"Electric always hits!"},
];
const WEATHER_MULT=(w,t)=>{ if(!w||w.id==="clear") return 1; if(w.typeBoost===t) return 1.5; if(w.typePenalty===t) return 0.5; return 1; };

// ── Status Effects ────────────────────────────────────────────────────
const STATUSES={
  burn:     {name:"BRN",icon:"🔥",color:"#FF6B35",chipPct:0.12,atkMult:0.5},
  poison:   {name:"PSN",icon:"☠️",color:"#CE93D8",chipPct:0.12},
  paralysis:{name:"PAR",icon:"⚡",color:"#FFD54F",skipChance:0.25,spdMult:0.5},
  sleep:    {name:"SLP",icon:"💤",color:"#90CAF9",skipTurns:true},
  freeze:   {name:"FRZ",icon:"❄️",color:"#80DEEA",skipChance:0.5,thawChance:0.2},
};
const STATUS_CHANCE={fire:0.12,poison:0.18,electric:0.15,ice:0.1,psychic:0.08};
const STATUS_FROM={fire:"burn",poison:"poison",electric:"paralysis",ice:"freeze",psychic:"sleep"};

// ── Daily Challenges ──────────────────────────────────────────────────
const CHALLENGE_POOL=[
  {id:"fire_win",    desc:"Beat a Fire-type",           reward:120, icon:"🔥", checkWin:e=>e?.types?.includes("fire")},
  {id:"water_win",   desc:"Beat a Water-type",          reward:120, icon:"💧", checkWin:e=>e?.types?.includes("water")},
  {id:"psychic_win", desc:"Beat a Psychic-type",        reward:150, icon:"🔮", checkWin:e=>e?.types?.includes("psychic")},
  {id:"dragon_win",  desc:"Beat a Dragon-type",         reward:200, icon:"🐉", checkWin:e=>e?.types?.includes("dragon")},
  {id:"legend_win",  desc:"Defeat a Legendary",         reward:400, icon:"⭐", checkWin:e=>e?.legendary},
  {id:"no_items",    desc:"Win without using items",     reward:180, icon:"🚫", isNoItems:true},
  {id:"daily3",      desc:"Win 3 battles today",         reward:250, icon:"🏆", countGoal:3},
  {id:"catch_one",   desc:"Catch any Pokémon today",    reward:150, icon:"⚪", isCatch:true},
  {id:"zmove_win",   desc:"Win using a Z-Move",          reward:160, icon:"💎", isZWin:true},
  {id:"mega_win",    desc:"Win using Mega Evolution",    reward:180, icon:"✨", isMegaWin:true},
  {id:"streak3",     desc:"Achieve a 3-win streak",      reward:300, icon:"🔥", isStreak:true},
  {id:"electric_win",desc:"Beat an Electric-type",       reward:120, icon:"⚡", checkWin:e=>e?.types?.includes("electric")},
  {id:"ice_win",     desc:"Beat an Ice-type",             reward:130, icon:"❄️", checkWin:e=>e?.types?.includes("ice")},
];
function getDailyChallenges(){
  const today=new Date().toDateString();
  let seed=[...today].reduce((a,c)=>a+c.charCodeAt(0),0);
  const out=[],used=new Set();
  while(out.length<3){
    seed=(seed*1664525+1013904223)>>>0;
    const i=seed%CHALLENGE_POOL.length;
    if(!used.has(i)){ used.add(i); out.push({...CHALLENGE_POOL[i],date:today,progress:0,done:false}); }
  }
  return out;
}
const todayKey=()=>new Date().toDateString();
// Per-profile + per-day keys so different accounts never share challenge progress
const challengeKey = (profileName) => `pkmn_challenges_${profileName}_${todayKey()}`;
const dailyWinsKey = (profileName) => `pkmn_dailywins_${profileName}_${todayKey()}`;
const caughtTodayKey = (profileName) => `pkmn_caught_${profileName}_${todayKey()}`;

// ══════════════════════════════════════════════════════════════════════
//  COMBAT UTILS
// ══════════════════════════════════════════════════════════════════════
const getEff = (mt,dt) => { let m=1; for(const d of dt) m*=(TYPE_CHART[mt]||{})[d]??1; return m; };
const calcDmg = (atk,move,def,level=50) => {
  const eff=getEff(move.type,def.types), stab=atk.types.includes(move.type)?1.5:1;
  const lvlMult = 1 + (level-50)*0.02;
  const rand=0.85+Math.random()*0.15;
  const d=Math.floor(((((2*level)/5+2)*move.power*(atk.attack/def.defense))/50+2)*stab*eff*rand*lvlMult);
  return {dmg:Math.max(1,d), eff};
};

// Generate room code
const genRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join("");
};

// ══════════════════════════════════════════════════════════════════════
//  AUDIO ENGINE — 6 distinct tracks + SFX
// ══════════════════════════════════════════════════════════════════════
class AudioEngine {
  constructor(){ this.ctx=null; this.master=null; this.tid=null; this.theme=null; this.vol=0.55; this._nodes=[]; }
  _init(){
    if(this.ctx) return;
    this.ctx = new(window.AudioContext||window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.vol;
    this.master.connect(this.ctx.destination);
  }
  _kill(){
    if(this.tid){ clearTimeout(this.tid); this.tid=null; }
    for(const n of this._nodes){ try{ n.stop(); }catch(e){} }
    this._nodes=[];
  }
  _note(f,t,dur,wave="square",v=0.28){
    if(!this.ctx||f<=0) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type=wave; o.frequency.value=f;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(v,t+0.01);
    g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(g); g.connect(this.master);
    try{ o.start(t); o.stop(t+dur+0.05); }catch(e){}
    this._nodes.push(o);
  }
  _drum(f,t,decay=0.15,v=0.4){
    if(!this.ctx) return;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type="sine"; o.frequency.setValueAtTime(f,t);
    o.frequency.exponentialRampToValueAtTime(f*0.08,t+decay);
    g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(0.001,t+decay);
    o.connect(g); g.connect(this.master);
    try{ o.start(t); o.stop(t+decay+0.05); }catch(e){}
    this._nodes.push(o);
  }

  // 1. HOME SCREEN — warm, peaceful overworld town music
  _home(){
    if(this.theme!=="home") return;
    const now=this.ctx.currentTime, b=60/100;
    const mel=[523,1,659,1,784,2,659,1,523,1,440,2,493,1,587,1,698,2,587,1,493,1,440,2];
    const bas=[130,4,165,4,196,4,130,4];
    let t=now;
    for(let i=0;i<mel.length;i+=2){ if(mel[i]) this._note(mel[i],t,b*mel[i+1]*0.8,"triangle",0.18); t+=b*mel[i+1]; }
    bas.forEach((f,i)=>{ this._note(f,now+i*b*4,b*3.8,"sine",0.14); });
    [[261,329,392],[293,369,440]].forEach(([a,bb,c],i)=>{
      [a,bb,c].forEach(f=>this._note(f,now+i*b*8,b*7,"triangle",0.07));
    });
    const dur=mel.reduce((s,v,i)=>i%2===1?s+v:s,0)*b*1000;
    this.tid=setTimeout(()=>this._home(),dur-200);
  }

  // 2. BATTLE — intense fast-paced chiptune, high energy
  _battle(){
    if(this.theme!=="battle") return;
    const now=this.ctx.currentTime, b=60/188;
    const lead=[
      880,.5,1047,.25,880,.25,784,.5,698,.5,784,.5,659,.5,
      587,.5,698,.25,587,.25,523,.5,587,.5,659,.5,784,.5,
      880,.5,1047,.5,1175,.5,1047,.5,880,.5,784,.5,698,.5,659,.5,
      523,.5,659,.5,784,.5,659,.5,587,.5,523,.5,494,.5,523,1,
      988,.25,1047,.25,988,.25,880,.5,784,.5,880,.5,
      698,.25,784,.25,698,.25,659,.5,587,.5,659,.5,
      784,.5,880,.5,784,.5,698,.5,659,.5,784,1
    ];
    let t=now;
    for(let i=0;i<lead.length;i+=2){ this._note(lead[i],t,b*lead[i+1]*0.82,"square",0.22); t+=b*lead[i+1]; }
    // Bass line
    const bassNotes=[130,110,130,98,110,130,98,110];
    bassNotes.forEach((f,i)=>this._note(f,now+i*b*4,b*3.8,"sawtooth",0.14));
    // Drums
    for(let i=0;i<32;i++) this._drum(80,now+i*b*0.5,0.1,0.28);
    for(let i=0;i<16;i++) this._drum(200,now+i*b+b*0.25,0.06,0.18);
    this.tid=setTimeout(()=>this._battle(),(t-now)*1000-200);
  }

  // 3. SELECT/POKEDEX — adventurous exploration, hopeful
  _select(){
    if(this.theme!=="select") return;
    const now=this.ctx.currentTime, b=60/120;
    const mel=[392,.5,440,.5,494,.5,523,.5,587,1,523,.5,494,.5,440,.5,392,1,
               349,.5,392,.5,440,.5,494,.5,523,.5,587,.5,659,1,
               523,.5,587,.5,659,.5,698,.5,784,1.5];
    let t=now;
    for(let i=0;i<mel.length;i+=2){ this._note(mel[i],t,b*mel[i+1]*0.75,"triangle",0.19); t+=b*mel[i+1]; }
    [196,220,247,196].forEach((f,i)=>this._note(f,now+i*b*4,b*3.6,"sine",0.12));
    for(let i=0;i<12;i++) this._drum(5000,now+i*b*0.5,0.04,0.12);
    this.tid=setTimeout(()=>this._select(),(t-now)*1000-200);
  }

  // 4. SHOP — upbeat market jingle, coins clinking vibe
  _shop(){
    if(this.theme!=="shop") return;
    const now=this.ctx.currentTime, b=60/140;
    const mel=[659,.25,698,.25,784,.5,880,.5,784,.25,698,.25,659,.5,
               587,.25,659,.25,698,.5,784,.5,698,.25,659,.25,587,1,
               523,.25,587,.25,659,.5,698,.25,784,.25,880,.5,
               784,.25,698,.25,659,.25,587,.25,523,1.5];
    let t=now;
    for(let i=0;i<mel.length;i+=2){ this._note(mel[i],t,b*mel[i+1]*0.7,"square",0.17); t+=b*mel[i+1]; }
    // Bright harmony
    const harm=[988,0,1047,4,880,8,784,12];
    for(let i=0;i<harm.length;i+=2) this._note(harm[i],now+harm[i+1]*b,b*3.5,"triangle",0.08);
    // Bass pluck
    [130,165,196,220,196,165].forEach((f,i)=>this._note(f,now+i*b*2,b*0.4,"sine",0.18));
    // Light drum
    for(let i=0;i<10;i++) this._drum(4000,now+i*b*0.5,0.03,0.10);
    this.tid=setTimeout(()=>this._shop(),(t-now)*1000-200);
  }

  // 5. TEAM BUILDER — thoughtful, strategic, slower melody
  _team(){
    if(this.theme!=="team") return;
    const now=this.ctx.currentTime, b=60/90;
    const mel=[392,1,440,1,494,1,440,1,392,2,
               349,1,392,1,440,1,392,1,349,2,
               330,1,349,1,392,1,440,1,494,2,
               523,1,494,1,440,1,392,1,330,2];
    let t=now;
    for(let i=0;i<mel.length;i+=2){ this._note(mel[i],t,b*mel[i+1]*0.85,"triangle",0.17); t+=b*mel[i+1]; }
    // Pad chords
    [[196,247,294],[175,220,262],[165,208,247],[196,247,294]].forEach(([a,bb,c],i)=>{
      [a,bb,c].forEach(f=>this._note(f,now+i*b*4,b*3.8,"sine",0.07));
    });
    const dur=mel.reduce((s,v,i)=>i%2===1?s+v:s,0)*b*1000;
    this.tid=setTimeout(()=>this._team(),dur-200);
  }

  // 6. HEAL CENTER — gentle, soft, restorative chimes
  _heal(){
    if(this.theme!=="heal") return;
    const now=this.ctx.currentTime, b=60/75;
    const mel=[523,1,587,1,659,2,587,1,523,1,494,2,
               440,1,494,1,523,1,587,1,523,2,494,2,
               523,1,659,1,784,2,698,1,659,1,587,4];
    let t=now;
    for(let i=0;i<mel.length;i+=2){ this._note(mel[i],t,b*mel[i+1]*0.9,"sine",0.16); t+=b*mel[i+1]; }
    // Soft bell harmony
    [1047,0,1175,4,1319,8,1047,12].forEach((f,i,arr)=>{ if(i%2===0) this._note(arr[i],now+arr[i+1]*b,b*3.5,"triangle",0.07); });
    const dur=mel.reduce((s,v,i)=>i%2===1?s+v:s,0)*b*1000;
    this.tid=setTimeout(()=>this._heal(),dur-200);
  }

  _playTheme(name, fn){
    this._init();
    if(this.theme===name) return;
    this._kill(); this.theme=name;
    fn();
  }
  play(name){
    if(name==="home") this._playTheme("home",()=>this._home());
    else if(name==="battle") this._playTheme("battle",()=>this._battle());
    else if(name==="select") this._playTheme("select",()=>this._select());
    else if(name==="shop") this._playTheme("shop",()=>this._shop());
    else if(name==="team") this._playTheme("team",()=>this._team());
    else if(name==="heal") this._playTheme("heal",()=>this._heal());
    else if(name==="victory"){ this._kill(); this.theme="victory"; this._doVictory(); }
    else if(name==="defeat"){ this._kill(); this.theme="defeat"; this._doDefeat(); }
  }
  _doVictory(){
    const now=this.ctx.currentTime, b=60/138;
    [523,659,784,1047,988,880,784,659,784,880,1047,1175,1319,1568].forEach((f,i)=>this._note(f,now+i*b*0.5,b*0.45,"triangle",0.22));
    // Harmony
    [659,784,1047,1319].forEach((f,i)=>this._note(f,now+i*b*1.5,b*1.2,"sine",0.1));
  }
  _doDefeat(){
    const now=this.ctx.currentTime, b=60/68;
    [392,370,349,330,311,294,277,262,247].forEach((f,i)=>this._note(f,now+i*b,b*0.9,"sine",0.18));
    [196,175,165,155].forEach((f,i)=>this._note(f,now+i*b*2,b*1.8,"sawtooth",0.08));
  }
  // SFX
  sfx(name){
    this._init();
    const now=this.ctx.currentTime;
    if(name==="hit"){ this._note(220,now,0.06,"square",0.35); this._note(170,now+0.06,0.08,"square",0.25); }
    else if(name==="super"){ [500,700,900,1100].forEach((f,i)=>this._note(f,now+i*0.05,0.06,"square",0.3)); }
    else if(name==="heal_chime"){ [523,659,784,1047,1319].forEach((f,i)=>this._note(f,now+i*0.1,0.12,"triangle",0.25)); }
    else if(name==="catch_shake"){ this._note(300,now,0.04,"square",0.25); this._note(250,now+0.08,0.04,"square",0.2); this._note(200,now+0.16,0.04,"square",0.15); }
    else if(name==="coin"){ this._note(880,now,0.06,"triangle",0.3); this._note(1047,now+0.07,0.08,"triangle",0.28); }
    else if(name==="mega_sfx"){ [440,554,659,880,1047,1319].forEach((f,i)=>this._note(f,now+i*0.08,0.12,"square",0.28)); }
    else if(name==="giga_sfx"){ [220,277,330,440,554,659,880].forEach((f,i)=>this._note(f,now+i*0.06,0.18,"sawtooth",0.24)); }
    else if(name==="zmove_sfx"){ [330,440,554,659,880,1100,1320].forEach((f,i)=>this._note(f,now+i*0.07,0.15,"square",0.3)); }
    else if(name==="faint"){ [300,220,150,80].forEach((f,i)=>this._note(f,now+i*0.15,0.2,"sawtooth",0.28)); }
    else if(name==="select_blip"){ this._note(700,now,0.05,"square",0.3); this._note(880,now+0.06,0.07,"square",0.28); }
  }
  stop(){ this._kill(); this.theme=null; }
}
const AUDIO = new AudioEngine();

// ══════════════════════════════════════════════════════════════════════
//  ATTACK ANIMATION — unique per type, pixel art style
// ══════════════════════════════════════════════════════════════════════
function AttackAnimation({type,fromPlayer,onDone,isZMove,isMega,isGiga}){
  const canvasRef=useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const W=600, H=220;
    canvas.width=W; canvas.height=H;
    const ctx=canvas.getContext("2d");
    const col=TC[type]||"#fff";
    const [R,G,B]=col.match(/\w\w/g).map(h=>parseInt(h,16));
    const PX=isZMove?11:isGiga?10:isMega?9:6;
    const totalFrames=isZMove?88:isGiga?80:isMega?72:55;
    const srcX=fromPlayer?W*0.18:W*0.78, srcY=H*0.6;
    const dstX=fromPlayer?W*0.78:W*0.18, dstY=H*0.45;
    const lerp=(a,b,t)=>a+(b-a)*t;
    const ease=t=>t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

    // Helper: draw pixel-art square
    const px=(x,y,w,h,r,g,b,a)=>{ if(a<=0.01) return; ctx.fillStyle=`rgba(${r},${g},${b},${Math.min(1,a)})`; ctx.fillRect(Math.round(x),Math.round(y),w,h); };

    // Build type-specific animation function
    function buildAnim(){
      // FIRE — rolling fireballs with trails and sparks
      if(type==="fire"){
        const balls=Array.from({length:isZMove?8:isGiga?6:4},(_,i)=>({delay:i*4,trail:[]}));
        return (f)=>{
          balls.forEach(ball=>{
            const ef=f-ball.delay; if(ef<0) return;
            const t=ease(Math.min(1,ef/38));
            const x=lerp(srcX,dstX,t), y=lerp(srcY,dstY,t)+Math.sin(t*Math.PI)*-15;
            ball.trail.push({x,y,a:1}); if(ball.trail.length>10) ball.trail.shift();
            // Trail
            ball.trail.forEach((p,i)=>{ const a=(i/ball.trail.length)*0.7; px(p.x-PX/2,p.y-PX/2,PX,PX,255,140,20,a); p.a-=0.08; });
            // Core fireball
            const sz=PX*(1.8-t*0.4);
            px(x-sz,y-sz,sz*2,sz*2,255,80,10,0.95);
            px(x-sz*0.7,y-sz*0.7,sz*1.4,sz*1.4,255,180,50,0.9);
            px(x-sz*0.3,y-sz*0.3,sz*0.6,sz*0.6,255,240,200,0.85);
            // Sparks
            if(f%3===0) for(let s=0;s<4;s++){const a=(s/4)*Math.PI*2;px(x+Math.cos(a)*PX*2,y+Math.sin(a)*PX*2,PX*0.8,PX*0.8,255,200,50,0.7);}
          });
        };
      }
      // WATER — arcing water wave with bubbles
      if(type==="water"){
        const drops=Array.from({length:isZMove?14:6},(_,i)=>({delay:i*3,oy:(i-3)*12}));
        return (f)=>{
          drops.forEach(d=>{
            const ef=f-d.delay; if(ef<0) return;
            const t=ease(Math.min(1,ef/34));
            const x=lerp(srcX,dstX,t), y=lerp(srcY,dstY,t)+d.oy*(1-t)+Math.sin(t*Math.PI)*-20;
            // Teardrop
            px(x-PX/2,y-PX,PX,PX*1.5,R,G,B,0.92);
            px(x-PX*0.8,y-PX*0.3,PX*1.6,PX,170,230,255,0.85);
            px(x-PX*0.3,y-PX*1.2,PX*0.6,PX*0.6,220,245,255,0.8);
            // Ripples on hit
            if(t>0.9){ const r2=(t-0.9)*10*PX; for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;px(dstX+Math.cos(a)*r2-PX/2,dstY+Math.sin(a)*r2-PX/2,PX,PX,R,G,B,(1-t)*5);} }
          });
        };
      }
      // GRASS — spinning leaf cluster
      if(type==="grass"){
        const leaves=Array.from({length:isZMove?12:6},(_,i)=>({delay:i*2,angle:i*(Math.PI*2/6)}));
        return (f)=>{
          const t=ease(Math.min(1,f/42));
          const cx=lerp(srcX,dstX,t), cy=lerp(srcY,dstY,t);
          leaves.forEach(leaf=>{
            const ef=f-leaf.delay; if(ef<0) return;
            const spin=leaf.angle+ef*0.18;
            const r2=PX*(2+Math.sin(ef*0.2)*0.5);
            const lx=cx+Math.cos(spin)*r2*3, ly=cy+Math.sin(spin)*r2*1.8;
            // Leaf shape
            px(lx-PX,ly-PX/2,PX*2,PX,R,G,B,0.9);
            px(lx-PX/2,ly-PX,PX,PX*2,R,G,B,0.9);
            px(lx-PX*0.4,ly-PX*0.4,PX*0.8,PX*0.8,200,255,180,0.7);
          });
        };
      }
      // ELECTRIC — zigzag lightning bolt
      if(type==="electric"){
        const segs=14;
        let path=[]; for(let i=0;i<=segs;i++){ const t2=i/segs; path.push({x:lerp(srcX,dstX,t2)+(i>0&&i<segs?(Math.random()-0.5)*45:0), y:lerp(srcY,dstY,t2)+(i>0&&i<segs?(Math.random()-0.5)*35:0)}); }
        path[0]={x:srcX,y:srcY}; path[segs]={x:dstX,y:dstY};
        return (f)=>{
          const reveal=Math.min(1,f/(totalFrames*0.55)), vs=Math.floor(reveal*segs), fl=(f%4<3)?1:0.4;
          for(let i=0;i<vs;i++){
            const p=path[i],q=path[i+1];
            for(let s=0;s<=16;s++){ const tt=s/16, lx=lerp(p.x,q.x,tt), ly=lerp(p.y,q.y,tt);
              px(lx-PX/2,ly-PX/2,PX,PX,255,255,120,fl*0.95);
              px(lx-PX,ly-PX,PX*2,PX*2,R,G,B,fl*0.3);
            }
          }
          // Spark at tip
          if(vs>0&&vs<=segs){ const p=path[vs-1];
            for(let s=0;s<8;s++){const a=(s/8)*Math.PI*2;px(p.x+Math.cos(a)*PX*1.5-PX/2,p.y+Math.sin(a)*PX*1.5-PX/2,PX,PX,255,255,200,0.9);}
          }
        };
      }
      // ICE — crystalline shards flying
      if(type==="ice"){
        const shards=Array.from({length:isZMove?10:5},(_,i)=>({delay:i*2,oy:(i-2)*14,angle:i*0.4}));
        return (f)=>{
          shards.forEach(s=>{
            const ef=f-s.delay; if(ef<0) return;
            const t=ease(Math.min(1,ef/34));
            const x=lerp(srcX,dstX,t), y=lerp(srcY,dstY,t)+s.oy*(1-t);
            const rot=s.angle+ef*0.1;
            // Crystal cross
            px(x-PX*1.6,y-PX/3,PX*3.2,PX*0.7,160,230,255,0.95);
            px(x-PX/3,y-PX*1.6,PX*0.7,PX*3.2,160,230,255,0.95);
            px(x-PX*1,y-PX*1,PX*0.6,PX*0.6,220,245,255,0.85);
            px(x+PX*0.4,y-PX*1,PX*0.6,PX*0.6,220,245,255,0.85);
            px(x-PX*1,y+PX*0.4,PX*0.6,PX*0.6,220,245,255,0.85);
            px(x+PX*0.4,y+PX*0.4,PX*0.6,PX*0.6,220,245,255,0.85);
          });
        };
      }
      // PSYCHIC — expanding ripple rings with orb
      if(type==="psychic"){
        const rings=[{start:0},{start:8},{start:16},{start:24}];
        return (f)=>{
          // Traveling orb
          const t=ease(Math.min(1,f/(totalFrames*0.6)));
          const cx=lerp(srcX,dstX,t), cy=lerp(srcY,dstY,t);
          const wobble=Math.sin(f*0.5)*5;
          px(cx-PX*1.2+wobble/2,cy-PX*1.2,PX*2.4,PX*2.4,R,G,B,0.9);
          px(cx-PX*0.7,cy-PX*0.7,PX*1.4,PX*1.4,255,180,255,0.85);
          px(cx-PX*0.3,cy-PX*0.3,PX*0.6,PX*0.6,255,240,255,1);
          // Trail
          for(let tr=1;tr<=4;tr++){const tt=Math.max(0,t-tr*0.05);const tx=lerp(srcX,dstX,tt),ty=lerp(srcY,dstY,tt);px(tx-PX/2,ty-PX/2,PX,PX,R,G,B,0.4-tr*0.08);}
          // Rings at destination
          rings.forEach(ring=>{
            const ef=f-ring.start; if(ef<0) return;
            const rad=ef*5, alpha=Math.max(0,1-ef/28)*0.85;
            for(let i=0;i<24;i++){const a=(i/24)*Math.PI*2;px(dstX+Math.cos(a)*rad-PX/2,dstY+Math.sin(a)*rad*0.65-PX/2,PX,PX,R,G,B,alpha);}
          });
        };
      }
      // GHOST — shadowy orb with phantom wisps
      if(type==="ghost"){
        return (f)=>{
          const t=ease(Math.min(1,f/(totalFrames*0.6)));
          const cx=lerp(srcX,dstX,t), cy=lerp(srcY,dstY,t);
          const wobble=Math.sin(f*0.4)*7;
          // Wisps
          for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2+f*0.1;const r2=PX*2.5+Math.sin(f*0.3+i)*3;px(cx+Math.cos(a)*r2-PX/2,cy+Math.sin(a)*r2*0.7-PX/2,PX,PX,R,G,B,0.65);}
          // Core
          px(cx-PX*1.2+wobble/2,cy-PX*1.2,PX*2.4,PX*2.4,80,50,120,0.9);
          px(cx-PX*0.9,cy-PX*0.9,PX*1.8,PX*1.8,R,G,B,0.85);
          px(cx-PX*0.4,cy-PX*0.4,PX*0.8,PX*0.8,200,170,255,0.9);
          // Trail
          for(let tr=1;tr<=5;tr++){const tt=Math.max(0,t-tr*0.06);const tx=lerp(srcX,dstX,tt),ty=lerp(srcY,dstY,tt);px(tx-PX/2,ty-PX/2,PX,PX,R,G,B,0.45-tr*0.08);}
        };
      }
      // DRAGON — powerful energy beam
      if(type==="dragon"){
        return (f)=>{
          const reveal=Math.min(1,f/(totalFrames*0.55));
          const steps=Math.floor(reveal*22);
          for(let i=0;i<steps;i++){
            const t=i/22;
            const bx=lerp(srcX,dstX,t), by=lerp(srcY,dstY,t);
            const w=PX*(2.8-t*0.7);
            px(bx-w,by-w/3,w*2,w*0.7,100,50,200,0.9-t*0.2);
            px(bx-w/2,by-w/4,w,w/2,R,G,B,0.85-t*0.2);
            px(bx-w*0.3,by-w*0.15,w*0.6,w*0.3,210,180,255,0.8-t*0.2);
          }
          // Dragon energy burst at end
          if(reveal>0.85){ const ef=(reveal-0.85)/0.15;
            for(let i=0;i<16;i++){const a=(i/16)*Math.PI*2;const r2=ef*PX*5;px(dstX+Math.cos(a)*r2-PX/2,dstY+Math.sin(a)*r2-PX/2,PX,PX,R,G,B,ef*0.9);}
          }
        };
      }
      // FIGHTING — rushing fist + shockwave
      if(type==="fighting"){
        return (f)=>{
          const t=ease(Math.min(1,f/(totalFrames*0.45)));
          if(t<1){
            const sx=lerp(srcX,dstX,t), sy=lerp(srcY,dstY,t);
            // Fist rush streaks
            for(let i=0;i<5;i++){const off=(i-2)*PX*1.3;px(lerp(srcX,sx,0.3),sy+off,sx-lerp(srcX,sx,0.3),PX*0.7,R,G,B,0.5*(1-i*0.12));}
            px(sx-PX*1.2,sy-PX*1.2,PX*2.4,PX*2.4,255,180,150,0.95);
            px(sx-PX*0.7,sy-PX*0.7,PX*1.4,PX*1.4,255,220,200,0.9);
          }
          if(f>totalFrames*0.4){
            const ef=f-totalFrames*0.4;
            [0,7,14].forEach(d=>{
              const wf=ef-d; if(wf<0) return;
              const r2=wf*4.5, al=Math.max(0,1-wf/22)*0.9;
              for(let i=0;i<14;i++){const a=(i/14)*Math.PI*2;px(dstX+Math.cos(a)*r2-PX/2,dstY+Math.sin(a)*r2*0.7-PX/2,PX,PX,R,G,B,al);}
            });
          }
        };
      }
      // DARK — slash marks
      if(type==="dark"){
        const slashes=[{dx:-22,dy:-16,delay:0},{dx:2,dy:0,delay:7},{dx:22,dy:16,delay:14}];
        return (f)=>{
          const t=ease(Math.min(1,f/(totalFrames*0.55)));
          if(t<1){const sx=lerp(srcX,dstX,t),sy=lerp(srcY,dstY,t);px(sx-PX,sy-PX,PX*2,PX*2,R,G,B,0.85);}
          slashes.forEach(sl=>{
            const ef=f-sl.delay; if(ef<0) return;
            const alpha=Math.max(0,1-ef/20)*0.95;
            for(let i=0;i<10;i++){const tt=i/9;px(dstX+sl.dx-PX*2+tt*PX*4,dstY+sl.dy-PX*2+tt*PX*4,PX,PX,R,G,B,alpha);}
          });
        };
      }
      // POISON — toxic bubbles
      if(type==="poison"){
        const bubbles=Array.from({length:7},(_,i)=>({delay:i*3,oy:(i-3)*13}));
        return (f)=>{
          bubbles.forEach(b=>{
            const ef=f-b.delay; if(ef<0) return;
            const t=ease(Math.min(1,ef/32));
            const x=lerp(srcX,dstX,t), y=lerp(srcY,dstY,t)+b.oy*(1-t);
            for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;px(x+Math.cos(a)*PX*1.5-PX/2,y+Math.sin(a)*PX*1.5-PX/2,PX,PX,R,G,B,0.85);}
            px(x-PX*0.8,y-PX*0.8,PX,PX,255,220,255,0.6);
            px(x-PX*0.3,y-PX*0.3,PX*0.5,PX*0.5,255,240,255,0.5);
          });
        };
      }
      // GROUND — boulders + dust
      if(type==="ground"){
        const rocks=Array.from({length:5},(_,i)=>({delay:i*3,oy:(i-2)*16,sz:PX*(1.3+i*0.25)}));
        return (f)=>{
          // Ground shockwave
          if(f>totalFrames*0.3){const ef=f-totalFrames*0.3;for(let i=0;i<6;i++){const a=(i/6)*Math.PI;px(dstX+Math.cos(a)*ef*2-PX/2,dstY+Math.sin(a)*ef*0.5+PX-PX/2,PX,PX,R,G,B,Math.max(0,1-ef/30)*0.7);}}
          rocks.forEach(r=>{
            const ef=f-r.delay; if(ef<0) return;
            const t=ease(Math.min(1,ef/36));
            const x=lerp(srcX,dstX,t), y=lerp(srcY,dstY,t)+r.oy*(1-t)*0.6;
            px(x-r.sz/2,y-r.sz/2,r.sz,r.sz,R,G,B,0.92);
            px(x-r.sz*0.35,y-r.sz*0.35,r.sz*0.5,r.sz*0.5,200,175,145,0.5);
            // Dust trail
            for(let tr=1;tr<=3;tr++){const tt=Math.max(0,t-tr*0.08);const tx=lerp(srcX,dstX,tt),ty=lerp(srcY,dstY,tt);px(tx-PX/2,ty-PX/2,PX,PX,R,G,B,0.3-tr*0.08);}
          });
        };
      }
      // ROCK — stone projectile
      if(type==="rock"){
        const stones=Array.from({length:4},(_,i)=>({delay:i*4,oy:(i-1.5)*18}));
        return (f)=>{
          stones.forEach(s=>{
            const ef=f-s.delay; if(ef<0) return;
            const t=ease(Math.min(1,ef/34));
            const x=lerp(srcX,dstX,t), y=lerp(srcY,dstY,t)+s.oy*(1-t);
            const sz=PX*1.6;
            px(x-sz/2,y-sz/2,sz,sz,R,G,B,0.92);
            px(x-sz*0.3,y-sz*0.3,sz*0.5,sz*0.5,190,165,140,0.6);
            // Chip fragments
            if(f%5===0) for(let i=0;i<3;i++){px(x+(Math.random()-0.5)*PX*3,y+(Math.random()-0.5)*PX*3,PX*0.7,PX*0.7,R,G,B,0.5);}
          });
        };
      }
      // BUG — spinning energy burst
      if(type==="bug"){
        const t0=ease(Math.min(1,f/(totalFrames*0.6)));
        return (f)=>{
          const t=ease(Math.min(1,f/(totalFrames*0.6)));
          const cx=lerp(srcX,dstX,t), cy=lerp(srcY,dstY,t);
          for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2+f*0.18;const r2=PX*2.2+Math.sin(f*0.3+i)*2;px(cx+Math.cos(a)*r2-PX/2,cy+Math.sin(a)*r2*0.8-PX/2,PX,PX,R,G,B,0.88);}
          px(cx-PX*0.8,cy-PX*0.8,PX*1.6,PX*1.6,220,240,100,0.9);
          px(cx-PX*0.4,cy-PX*0.4,PX*0.8,PX*0.8,255,255,200,0.85);
        };
      }
      // FLYING — wind arcs sweeping across
      if(type==="flying"){
        const arcs=Array.from({length:4},(_,i)=>({delay:i*5,oy:(i-1.5)*20}));
        return (f)=>{
          arcs.forEach(arc=>{
            const ef=f-arc.delay; if(ef<0) return;
            const t=ease(Math.min(1,ef/32));
            const progX=lerp(srcX,dstX,t), progY=lerp(srcY,dstY,t)+arc.oy;
            const arcW=Math.min(ef*8,W*0.5);
            for(let s=0;s<12;s++){const p=s/11;px(progX+Math.cos(p*Math.PI*0.6-0.3)*arcW-PX/2,progY+Math.sin(p*Math.PI*0.6-0.3)*PX*2-PX/2,PX,PX,R,G,B,0.85*(1-p*0.3));}
          });
        };
      }
      // STEEL — metallic shards beam
      if(type==="steel"){
        return (f)=>{
          const t=Math.min(1,f/(totalFrames*0.6));
          const steps=Math.floor(t*18);
          for(let i=0;i<steps;i++){
            const tt=i/18, bx=lerp(srcX,dstX,tt), by=lerp(srcY,dstY,tt), sz=PX*(1.8-tt*0.5);
            px(bx-sz,by-sz/3,sz*2,sz*0.7,R,G,B,0.92-tt*0.25);
            px(bx-sz/2,by-sz/4,sz,sz/2,230,240,250,0.4-tt*0.2);
          }
        };
      }
      // FAIRY — sparkling stars
      if(type==="fairy"){
        const stars=Array.from({length:isZMove?16:8},(_,i)=>({delay:i*2,ox:(Math.random()-0.5)*14,oy:(Math.random()-0.5)*28}));
        return (f)=>{
          stars.forEach(s=>{
            const ef=f-s.delay; if(ef<0) return;
            const t=ease(Math.min(1,ef/30));
            const x=lerp(srcX,dstX,t)+s.ox*(1-t), y=lerp(srcY,dstY,t)+s.oy*(1-t);
            const sz=PX*(1.3+Math.sin(ef*0.5)*0.3);
            // Star shape
            px(x-sz*1.8,y-sz/3,sz*3.6,sz*0.7,R,G,B,0.88);
            px(x-sz/3,y-sz*1.8,sz*0.7,sz*3.6,R,G,B,0.88);
            px(x-sz/2,y-sz/2,sz,sz,255,240,255,0.95);
          });
        };
      }
      // NORMAL — fast solid projectile
      if(type==="normal"){
        return (f)=>{
          const t=ease(Math.min(1,f/(totalFrames*0.55)));
          const x=lerp(srcX,dstX,t), y=lerp(srcY,dstY,t);
          const sz=PX*2;
          px(x-sz,y-sz/2,sz*2,sz,R,G,B,0.92);
          px(x-sz*0.6,y-sz*0.4,sz*1.2,sz*0.8,240,240,240,0.7);
          for(let tr=1;tr<=5;tr++){const tt=Math.max(0,t-tr*0.07);const tx=lerp(srcX,dstX,tt),ty=lerp(srcY,dstY,tt);px(tx-PX/2,ty-PX/2,PX,PX,R,G,B,0.45-tr*0.07);}
        };
      }
      // Default fallback
      return (f)=>{
        const t=ease(Math.min(1,f/(totalFrames*0.6)));
        const x=lerp(srcX,dstX,t), y=lerp(srcY,dstY,t);
        px(x-PX,y-PX,PX*2,PX*2,R,G,B,0.9);
        px(x-PX/2,y-PX/2,PX,PX,255,255,255,0.8);
      };
    }

    const drawFrame=buildAnim();
    let frame=0, raf;
    function draw(){
      ctx.clearRect(0,0,W,H);
      // Special screen flashes for Z-move, Giga, Mega
      if(isZMove&&frame<14){ ctx.fillStyle=`rgba(${R},${G},${B},${(0.55-frame*0.04).toFixed(2)})`; ctx.fillRect(0,0,W,H); }
      if(isGiga&&frame<12){ ctx.fillStyle=`rgba(255,213,79,${(0.45-frame*0.038).toFixed(2)})`; ctx.fillRect(0,0,W,H); }
      if(isMega&&frame<10){ ctx.fillStyle=`rgba(124,77,255,${(0.38-frame*0.038).toFixed(2)})`; ctx.fillRect(0,0,W,H); }
      drawFrame(frame);
      // Impact flash
      const impF=Math.floor(totalFrames*0.62);
      if(frame>=impF&&frame<impF+10){ ctx.fillStyle=`rgba(${R},${G},${B},${((1-(frame-impF)/10)*0.3).toFixed(2)})`; ctx.fillRect(0,0,W,H); }
      if(frame===impF){
        const cnt=isZMove?28:isGiga?22:16;
        for(let i=0;i<cnt;i++){const a=(i/cnt)*Math.PI*2;const r2=PX*(1+Math.random()*4);px(dstX+Math.cos(a)*r2-PX/2,dstY+Math.sin(a)*r2*0.7-PX/2,PX,PX,R,G,B,0.95);}
        ctx.fillStyle=`rgba(255,255,255,0.88)`; ctx.fillRect(dstX-PX/2,dstY-PX/2,PX,PX);
      }
      frame++;
      if(frame<totalFrames+10) raf=requestAnimationFrame(draw);
      else { onDone&&onDone(); }
    }
    raf=requestAnimationFrame(draw);
    return ()=>{ cancelAnimationFrame(raf); };
  },[]);
  return <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:10}}/>;
}

// ── Weather Particle Canvas ───────────────────────────────────────────
function WeatherCanvas({weather}){
  const canvasRef=useRef(null);
  useEffect(()=>{
    if(!weather||weather.id==="clear") return;
    const canvas=canvasRef.current; if(!canvas) return;
    const W=canvas.offsetWidth||600, H=canvas.offsetHeight||200;
    canvas.width=W; canvas.height=H;
    const ctx=canvas.getContext("2d");
    const col=TC[weather.typeBoost]||"#aaa";
    const particles=[];
    const COUNT=weather.id==="sand"?60:weather.id==="thunder"?12:weather.id==="fog"?20:40;
    for(let i=0;i<COUNT;i++){
      if(weather.id==="rain"||weather.id==="hail"){
        particles.push({x:Math.random()*W,y:Math.random()*H,vy:weather.id==="hail"?3.5:5,vx:weather.id==="rain"?-1.5:0,len:weather.id==="hail"?4:12});
      } else if(weather.id==="sand"){
        particles.push({x:Math.random()*W,y:Math.random()*H,vx:3+Math.random()*2,vy:(Math.random()-0.5)*0.5,r:1+Math.random()*3});
      } else if(weather.id==="sun"){
        particles.push({x:Math.random()*W,y:Math.random()*H,a:Math.random()*Math.PI*2,r:30+Math.random()*40,rot:0.01*(Math.random()>0.5?1:-1),size:1+Math.random()*2});
      } else if(weather.id==="fog"){
        particles.push({x:Math.random()*W,y:Math.random()*H,vx:0.5,r:30+Math.random()*50,a:Math.random()*0.06+0.02});
      } else if(weather.id==="thunder"){
        particles.push({x:Math.random()*W,y:0,flash:false,timer:Math.random()*80});
      }
    }
    let frame=0,raf;
    function draw(){
      ctx.clearRect(0,0,W,H);
      frame++;
      if(weather.id==="rain"){
        ctx.strokeStyle="rgba(79,195,247,0.45)"; ctx.lineWidth=1.5;
        particles.forEach(p=>{ ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+p.vx*3,p.y+p.len); ctx.stroke(); p.x+=p.vx; p.y+=p.vy; if(p.y>H){p.y=0;p.x=Math.random()*W;} });
      } else if(weather.id==="hail"){
        ctx.fillStyle="rgba(128,222,234,0.65)";
        particles.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,p.len/2,0,Math.PI*2); ctx.fill(); p.y+=p.vy; p.x+=p.vx; if(p.y>H){p.y=0;p.x=Math.random()*W;} });
      } else if(weather.id==="sand"){
        particles.forEach(p=>{ ctx.fillStyle=`rgba(255,204,128,${0.3+Math.random()*0.25})`; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); p.x+=p.vx; p.y+=p.vy; if(p.x>W){p.x=0;p.y=Math.random()*H;} });
      } else if(weather.id==="sun"){
        particles.forEach(p=>{ p.a+=p.rot; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.fillStyle=`rgba(255,213,79,0.15)`; ctx.beginPath(); for(let i=0;i<8;i++){const a2=(i/8)*Math.PI*2;ctx.lineTo(Math.cos(a2)*p.r,Math.sin(a2)*p.r);} ctx.fill(); ctx.restore(); });
      } else if(weather.id==="fog"){
        particles.forEach(p=>{ ctx.fillStyle=`rgba(200,200,200,${p.a})`; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); p.x+=p.vx; if(p.x>W+p.r) p.x=-p.r; });
      } else if(weather.id==="thunder"){
        particles.forEach(p=>{
          p.timer--; if(p.timer<=0){ p.flash=true; p.timer=60+Math.random()*120; p.x=Math.random()*W; }
          if(p.flash){ ctx.strokeStyle="rgba(255,213,79,0.9)"; ctx.lineWidth=2; ctx.beginPath(); let cy=0; ctx.moveTo(p.x,0); while(cy<H){ cy+=20+Math.random()*20; ctx.lineTo(p.x+(Math.random()-0.5)*30,cy); } ctx.stroke(); p.flash=false; }
        });
      }
      raf=requestAnimationFrame(draw);
    }
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
  },[weather]);
  if(!weather||weather.id==="clear") return null;
  return <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:5,opacity:0.55}}/>;
}

// ── Status Badge ──────────────────────────────────────────────────────
function StatusBadge({status}){
  if(!status) return null;
  const s=STATUSES[status.type]; if(!s) return null;
  return <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:"9px",color:s.color,background:`${s.color}20`,border:`1px solid ${s.color}50`,borderRadius:5,padding:"2px 6px",marginLeft:5,animation:"pulse 1s infinite"}}>{s.icon}{s.name}</span>;
}

// ── Weather Banner ────────────────────────────────────────────────────
function WeatherBanner({weather}){
  if(!weather||weather.id==="clear") return null;
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(0,0,0,0.5)",border:`1px solid rgba(255,255,255,0.08)`,borderRadius:8,padding:"5px 10px",marginBottom:8}}>
      <span style={{fontSize:"16px"}}>{weather.icon}</span>
      <div>
        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#FFD54F"}}>{weather.name}</div>
        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:"#444"}}>{weather.desc}</div>
      </div>
    </div>
  );
}

// ── Streak Banner ─────────────────────────────────────────────────────
function StreakBanner({streak}){
  return(
    <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:500,textAlign:"center",animation:"slideIn 0.3s ease",pointerEvents:"none"}}>
      <div style={{background:"linear-gradient(135deg,rgba(255,107,53,0.95),rgba(255,213,79,0.95))",borderRadius:16,padding:"20px 36px",boxShadow:"0 0 80px rgba(255,107,53,0.6)"}}>
        <div style={{fontSize:"36px",marginBottom:6}}>🔥</div>
        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"16px",color:"#fff",marginBottom:4}}>WIN STREAK!</div>
        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"12px",color:"#fff"}}>{streak} IN A ROW!</div>
        {streak>=3&&<div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"9px",color:"#fff",marginTop:6}}>💰 COIN BONUS ×{streak>=5?3:2}!</div>}
      </div>
    </div>
  );
}

// ── Type Matchup Preview ──────────────────────────────────────────────
function MatchupPreview({move, enemyTypes}){
  if(!move||!enemyTypes) return null;
  const eff=(() => { let m=1; for(const d of enemyTypes) m*=(TYPE_CHART[move.type]||{})[d]??1; return m; })();
  const stab=false; // shown separately
  const label=eff>=2?"SUPER EFFECTIVE!":eff===1.5?"Effective":eff===0?"No Effect":eff<1?"Not Very Effective":"Normal";
  const col=eff>=2?"#4CAF50":eff===0?"#555":eff<1?"#f44336":"#888";
  return(
    <div style={{position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",background:"rgba(4,4,14,0.97)",border:`1px solid ${col}55`,borderRadius:8,padding:"5px 10px",whiteSpace:"nowrap",zIndex:50,marginBottom:4,pointerEvents:"none"}}>
      <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:col}}>{eff>=2?"💥":eff===0?"❌":eff<1?"😶":"→"} {label}</div>
      <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:"#333",marginTop:2}}>×{eff} dmg</div>
    </div>
  );
}


function MegaEvolutionAnim({onDone, isGiga}){
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return;
    canvas.width=canvas.offsetWidth||300; canvas.height=canvas.offsetHeight||200;
    const W=canvas.width, H=canvas.height, ctx=canvas.getContext("2d");
    let t=0, raf;
    const colors=isGiga
      ? ["#FFD54F","#FF6B35","#FF8A80","#fff","#FFD54F","#FF6B35"]
      : ["#7C4DFF","#F06292","#4FC3F7","#FFD54F","#FF6B35","#fff"];

    function draw(){
      ctx.clearRect(0,0,W,H);
      const phase=t/100;

      // Background flash
      if(phase<0.3){
        const alpha=Math.sin(phase/0.3*Math.PI);
        ctx.fillStyle=isGiga?`rgba(255,213,79,${(alpha*0.7).toFixed(2)})`:`rgba(124,77,255,${(alpha*0.6).toFixed(2)})`;
        ctx.fillRect(0,0,W,H);
      }

      // Spinning energy rings
      for(let r=0;r<3;r++){
        const rad=40+r*25+Math.sin(t*0.08+r)*10;
        const angleOff=(r/3)*Math.PI*2+t*0.12*(r%2===0?1:-1);
        for(let i=0;i<12;i++){
          const a=angleOff+(i/12)*Math.PI*2;
          const x=W/2+Math.cos(a)*rad, y=H/2+Math.sin(a)*rad*0.65;
          const c=colors[(i+r)%colors.length];
          ctx.fillStyle=c;
          const sz=6+Math.sin(t*0.15+i)*3;
          ctx.fillRect(x-sz/2,y-sz/2,sz,sz);
          ctx.fillStyle="rgba(255,255,255,0.5)";
          ctx.fillRect(x-sz/4,y-sz/4,sz/2,sz/2);
        }
      }

      // Particle burst
      for(let i=0;i<20;i++){
        const a=(i/20)*Math.PI*2+t*0.06;
        const rad2=(50+t*2)*Math.min(1,phase*3);
        const x=W/2+Math.cos(a)*rad2, y=H/2+Math.sin(a)*rad2*0.6;
        const alpha=Math.max(0,1-phase*2);
        ctx.fillStyle=`rgba(255,255,255,${(alpha*0.8).toFixed(2)})`;
        ctx.fillRect(x-3,y-3,6,6);
      }

      // Center glow
      const glowR=20+Math.sin(t*0.2)*8;
      const grd=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,glowR*3);
      grd.addColorStop(0,isGiga?"rgba(255,213,79,0.9)":"rgba(124,77,255,0.9)");
      grd.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(W/2,H/2,glowR*3,0,Math.PI*2); ctx.fill();

      // Text
      if(phase>0.35){
        const textAlpha=Math.min(1,(phase-0.35)*4);
        ctx.save();
        ctx.shadowBlur=20; ctx.shadowColor=isGiga?"#FFD54F":"#7C4DFF";
        ctx.fillStyle=`rgba(255,255,255,${textAlpha.toFixed(2)})`;
        ctx.font=`bold ${Math.round(12+Math.sin(t*0.1)*2)}px 'Press Start 2P',monospace`;
        ctx.textAlign="center";
        ctx.fillText(isGiga?"GIGANTAMAX!":"MEGA EVOLVED!",W/2,H/2+5);
        ctx.restore();
      }

      t++;
      if(t>100){ onDone(); return; }
      raf=requestAnimationFrame(draw);
    }
    raf=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(raf);
  },[]);
  return(
    <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:20}}/>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  UI COMPONENTS
// ══════════════════════════════════════════════════════════════════════
function Badge({type, small}){
  const fs=small?"clamp(8px,1.4vw,10px)":"clamp(9px,1.6vw,12px)";
  return <span style={{background:TC[type]||"#888",color:"#fff",fontSize:fs,padding:"2px 7px",borderRadius:10,textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:700,fontFamily:"'Press Start 2P',monospace",textShadow:"0 1px 3px rgba(0,0,0,0.5)",display:"inline-block"}}>{type}</span>;
}

function HPBar({cur,max}){
  const pct=Math.max(0,(cur/max)*100);
  const col=pct>50?"#4CAF50":pct>25?"#FFC107":"#f44336";
  return(
    <div style={{width:"100%",background:"rgba(0,0,0,0.5)",borderRadius:4,height:10,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)"}}>
      <div style={{width:`${pct}%`,background:col,height:"100%",transition:"width 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",boxShadow:`0 0 10px ${col}cc`}}/>
    </div>
  );
}

function PokemonSprite({id, isPlayer, shake, hit, faint, isMega, isGiga, megaSlug}){
  // Animated GIF sprites from PokeAPI (Gen V style) with fallback to static
  const animUrl = isPlayer
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
  const normalUrl = isPlayer
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  const megaUrl = megaSlug
    ? `https://img.pokemondb.net/sprites/x-y/normal/${megaSlug}.png`
    : normalUrl;

  const gigaUrl = id
    ? `https://img.pokemondb.net/sprites/sword-shield/normal/${
        // map common gmax slugs
        id===6?"charizard-giga":id===25?"pikachu-giga":id===143?"snorlax-giga":
        id===131?"lapras-giga":id===94?"gengar-giga":id===68?"machamp-giga":
        id===99?"kingler-giga":id===569?"garbodor-giga":id===823?"corviknight-giga":
        id===826?"hatterene-giga":id===834?"drednaw-giga":id===844?"sandaconda-giga":
        id===851?"centiskorch-giga":id===858?"hatterene-giga":id===861?"grimmsnarl-giga":
        id===869?"alcremie-giga":id===884?"duraludon-giga":id===892?"urshifu-giga":
        id===898?"calyrex-giga":"charizard-giga"
      }.png`
    : normalUrl;

  const [src,setSrc]=useState(isMega?megaUrl:isGiga?gigaUrl:animUrl);
  const [fallback,setFallback]=useState(false);

  useEffect(()=>{
    setFallback(false);
    setSrc(isMega?megaUrl:isGiga?gigaUrl:animUrl);
  },[isMega,isGiga,megaSlug,id]);

  function onErr(){ if(!fallback){ setFallback(true); setSrc(normalUrl); } }

  let filter = "drop-shadow(0 0 14px rgba(255,255,255,0.22)) drop-shadow(0 6px 12px rgba(0,0,0,0.6))";
  if(faint) filter = "grayscale(1) brightness(0.1)";
  else if(hit) filter = "brightness(10) saturate(0)";
  else if(isGiga) filter = "drop-shadow(0 0 30px #FFD54F) drop-shadow(0 0 60px #FF6B35) brightness(1.25) saturate(1.3)";
  else if(isMega) filter = "drop-shadow(0 0 28px #7C4DFF) drop-shadow(0 0 55px #F06292) drop-shadow(0 0 10px #fff) brightness(1.25)";

  const gigaScale = isGiga ? (isPlayer?2.3:2.0) : (isPlayer?1.65:1.42);

  let animation = "floatMon 2.2s ease-in-out infinite";
  if(shake) animation = isPlayer?"shakeBack 0.42s ease":"shake 0.42s ease";
  else if(faint) animation = "faintAnim 0.65s ease forwards";
  else if(isGiga) animation = "floatGiga 1.8s ease-in-out infinite";
  else if(isMega) animation = "floatMega 1.5s ease-in-out infinite";

  return <img src={src} alt="" onError={onErr} style={{
    width:isPlayer?112:100, imageRendering:"pixelated",
    filter, transform:isPlayer?`scaleX(-1) scale(${gigaScale})`:`scale(${gigaScale})`,
    transition:"filter 0.2s linear, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
    animation,
  }}/>;
}

// ── Evolution Animation ───────────────────────────────────
function EvolutionAnim({oldMon, newId, onDone}){
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return;
    canvas.width=canvas.offsetWidth||320; canvas.height=canvas.offsetHeight||220;
    const W=canvas.width,H=canvas.height,ctx=canvas.getContext("2d");
    let t=0,raf;
    function draw(){
      ctx.clearRect(0,0,W,H);
      const phase=t/120;
      // Background flash
      const alpha=Math.sin(phase*Math.PI)*0.7;
      ctx.fillStyle=`rgba(255,255,255,${alpha.toFixed(3)})`; ctx.fillRect(0,0,W,H);
      // Spinning stars
      for(let i=0;i<16;i++){
        const a=(i/16)*Math.PI*2+t*0.08;
        const r=50+20*Math.sin(t*0.12+i);
        const x=W/2+Math.cos(a)*r,y=H/2+Math.sin(a)*r*0.65;
        const sc=["#FFD54F","#4FC3F7","#FF6B35","#7C4DFF","#66BB6A","#F06292"][i%6];
        ctx.fillStyle=sc;
        const sz=5+Math.sin(t*0.2+i)*3;
        ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fill();
      }
      // Center glow
      const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,60+Math.sin(t*0.1)*15);
      g.addColorStop(0,`rgba(255,255,255,${(0.9*Math.sin(phase*Math.PI)).toFixed(3)})`);
      g.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(W/2,H/2,80,0,Math.PI*2); ctx.fill();
      // Text
      if(phase>0.5){
        const ta=Math.min(1,(phase-0.5)*4);
        ctx.save(); ctx.shadowBlur=20; ctx.shadowColor="#FFD54F";
        ctx.fillStyle=`rgba(255,213,79,${ta.toFixed(3)})`;
        ctx.font="bold 13px 'Press Start 2P',monospace"; ctx.textAlign="center";
        ctx.fillText("EVOLVING!",W/2,H/2+8); ctx.restore();
      }
      t++;
      if(t>120){onDone(); return;}
      raf=requestAnimationFrame(draw);
    }
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:25}}/>;
}

// ── EXP Bar ───────────────────────────────────────────────
function EXPBar({exp, level}){
  const cur=exp||0;
  const toNext=EXP_TO_LEVEL(level+1);
  const fromCur=EXP_TO_LEVEL(level);
  const pct=level>=100?100:Math.round(((cur-fromCur)/(toNext-fromCur))*100);
  return(
    <div style={{width:"100%",marginTop:4}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
        <span style={{color:"#4FC3F7",fontSize:"7px",fontFamily:"'Press Start 2P',monospace"}}>EXP</span>
        <span style={{color:"#4FC3F7",fontSize:"7px",fontFamily:"'Press Start 2P',monospace"}}>{pct}%</span>
      </div>
      <div style={{width:"100%",background:"rgba(0,0,0,0.4)",borderRadius:3,height:5,overflow:"hidden",border:"1px solid rgba(79,195,247,0.2)"}}>
        <div style={{width:`${pct}%`,background:"linear-gradient(90deg,#4FC3F7,#7C4DFF)",height:"100%",transition:"width 0.8s ease",boxShadow:"0 0 6px #4FC3F7"}}/>
      </div>
    </div>
  );
}

// ── Story Mode Screen ─────────────────────────────────────
function StoryScreen({profile, storyProgress, onStartGym, onBack, allPokemon}){
  return(
    <div style={{width:"100%",maxWidth:720}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:"28px",marginBottom:6}}>🗺️</div>
        <div style={{color:"#FFD54F",fontSize:"clamp(11px,2.5vw,15px)",fontFamily:"'Press Start 2P',monospace",marginBottom:4}}>STORY MODE</div>
        <div style={{color:"#333",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>Defeat all 8 Gym Leaders, Elite 4 & Champion!</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {STORY_GYMS.map((gym,i)=>{
          const done=storyProgress.includes(gym.id);
          const prevDone=i===0||storyProgress.includes(STORY_GYMS[i-1].id);
          const locked=!prevDone&&!done;
          const typeCol=TC[gym.type]||"#888";
          return(
            <div key={gym.id} style={{background:done?"rgba(76,175,80,0.08)":locked?"rgba(4,4,12,0.8)":"rgba(10,10,28,0.98)",border:`1.5px solid ${done?"rgba(76,175,80,0.4)":locked?"rgba(255,255,255,0.04)":`${typeCol}44`}`,borderRadius:14,padding:"14px 16px",opacity:locked?0.5:1,transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:"28px"}}>{gym.icon}</div>
                  <div>
                    <div style={{color:done?"#4CAF50":locked?"#333":"#fff",fontSize:"clamp(10px,2vw,13px)",fontFamily:"'Press Start 2P',monospace"}}>{gym.name}</div>
                    <div style={{color:typeCol,fontSize:"8px",fontFamily:"'Press Start 2P',monospace",marginTop:3}}>{gym.badge}</div>
                    <div style={{color:"#333",fontSize:"7px",fontFamily:"'Press Start 2P',monospace",marginTop:2}}>{gym.hint}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:"#FFD54F",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>Lv {gym.level}</div>
                    <div style={{color:"#444",fontSize:"7px",fontFamily:"'Press Start 2P',monospace"}}>+{gym.reward}🪙</div>
                  </div>
                  {done?(
                    <div style={{background:"rgba(76,175,80,0.15)",border:"1px solid rgba(76,175,80,0.4)",borderRadius:8,padding:"6px 10px",color:"#4CAF50",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>✅ DONE</div>
                  ):locked?(
                    <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:"6px 10px",color:"#333",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>🔒</div>
                  ):(
                    <button onClick={()=>onStartGym(gym)} className="btn" style={{background:`linear-gradient(135deg,${typeCol}22,${typeCol}11)`,border:`1.5px solid ${typeCol}66`,borderRadius:8,padding:"8px 14px",color:"#fff",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"9px"}}>
                      CHALLENGE →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Battle History Screen ─────────────────────────────────
function HistoryScreen({history, onBack}){
  return(
    <div style={{width:"100%",maxWidth:600}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:"24px",marginBottom:6}}>📜</div>
        <div style={{color:"#FFD54F",fontSize:"13px",fontFamily:"'Press Start 2P',monospace",marginBottom:4}}>BATTLE HISTORY</div>
        <div style={{color:"#333",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>Last {history.length} battles</div>
      </div>
      {history.length===0?(
        <div style={{textAlign:"center",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:32}}>
          <div style={{fontSize:"32px",marginBottom:8}}>⚔️</div>
          <div style={{color:"#333",fontSize:"9px",fontFamily:"'Press Start 2P',monospace"}}>No battles yet!</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {history.map(r=>(
            <div key={r.id} style={{background:"rgba(10,10,28,0.98)",border:`1.5px solid ${r.winner==="player"?"rgba(76,175,80,0.3)":"rgba(244,67,54,0.3)"}`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div style={{fontSize:"24px"}}>{r.winner==="player"?"🏆":"💀"}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${r.pId}.png`} style={{width:36,imageRendering:"pixelated"}}/>
                <div>
                  <div style={{color:"#fff",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",textTransform:"capitalize"}}>{r.pName} <span style={{color:"#FFD54F"}}>Lv{r.pLevel}</span></div>
                  <div style={{color:"#444",fontSize:"7px",fontFamily:"'Press Start 2P',monospace",marginTop:2}}>vs</div>
                  <div style={{color:"#ccc",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",textTransform:"capitalize"}}>{r.eName}</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:r.winner==="player"?"#4CAF50":"#f44336",fontSize:"9px",fontFamily:"'Press Start 2P',monospace"}}>{r.winner==="player"?"WIN":"LOSS"}</div>
                <div style={{color:"#333",fontSize:"7px",fontFamily:"'Press Start 2P',monospace",marginTop:2}}>{r.turns} turns</div>
                <div style={{color:"#222",fontSize:"7px",fontFamily:"'Press Start 2P',monospace"}}>{r.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Trade Screen ──────────────────────────────────────────
function TradeScreen({allPokemon, unlockedIds, starterPokemon, onTrade, profile}){
  const [offering,setOffering]=useState(null);
  const [wanting,setWanting]=useState(null);
  const [confirm,setConfirm]=useState(false);

  // owned = pokemon the user has (starter + unlocked)
  const owned=allPokemon.filter(p=>unlockedIds.has(p.id)||(starterPokemon?.id===p.id));
  // available = pokemon NOT owned yet, limited to first 80 to keep the list manageable
  const available=allPokemon.filter(p=>!unlockedIds.has(p.id)&&starterPokemon?.id!==p.id).slice(0,80);

  const tradeCost = wanting ? (wanting.legendary?600:wanting.canMega?400:200) : 0;
  const canAfford = (profile?.coins||0) >= tradeCost;

  function doTrade(){
    if(!offering||!wanting) return;
    if(!canAfford){ alert(`Need ${tradeCost}🪙! You have ${profile?.coins||0}🪙.`); return; }
    setConfirm(false);
    // Pass full pokemon objects — onTrade will re-fetch from allPokemon for safety
    onTrade(offering, wanting, tradeCost);
  }

  return(
    <div style={{width:"100%",maxWidth:720}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:"24px",marginBottom:6}}>🔄</div>
        <div style={{color:"#FFD54F",fontSize:"13px",fontFamily:"'Press Start 2P',monospace",marginBottom:4}}>TRADE CENTER</div>
        <div style={{color:"#333",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>Give one of yours · Get one you want</div>
        <div style={{color:"#FFD54F",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",marginTop:4}}>Balance: {profile?.coins||0}🪙</div>
      </div>

      {/* Confirm dialog */}
      {confirm&&offering&&wanting&&(
        <div style={{background:"rgba(0,0,0,0.9)",position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:600}} onClick={()=>setConfirm(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#07070f",border:"1.5px solid rgba(255,213,79,0.4)",borderRadius:16,padding:"24px 22px",maxWidth:360,width:"100%",textAlign:"center"}}>
            <div style={{fontSize:"18px",marginBottom:10}}>⇄</div>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"10px",color:"#fff",marginBottom:6}}>Confirm Trade?</div>
            <div style={{display:"flex",justifyContent:"center",gap:20,marginBottom:14,alignItems:"center"}}>
              <div style={{textAlign:"center"}}>
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${offering.id}.png`} style={{width:52,imageRendering:"pixelated"}}/>
                <div style={{color:"#f44336",fontSize:"7px",fontFamily:"'Press Start 2P',monospace",textTransform:"capitalize"}}>{offering.name}</div>
                <div style={{color:"#555",fontSize:"6px",fontFamily:"'Press Start 2P',monospace"}}>YOU GIVE</div>
              </div>
              <div style={{color:"#FFD54F",fontSize:"20px"}}>→</div>
              <div style={{textAlign:"center"}}>
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${wanting.id}.png`} style={{width:52,imageRendering:"pixelated"}}/>
                <div style={{color:"#4CAF50",fontSize:"7px",fontFamily:"'Press Start 2P',monospace",textTransform:"capitalize"}}>{wanting.name}</div>
                <div style={{color:"#555",fontSize:"6px",fontFamily:"'Press Start 2P',monospace"}}>YOU GET</div>
              </div>
            </div>
            <div style={{color:"#FFD54F",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:16}}>Cost: {tradeCost}🪙</div>
            {!canAfford&&<div style={{color:"#f44336",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",marginBottom:10}}>⚠️ Not enough coins!</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setConfirm(false)} style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px",color:"#666",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"9px"}}>CANCEL</button>
              <button onClick={doTrade} disabled={!canAfford} style={{flex:2,background:canAfford?"rgba(76,175,80,0.25)":"rgba(255,255,255,0.03)",border:`1.5px solid ${canAfford?"rgba(76,175,80,0.6)":"rgba(255,255,255,0.06)"}`,borderRadius:8,padding:"10px",color:canAfford?"#4CAF50":"#333",cursor:canAfford?"pointer":"not-allowed",fontFamily:"'Press Start 2P',monospace",fontSize:"9px"}}>
                ✅ CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:12,marginBottom:16,alignItems:"start"}}>
        {/* Offering */}
        <div>
          <div style={{color:"#f44336",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:8,textAlign:"center"}}>YOU GIVE</div>
          {owned.length===0?(
            <div style={{color:"#333",fontSize:"7px",fontFamily:"'Press Start 2P',monospace",textAlign:"center",padding:"16px 0"}}>No Pokémon owned yet!</div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(70px,1fr))",gap:6,maxHeight:280,overflowY:"auto"}}>
              {owned.map(p=>(
                <div key={p.id} onClick={()=>setOffering(offering?.id===p.id?null:p)}
                  style={{background:offering?.id===p.id?"rgba(244,67,54,0.2)":"rgba(10,10,28,0.98)",border:`1.5px solid ${offering?.id===p.id?"#f44336":"rgba(255,255,255,0.06)"}`,borderRadius:9,padding:"6px 4px",cursor:"pointer",textAlign:"center",transition:"all 0.14s"}}>
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} style={{width:44,imageRendering:"pixelated"}}/>
                  <div style={{color:"#ccc",fontSize:"6px",fontFamily:"'Press Start 2P',monospace",textTransform:"capitalize",lineHeight:1.4}}>{p.name}</div>
                  {starterPokemon?.id===p.id&&<div style={{color:"#FFD54F",fontSize:"5px",fontFamily:"'Press Start 2P',monospace"}}>STARTER</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Arrow + Trade button */}
        <div style={{textAlign:"center",paddingTop:40}}>
          <div style={{fontSize:"24px"}}>⇄</div>
          {offering&&wanting&&(
            <div style={{marginTop:12}}>
              <div style={{color:canAfford?"#FFD54F":"#f44336",fontSize:"7px",fontFamily:"'Press Start 2P',monospace",marginBottom:6}}>
                {tradeCost}🪙
              </div>
              <button onClick={()=>setConfirm(true)} className="btn" style={{background:"rgba(76,175,80,0.2)",border:"1.5px solid rgba(76,175,80,0.5)",borderRadius:8,padding:"8px 10px",color:"#4CAF50",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"8px"}}>
                TRADE!
              </button>
            </div>
          )}
        </div>

        {/* Wanting */}
        <div>
          <div style={{color:"#4CAF50",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:8,textAlign:"center"}}>YOU GET</div>
          {available.length===0?(
            <div style={{color:"#333",fontSize:"7px",fontFamily:"'Press Start 2P',monospace",textAlign:"center",padding:"16px 0"}}>All Pokémon already owned!</div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(70px,1fr))",gap:6,maxHeight:280,overflowY:"auto"}}>
              {available.map(p=>(
                <div key={p.id} onClick={()=>setWanting(wanting?.id===p.id?null:p)}
                  style={{background:wanting?.id===p.id?"rgba(76,175,80,0.2)":"rgba(10,10,28,0.98)",border:`1.5px solid ${wanting?.id===p.id?"#4CAF50":"rgba(255,255,255,0.06)"}`,borderRadius:9,padding:"6px 4px",cursor:"pointer",textAlign:"center",transition:"all 0.14s"}}>
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} style={{width:44,imageRendering:"pixelated"}}/>
                  <div style={{color:"#ccc",fontSize:"6px",fontFamily:"'Press Start 2P',monospace",textTransform:"capitalize",lineHeight:1.4}}>{p.name}</div>
                  <div style={{color:"#FFD54F",fontSize:"6px",fontFamily:"'Press Start 2P',monospace"}}>{p.legendary?"⭐":p.canMega?"💎":""}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BattleStatCard({mon, hp, maxHP, level, isMega, isGiga, exp}){
  const c=TC[mon.types[0]]||"#888";
  const isLeg=LEGENDARY_IDS.has(mon.id);
  const displayTypes = isMega&&mon.megaTypes ? mon.megaTypes : mon.types;
  const borderColor = isGiga?"#FFD54F":isMega?"#7C4DFF":`${c}55`;
  return(
    <div style={{background:"rgba(8,8,22,0.97)",border:`1.5px solid ${borderColor}`,borderRadius:12,padding:"12px 16px",minWidth:160,boxShadow:`0 0 20px ${c}22,${isGiga?"0 0 30px rgba(255,213,79,0.2)":isMega?"0 0 30px rgba(124,77,255,0.2)":""}`,position:"relative",overflow:"hidden",flex:1,transition:"border-color 0.5s,box-shadow 0.5s"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:`linear-gradient(90deg,transparent,${borderColor},transparent)`}}/>
      {(isMega||isGiga)&&<div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:`radial-gradient(ellipse at top,${isGiga?"rgba(255,213,79,0.06)":"rgba(124,77,255,0.06)"},transparent)`,pointerEvents:"none"}}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
        <div style={{fontSize:"clamp(12px,2.2vw,16px)",fontFamily:"'Press Start 2P',monospace",color:"#fff",fontWeight:700,lineHeight:1.4}}>{(isMega&&mon.megaName?mon.megaName:isGiga&&mon.gigaName?mon.gigaName:mon.name).toUpperCase()}</div>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {isLeg&&<span style={{fontSize:"12px"}}>⭐</span>}
          {isMega&&<span style={{fontSize:"12px"}}>💎</span>}
          {isGiga&&<span style={{fontSize:"12px",animation:"pulse 1s infinite"}}>⭕</span>}
          <span style={{fontSize:"10px",color:"#FFD54F",fontFamily:"'Press Start 2P',monospace"}}>Lv{level||50}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:7}}>
        {displayTypes.map(t=><Badge key={t} type={t} small/>)}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:"10px",color:"#555",fontFamily:"'Press Start 2P',monospace"}}>HP</span>
        <span style={{fontSize:"clamp(10px,1.8vw,13px)",color:hp/maxHP>0.5?"#4CAF50":hp/maxHP>0.25?"#FFC107":"#f44336",fontFamily:"'Press Start 2P',monospace"}}>{Math.max(0,hp)}/{maxHP}</span>
      </div>
      <HPBar cur={hp} max={maxHP}/>
      <div style={{display:"flex",gap:8,marginTop:6}}>
        {[["ATK",mon.attack],["DEF",mon.defense],["SPD",mon.speed]].map(([k,v])=>(
          <span key={k} style={{fontSize:"9px",color:"#2a2a4a",fontFamily:"'Press Start 2P',monospace"}}>{k} {v}</span>
        ))}
      </div>
      {exp!==undefined&&<EXPBar exp={exp} level={level||50}/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  CHARACTER CREATION — with custom avatar builder
// ══════════════════════════════════════════════════════════════════════
const HAIR_OPTIONS = ["short-dark","long-dark","short-blonde","long-blonde","short-red","curly-brown","short-white","afro-black","braids-brown","spiky-blue"];
const FACE_OPTIONS = ["round","oval","square","heart","diamond"];
const SKIN_OPTIONS = ["#FDDBB4","#EDB98A","#D08B5B","#AE5D29","#694C3B","#F2DCC9","#FDEDCA","#C68642"];
const HAIR_COLORS = ["#1a0a00","#3b1f00","#8B4513","#D4A017","#C0392B","#F0F0F0","#2C3E50","#9B59B6","#1ABC9C"];
const EYE_OPTIONS = ["👀","🔵","🟤","🟢","⚫","🔴","💜","🌟"];

function AvatarPreview({hair,face,skin,hairColor,eyes,size=80}){
  // Build a face from HTML/CSS
  const faceStyles={
    round:{borderRadius:"50%"},
    oval:{borderRadius:"45% 45% 50% 50%"},
    square:{borderRadius:"15%"},
    heart:{borderRadius:"50% 50% 0 0",clipPath:"polygon(50% 100%,0 35%,15% 0,85% 0,100% 35%)"},
    diamond:{borderRadius:"10%",transform:"rotate(45deg) scale(0.72)"},
  };
  const hairDisplay={
    "short-dark":{top:-size*0.22,left:"10%",width:"80%",height:size*0.35,borderRadius:"50% 50% 0 0",background:hairColor},
    "long-dark":{top:-size*0.22,left:"5%",width:"90%",height:size*0.75,borderRadius:"50% 50% 10% 10%",background:hairColor},
    "short-blonde":{top:-size*0.22,left:"10%",width:"80%",height:size*0.32,borderRadius:"50% 50% 0 0",background:hairColor},
    "long-blonde":{top:-size*0.2,left:"5%",width:"90%",height:size*0.8,borderRadius:"50% 50% 10% 10%",background:hairColor},
    "short-red":{top:-size*0.2,left:"12%",width:"76%",height:size*0.3,borderRadius:"60% 60% 10% 10%",background:hairColor},
    "curly-brown":{top:-size*0.28,left:"5%",width:"90%",height:size*0.45,borderRadius:"50%",background:hairColor},
    "short-white":{top:-size*0.2,left:"15%",width:"70%",height:size*0.3,borderRadius:"60% 60% 0 0",background:hairColor},
    "afro-black":{top:-size*0.35,left:"-5%",width:"110%",height:size*0.65,borderRadius:"50%",background:hairColor},
    "braids-brown":{top:-size*0.18,left:"10%",width:"80%",height:size*0.9,borderRadius:"30% 30% 0 0",background:hairColor},
    "spiky-blue":{top:-size*0.3,left:"10%",width:"80%",height:size*0.5,clipPath:"polygon(20% 100%,0 0,40% 60%,50% 0,60% 60%,100% 0,80% 100%)",background:hairColor},
  };
  const hd=hairDisplay[hair]||hairDisplay["short-dark"];
  return(
    <div style={{width:size,height:size,position:"relative",display:"inline-block"}}>
      {/* Hair back */}
      <div style={{position:"absolute",zIndex:0,...hd}}/>
      {/* Face */}
      <div style={{width:size,height:size,background:skin,position:"relative",zIndex:1,...(faceStyles[face]||{}),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"hidden",boxShadow:`0 2px 10px rgba(0,0,0,0.4)`}}>
        {/* Eyes */}
        <div style={{fontSize:size*0.18,marginBottom:size*0.04,letterSpacing:size*0.04}}>{eyes}</div>
        {/* Mouth */}
        <div style={{width:size*0.3,height:size*0.06,borderRadius:"0 0 50% 50%",background:"rgba(0,0,0,0.3)",marginTop:size*0.02}}/>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  AUTH / LOGIN SCREEN — email+password, no external OAuth needed
// ══════════════════════════════════════════════════════════════════════
function CharacterScreen({onDone}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [username,setUsername]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [showPass,setShowPass]=useState(false);
  const [pendingProfile,setPendingProfile]=useState(null);
  const [builderMode,setBuilderMode]=useState(false);
  const [emojiAvatar,setEmojiAvatar]=useState("🔴");
  const [hair,setHair]=useState("short-dark");
  const [face,setFace]=useState("round");
  const [skin,setSkin]=useState("#FDDBB4");
  const [hairColor,setHairColor]=useState("#1a0a00");
  const [eyes,setEyes]=useState("👀");

  const EMOJIS=["🔴","🔵","🟡","🟢","🟣","🟠","⚫","⚪","🌟","🔥","💧","⚡","🌿","❄️","👾","🎮","🦊","🐉","🦁","🐺","🦅","🌙","☀️","🎯","💀","👑","🎃","🤖","🦋","🐬"];
  const RESERVED=["ash","misty","brock","gary","red","blue","trainer","admin","god","test"];
  const HAIR_OPTS=["short-dark","long-dark","short-blonde","long-blonde","short-red","curly-brown","afro-black","braids-brown","spiky-blue"];
  const HAIR_COLS=["#1a0a00","#3b1f00","#8B4513","#D4A017","#C0392B","#F0F0F0","#2C3E50","#9B59B6","#1ABC9C"];
  const SKIN_OPTS=["#FDDBB4","#EDB98A","#D08B5B","#AE5D29","#694C3B","#F2DCC9","#FDEDCA","#C68642"];
  const EYE_OPTS=["👀","🔵","🟤","🟢","⚫","🔴","💜","🌟"];

  function getDB(){try{return JSON.parse(localStorage.getItem("pkmn_auth_db")||"{}")}catch{return{}}}
  function saveDB(db){localStorage.setItem("pkmn_auth_db",JSON.stringify(db));}
  function hash(p){let h=0;for(let i=0;i<p.length;i++){h=(h<<5)-h+p.charCodeAt(i);h|=0;}return String(h);}

  const GOOGLE_CLIENT_ID="661351244640-gnpaf4cejj9uoeg4q4h86uk0ghq2ena8.apps.googleusercontent.com";

  // Login screen music
  useEffect(()=>{
    let ctx,master,tid;
    function start(){
      try{
        ctx=new(window.AudioContext||window.webkitAudioContext)();
        master=ctx.createGain();master.gain.value=0.3;master.connect(ctx.destination);
        function note(f,t,dur,wave="triangle",v=0.15){
          const o=ctx.createOscillator(),g=ctx.createGain();
          o.type=wave;o.frequency.value=f;
          g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+0.02);
          g.gain.exponentialRampToValueAtTime(0.001,t+dur);
          o.connect(g);g.connect(master);
          try{o.start(t);o.stop(t+dur+0.05);}catch{}
        }
        function loop(){
          const now=ctx.currentTime,b=60/95;
          const mel=[523,2,440,1,494,1,523,2,587,2,523,2,440,4,392,2,440,1,494,1,440,2,392,2,349,4];
          let t=now;
          for(let i=0;i<mel.length;i+=2){if(mel[i])note(mel[i],t,b*mel[i+1]*0.85,"triangle",0.14);t+=b*mel[i+1];}
          [130,110,123,110].forEach((f,i)=>note(f,now+i*b*4,b*3.5,"sine",0.09));
          const dur=mel.reduce((s,v,i)=>i%2===1?s+v:s,0)*b*1000;
          tid=setTimeout(loop,dur-200);
        }
        loop();
      }catch{}
    }
    function onInteract(){start();document.removeEventListener("click",onInteract);document.removeEventListener("keydown",onInteract);}
    document.addEventListener("click",onInteract);
    document.addEventListener("keydown",onInteract);
    return()=>{
      document.removeEventListener("click",onInteract);
      document.removeEventListener("keydown",onInteract);
      if(tid)clearTimeout(tid);
      if(ctx)try{ctx.close();}catch{}
    };
  },[]);

  // Google Sign-In
  useEffect(()=>{
    if(mode==="avatar")return;
    function initGoogle(){
      if(!window.google?.accounts?.id)return;
      window.google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:handleGoogleCredential,auto_select:false});
      const btn=document.getElementById("google-signin-btn");
      if(btn){btn.innerHTML="";window.google.accounts.id.renderButton(btn,{theme:"filled_black",size:"large",width:Math.min(btn.offsetWidth||400,400),text:mode==="register"?"signup_with":"signin_with",shape:"rectangular"});}
    }
    if(window.google?.accounts?.id){initGoogle();return;}
    const t=setInterval(()=>{if(window.google?.accounts?.id){initGoogle();clearInterval(t);}},300);
    return()=>clearInterval(t);
  },[mode]);

  function handleGoogleCredential(resp){
    if(!resp?.credential){setError("Google sign-in failed. Try again.");return;}
    try{
      const payload=JSON.parse(atob(resp.credential.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
      const{email:gEmail,name:gName,sub:googleSub}=payload;
      const db=getDB();
      const existing=db[gEmail]||Object.values(db).find(u=>u.googleId===googleSub);
      if(existing){
        const profiles=JSON.parse(localStorage.getItem("pkmn_profiles")||"[]");
        const prof=profiles.find(p=>p.name===existing.username);
        // Track returning Google login to Supabase
        supaLogin(existing.username, gEmail);
        if(prof){onDone(prof);return;}
        const np={name:existing.username,avatar:existing.avatar||"🌟",avatarData:existing.avatarData,coins:500,wins:0,losses:0,createdAt:Date.now()};
        localStorage.setItem("pkmn_profiles",JSON.stringify([...profiles,np]));
        onDone(np);return;
      }
      const suggested=(gName||gEmail.split("@")[0]).replace(/[^a-zA-Z0-9]/g,"").slice(0,12)||"Trainer";
      setUsername(suggested);setPendingProfile({email:gEmail,googleId:googleSub,isGoogle:true});setMode("avatar");
    }catch(e){setError("Google sign-in failed. Please use email/password.");}
  }

  function handleLogin(){
    const key=email.trim().toLowerCase();
    if(!key||!password){setError("Fill in all fields");return;}
    setLoading(true);setError("");
    setTimeout(()=>{
      const db=getDB();
      const user=db[key]||Object.values(db).find(u=>u.username.toLowerCase()===key);
      if(!user){setError("No account found. Please register!");setLoading(false);return;}
      if(user.password!==hash(password)){setError("Wrong password. Try again!");setLoading(false);return;}
      // Check if profile already exists on this device
      const profiles=JSON.parse(localStorage.getItem("pkmn_profiles")||"[]");
      const prof=profiles.find(p=>p.name===user.username);
      if(prof){
        // Returning user on this device — go straight in, no need to re-pick avatar
        setLoading(false);supaLogin(user.username,user.email||"");onDone(prof);return;
      }
      // First login on this device — send to avatar screen so they can customise their look
      setLoading(false);
      setUsername(user.username);
      setPendingProfile({email:user.email||key,username:user.username,password:user.password,isGoogle:false,isReturning:true});
      setMode("avatar");
    },500);
  }

  function handleRegister(){
    const e=email.trim().toLowerCase(),u=username.trim(),p=password;
    if(!e||!u||!p){setError("Fill in all fields");return;}
    if(u.length<2||u.length>16){setError("Username: 2-16 characters");return;}
    if(!/^[a-zA-Z0-9_-]+$/.test(u)){setError("Username: letters, numbers, _ - only");return;}
    if(p.length<6){setError("Password needs 6+ characters");return;}
    if(!e.includes("@")||!e.includes(".")){setError("Enter a valid email");return;}
    if(RESERVED.includes(u.toLowerCase())){setError(`"${u}" is reserved`);return;}
    const db=getDB();
    if(db[e]){setError("Email already registered!");return;}
    if(Object.values(db).find(x=>x.username.toLowerCase()===u.toLowerCase())){setError(`Username "${u}" is taken`);return;}
    setError("");setPendingProfile({email:e,username:u,password:hash(p),isGoogle:false});setMode("avatar");
  }

  function finishCreate(){
    const avatarData=builderMode?{type:"built",hair,face,skin,hairColor,eyes}:{type:"emoji",emoji:emojiAvatar};
    const av=builderMode?"[built]":emojiAvatar;
    const db=getDB();
    const uname=pendingProfile?.username||username.trim()||"Trainer";
    // Save avatar back to auth db
    db[pendingProfile.email]={
      ...(db[pendingProfile.email]||{}),
      username:uname,
      email:pendingProfile.email,
      password:pendingProfile.password||null,
      googleId:pendingProfile.googleId||null,
      avatar:av,
      avatarData,
    };
    saveDB(db);

    // For returning login users: restore existing profile stats if any
    const all=JSON.parse(localStorage.getItem("pkmn_profiles")||"[]");
    const existingProf=all.find(p=>p.name===uname);
    const profile={
      name:uname,
      avatar:av,
      avatarData,
      coins:existingProf?.coins??500,
      wins:existingProf?.wins??0,
      losses:existingProf?.losses??0,
      createdAt:existingProf?.createdAt??Date.now(),
    };

    // Update or add the profile
    const updated=existingProf
      ? all.map(p=>p.name===uname?profile:p)
      : [...all,profile];
    localStorage.setItem("pkmn_profiles",JSON.stringify(updated));

    // Track to Supabase
    if(pendingProfile.isReturning){
      supaLogin(uname, pendingProfile.email||"");
    } else if(pendingProfile.isGoogle){
      supaLogin(uname, pendingProfile.email||"");
    } else {
      supaRegister(uname, pendingProfile.email||"", pendingProfile.password||"", av);
    }
    onDone(profile);
  }

  const existing=JSON.parse(localStorage.getItem("pkmn_profiles")||"[]");

  // ── AVATAR SCREEN ───────────────────────────────────────
  if(mode==="avatar"){
    return(
      <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#05050d,#0a0520,#05050d)",display:"flex",alignItems:"center",justifyContent:"center",padding:"clamp(16px,4vw,28px)"}}>
        <div style={{width:"100%",maxWidth:560}}>
          <div style={{textAlign:"center",marginBottom:"clamp(20px,4vw,32px)"}}>
            <div style={{fontSize:"clamp(28px,7vw,48px)",marginBottom:8}}>⚡</div>
            <div style={{fontSize:"clamp(14px,3.5vw,22px)",fontFamily:"'Press Start 2P',monospace",background:"linear-gradient(135deg,#FF6B35,#FFD54F,#4FC3F7,#7C4DFF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>
              {pendingProfile?.isReturning?"WELCOME BACK!":"PICK YOUR LOOK"}
            </div>
            <div style={{fontSize:"clamp(9px,1.8vw,12px)",color:"#555",fontFamily:"'Press Start 2P',monospace"}}>
              {pendingProfile?.isReturning
                ? `Set your avatar, ${pendingProfile?.username||username}!`
                : `Welcome, ${pendingProfile?.username||username}!`
              }
            </div>
          </div>
          <div style={{background:"rgba(8,8,24,0.97)",border:"1px solid rgba(124,77,255,0.3)",borderRadius:24,padding:"clamp(20px,5vw,36px)",boxShadow:"0 0 80px rgba(124,77,255,0.1)"}}>
            <div style={{display:"flex",gap:8,marginBottom:"clamp(16px,3.5vw,24px)",background:"rgba(0,0,0,0.3)",borderRadius:12,padding:4}}>
              {[["🎭 EMOJI",false],["✏️ BUILD",true]].map(([lbl,bm])=>(
                <button key={lbl} onClick={()=>setBuilderMode(bm)} style={{flex:1,padding:"clamp(10px,2vw,13px)",background:builderMode===bm?"rgba(124,77,255,0.4)":"transparent",border:`1.5px solid ${builderMode===bm?"rgba(124,77,255,0.7)":"transparent"}`,borderRadius:10,color:builderMode===bm?"#fff":"#555",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(8px,1.6vw,11px)",transition:"all 0.18s"}}>
                  {lbl}
                </button>
              ))}
            </div>
            {!builderMode&&(
              <div>
                <div style={{color:"#555",fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",marginBottom:12,textAlign:"center"}}>SELECT YOUR AVATAR</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"clamp(6px,1.5vw,10px)",marginBottom:20}}>
                  {EMOJIS.map(a=>(
                    <button key={a} onClick={()=>setEmojiAvatar(a)} style={{aspectRatio:"1",background:emojiAvatar===a?"rgba(124,77,255,0.3)":"rgba(255,255,255,0.04)",border:`2px solid ${emojiAvatar===a?"rgba(124,77,255,0.8)":"rgba(255,255,255,0.08)"}`,borderRadius:12,cursor:"pointer",fontSize:"clamp(20px,4vw,28px)",transform:emojiAvatar===a?"scale(1.15)":"scale(1)",transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:emojiAvatar===a?"0 0 16px rgba(124,77,255,0.4)":"none"}}>
                      {a}
                    </button>
                  ))}
                </div>
                <div style={{textAlign:"center",marginBottom:20}}>
                  <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:8,background:"rgba(124,77,255,0.08)",border:"1px solid rgba(124,77,255,0.2)",borderRadius:16,padding:"16px 28px"}}>
                    <div style={{fontSize:"clamp(40px,8vw,60px)"}}>{emojiAvatar}</div>
                    <div style={{color:"#ccc",fontSize:"clamp(9px,1.8vw,12px)",fontFamily:"'Press Start 2P',monospace"}}>{pendingProfile?.username||username||"Trainer"}</div>
                  </div>
                </div>
              </div>
            )}
            {builderMode&&(
              <div>
                <div style={{display:"flex",justifyContent:"center",marginBottom:"clamp(16px,3vw,24px)"}}>
                  <div style={{background:"rgba(124,77,255,0.08)",border:"1px solid rgba(124,77,255,0.2)",borderRadius:20,padding:"clamp(16px,3vw,24px)",display:"inline-flex",flexDirection:"column",alignItems:"center",gap:10}}>
                    <AvatarPreview hair={hair} face={face} skin={skin} hairColor={hairColor} eyes={eyes} size={100}/>
                    <div style={{color:"#ccc",fontSize:"clamp(9px,1.8vw,12px)",fontFamily:"'Press Start 2P',monospace"}}>{pendingProfile?.username||username||"Trainer"}</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"clamp(12px,2.5vw,18px)"}}>
                  <div>
                    <div style={{color:"#666",fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",marginBottom:8}}>FACE SHAPE</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {["round","oval","square","heart"].map(o=><button key={o} onClick={()=>setFace(o)} style={{padding:"clamp(7px,1.5vw,10px) clamp(10px,2vw,14px)",background:face===o?"rgba(124,77,255,0.35)":"rgba(255,255,255,0.04)",border:`1.5px solid ${face===o?"rgba(124,77,255,0.7)":"rgba(255,255,255,0.1)"}`,borderRadius:9,color:face===o?"#fff":"#777",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(8px,1.5vw,10px)",textTransform:"capitalize"}}>{o}</button>)}
                    </div>
                  </div>
                  <div>
                    <div style={{color:"#666",fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",marginBottom:8}}>HAIR STYLE</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {HAIR_OPTS.map(h=><button key={h} onClick={()=>setHair(h)} style={{padding:"clamp(6px,1.2vw,8px) clamp(8px,1.5vw,12px)",background:hair===h?"rgba(124,77,255,0.35)":"rgba(255,255,255,0.04)",border:`1.5px solid ${hair===h?"rgba(124,77,255,0.7)":"rgba(255,255,255,0.1)"}`,borderRadius:8,color:hair===h?"#fff":"#777",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(7px,1.3vw,9px)"}}>{h.replace(/-/g," ")}</button>)}
                    </div>
                  </div>
                  <div>
                    <div style={{color:"#666",fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",marginBottom:8}}>HAIR COLOR</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {HAIR_COLS.map(col=><button key={col} onClick={()=>setHairColor(col)} style={{width:"clamp(28px,4vw,36px)",height:"clamp(28px,4vw,36px)",background:col,border:`2.5px solid ${hairColor===col?"#fff":"rgba(255,255,255,0.12)"}`,borderRadius:"50%",cursor:"pointer",transform:hairColor===col?"scale(1.3)":"scale(1)",transition:"transform 0.15s"}}/>)}
                    </div>
                  </div>
                  <div>
                    <div style={{color:"#666",fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",marginBottom:8}}>SKIN TONE</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {SKIN_OPTS.map(col=><button key={col} onClick={()=>setSkin(col)} style={{width:"clamp(28px,4vw,36px)",height:"clamp(28px,4vw,36px)",background:col,border:`2.5px solid ${skin===col?"#fff":"rgba(255,255,255,0.12)"}`,borderRadius:"50%",cursor:"pointer",transform:skin===col?"scale(1.3)":"scale(1)",transition:"transform 0.15s"}}/>)}
                    </div>
                  </div>
                  <div>
                    <div style={{color:"#666",fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",marginBottom:8}}>EYES</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {EYE_OPTS.map(e=><button key={e} onClick={()=>setEyes(e)} style={{padding:"clamp(7px,1.5vw,10px)",background:eyes===e?"rgba(124,77,255,0.3)":"rgba(255,255,255,0.04)",border:`1.5px solid ${eyes===e?"rgba(124,77,255,0.7)":"rgba(255,255,255,0.08)"}`,borderRadius:10,cursor:"pointer",fontSize:"clamp(18px,3.5vw,24px)",transition:"all 0.15s",transform:eyes===e?"scale(1.15)":"scale(1)"}}>{e}</button>)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <button onClick={finishCreate} style={{width:"100%",marginTop:"clamp(20px,4vw,28px)",background:"linear-gradient(135deg,rgba(76,175,80,0.4),rgba(79,195,247,0.25))",border:"2px solid rgba(76,175,80,0.65)",borderRadius:14,padding:"clamp(14px,3vw,18px)",color:"#fff",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(12px,2.5vw,16px)",letterSpacing:1,boxShadow:"0 0 30px rgba(76,175,80,0.15)"}}>
              ✅ START MY JOURNEY!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOGIN / REGISTER ────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"clamp(16px,4vw,24px)",position:"relative",overflow:"hidden"}}>
      {/* Background — animated aurora gradient */}
      <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#05050d 0%,#0d0520 30%,#070318 60%,#05050d 100%)"}}/>
        {/* Animated aurora blobs */}
        <div style={{position:"absolute",top:"-20%",left:"-10%",width:"60%",height:"60%",borderRadius:"50%",background:"radial-gradient(circle,rgba(124,77,255,0.18),transparent 70%)",animation:"loginBlob1 8s ease-in-out infinite alternate"}}/>
        <div style={{position:"absolute",top:"10%",right:"-15%",width:"55%",height:"55%",borderRadius:"50%",background:"radial-gradient(circle,rgba(79,195,247,0.12),transparent 70%)",animation:"loginBlob2 10s ease-in-out infinite alternate"}}/>
        <div style={{position:"absolute",bottom:"-10%",left:"20%",width:"50%",height:"50%",borderRadius:"50%",background:"radial-gradient(circle,rgba(240,98,146,0.10),transparent 70%)",animation:"loginBlob3 12s ease-in-out infinite alternate"}}/>
        {/* Grid overlay */}
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(124,77,255,0.03)1px,transparent 1px),linear-gradient(90deg,rgba(124,77,255,0.03)1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
        {/* Floating particles */}
        {[...Array(18)].map((_,i)=>(
          <div key={i} style={{
            position:"absolute",
            width:i%3===0?"3px":"2px",
            height:i%3===0?"3px":"2px",
            borderRadius:"50%",
            background:["rgba(124,77,255,0.6)","rgba(79,195,247,0.5)","rgba(255,213,79,0.4)","rgba(240,98,146,0.5)"][i%4],
            left:`${5+i*5.2}%`,
            top:`${10+((i*37)%75)}%`,
            animation:`floatParticle${i%4} ${4+i%5}s ease-in-out ${i*0.4}s infinite alternate`,
            boxShadow:`0 0 6px ${["rgba(124,77,255,0.8)","rgba(79,195,247,0.7)","rgba(255,213,79,0.6)","rgba(240,98,146,0.7)"][i%4]}`
          }}/>
        ))}
      </div>

      {/* Content */}
      <div style={{width:"100%",maxWidth:460,position:"relative",zIndex:1}}>
        {/* Pokéball logo */}
        <div style={{textAlign:"center",marginBottom:"clamp(16px,4vw,28px)"}}>
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{width:"clamp(80px,18vw,120px)",height:"clamp(80px,18vw,120px)",filter:"drop-shadow(0 0 18px rgba(229,57,53,0.7)) drop-shadow(0 0 40px rgba(229,57,53,0.3))"}}>
            <circle cx="100" cy="104" r="90" fill="rgba(0,0,0,0.3)"/>
            <circle cx="100" cy="100" r="90" fill="#e53935"/>
            <path d="M10 100 A90 90 0 0 0 190 100 Z" fill="#f5f5f5"/>
            <rect x="10" y="92" width="180" height="16" fill="#212121" rx="3"/>
            <ellipse cx="68" cy="55" rx="22" ry="13" fill="rgba(255,255,255,0.22)" transform="rotate(-30,68,55)"/>
            <circle cx="100" cy="100" r="22" fill="#212121"/>
            <circle cx="100" cy="100" r="15" fill="#f5f5f5"/>
            <circle cx="100" cy="100" r="7" fill="#e0e0e0"/>
          </svg>
          <div style={{fontSize:"clamp(18px,5vw,32px)",background:"linear-gradient(135deg,#FF6B35,#FFD54F,#4FC3F7,#7C4DFF,#F06292)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontFamily:"'Press Start 2P',monospace",marginBottom:6,letterSpacing:2,marginTop:10}}>POKÉMON</div>
          <div style={{fontSize:"clamp(8px,2vw,12px)",color:"#2a2a4a",letterSpacing:6,fontFamily:"'Press Start 2P',monospace"}}>BATTLE ARENA</div>
        </div>
        {/* Card */}
        <div style={{background:"rgba(8,8,28,0.55)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(124,77,255,0.35)",borderRadius:24,padding:"clamp(18px,4.5vw,32px)",boxShadow:"0 8px 40px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.06)"}}>
          {/* Tabs */}
          <div style={{display:"flex",gap:4,marginBottom:20,background:"rgba(0,0,0,0.3)",backdropFilter:"blur(10px)",borderRadius:12,padding:4}}>
            {[["login","SIGN IN"],["register","REGISTER"]].map(([m,lbl])=>(
              <button key={m} onClick={()=>{setMode(m);setError("");}} style={{flex:1,padding:"clamp(10px,2vw,14px)",background:mode===m?"rgba(124,77,255,0.4)":"transparent",border:`1px solid ${mode===m?"rgba(124,77,255,0.6)":"transparent"}`,borderRadius:10,color:mode===m?"#fff":"#555",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(10px,2vw,13px)",transition:"all 0.18s"}}>
                {lbl}
              </button>
            ))}
          </div>
          {/* Google */}
          <div id="google-signin-btn" style={{width:"100%",minHeight:44,marginBottom:14}}/>
          {/* OR */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
            <span style={{color:"#333",fontSize:"clamp(7px,1.3vw,9px)",fontFamily:"'Press Start 2P',monospace",letterSpacing:2}}>OR</span>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
          </div>
          {/* Fields */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {mode==="register"&&(
              <div>
                <div style={{color:"#555",fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",marginBottom:6}}>USERNAME</div>
                <input value={username} onChange={e=>{setUsername(e.target.value);setError("");}} placeholder="e.g. AshKetchum99" maxLength={16}
                  style={{width:"100%",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(4px)",border:`1.5px solid ${error&&!username.trim()?"#f44336":"rgba(124,77,255,0.4)"}`,borderRadius:11,padding:"clamp(12px,2.5vw,15px)",color:"#fff",fontSize:"clamp(12px,2.2vw,15px)",fontFamily:"'Press Start 2P',monospace",display:"block"}}/>
              </div>
            )}
            <div>
              <div style={{color:"#555",fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",marginBottom:6}}>{mode==="login"?"EMAIL OR USERNAME":"EMAIL"}</div>
              <input value={email} onChange={e=>{setEmail(e.target.value);setError("");}} placeholder={mode==="login"?"trainer@email.com or Username":"trainer@email.com"}
                style={{width:"100%",background:"rgba(255,255,255,0.06)",border:`1.5px solid ${error?"rgba(244,67,54,0.5)":"rgba(124,77,255,0.35)"}`,borderRadius:11,padding:"clamp(12px,2.5vw,15px)",color:"#fff",fontSize:"clamp(12px,2.2vw,15px)",fontFamily:"'Press Start 2P',monospace",display:"block"}}/>
            </div>
            <div>
              <div style={{color:"#555",fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",marginBottom:6}}>PASSWORD</div>
              <div style={{position:"relative"}}>
                <input value={password} onChange={e=>{setPassword(e.target.value);setError("");}} type={showPass?"text":"password"} placeholder="••••••••"
                  onKeyDown={e=>{if(e.key==="Enter")mode==="login"?handleLogin():handleRegister();}}
                  style={{width:"100%",background:"rgba(255,255,255,0.06)",border:`1.5px solid ${error?"rgba(244,67,54,0.5)":"rgba(124,77,255,0.35)"}`,borderRadius:11,padding:`clamp(12px,2.5vw,15px) 52px clamp(12px,2.5vw,15px) clamp(12px,2.5vw,15px)`,color:"#fff",fontSize:"clamp(12px,2.2vw,15px)",fontFamily:"'Press Start 2P',monospace"}}/>
                <button onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:"clamp(16px,3vw,20px)",padding:"4px",lineHeight:1}}>
                  {showPass?"🙈":"👁️"}
                </button>
              </div>
            </div>
          </div>
          {error&&(
            <div style={{color:"#f44336",fontSize:"clamp(9px,1.8vw,11px)",fontFamily:"'Press Start 2P',monospace",marginTop:12,padding:"10px 14px",background:"rgba(244,67,54,0.08)",borderRadius:9,border:"1px solid rgba(244,67,54,0.2)",lineHeight:1.8}}>
              ⚠️ {error}
            </div>
          )}
          <button onClick={mode==="login"?handleLogin:handleRegister} disabled={loading}
            style={{width:"100%",marginTop:18,background:"linear-gradient(135deg,rgba(124,77,255,0.45),rgba(79,195,247,0.28))",border:"2px solid rgba(124,77,255,0.7)",borderRadius:12,padding:"clamp(13px,2.8vw,17px)",color:"#fff",cursor:loading?"wait":"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(11px,2.2vw,14px)",opacity:loading?0.7:1,letterSpacing:1,boxShadow:"0 0 24px rgba(124,77,255,0.2)"}}>
            {loading?"⏳ LOADING…":(mode==="login"?"SIGN IN →":"CREATE ACCOUNT →")}
          </button>
          <div style={{textAlign:"center",marginTop:12,color:"#2a2a3a",fontSize:"clamp(7px,1.3vw,9px)",fontFamily:"'Press Start 2P',monospace"}}>
            {mode==="login"?"No account? Click REGISTER above":"Already registered? Click SIGN IN above"}
          </div>

          {/* Guest mode */}
          <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",marginTop:18,paddingTop:16,textAlign:"center"}}>
            <button onClick={()=>{
              const guestProfile={name:`Guest_${Date.now().toString(36).slice(-4).toUpperCase()}`,avatar:"👤",avatarData:null,coins:200,wins:0,losses:0,isGuest:true,createdAt:Date.now()};
              supaGuest(guestProfile.name);
              onDone(guestProfile);
            }} style={{
              background:"rgba(255,255,255,0.05)",
              border:"1.5px solid rgba(255,255,255,0.15)",
              borderRadius:10,
              color:"#aaa",
              cursor:"pointer",
              fontFamily:"'Press Start 2P',monospace",
              fontSize:"clamp(10px,2vw,13px)",
              padding:"clamp(11px,2.2vw,14px) clamp(20px,4vw,32px)",
              width:"100%",
              transition:"all 0.2s",
              letterSpacing:1,
            }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="rgba(255,255,255,0.3)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="#aaa";e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";}}>
              👤 PLAY AS GUEST
            </button>
            <div style={{color:"#333",fontSize:"clamp(7px,1.3vw,9px)",fontFamily:"'Press Start 2P',monospace",marginTop:8,lineHeight:1.8}}>
              Choose avatar &amp; starter · Sign in later to save
            </div>
          </div>
        </div>
        {/* Quick login — only show profiles that have a valid auth record */}
        {(()=>{
          const db=getDB();
          // Include profile if it has an auth db entry (email+password OR google) OR if it was Google-created
          const validProfiles=existing.filter(p=>{
            if(p.isGuest) return false;
            // check auth db by username match
            return Object.values(db).some(u=>u.username===p.name);
          });
          if(validProfiles.length===0) return null;
          return(
            <div style={{marginTop:20}}>
              <div style={{color:"#1a1a2a",fontSize:"clamp(8px,1.5vw,10px)",textAlign:"center",marginBottom:12,fontFamily:"'Press Start 2P',monospace"}}>— QUICK LOGIN —</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
                {validProfiles.slice(-5).map(p=>{
                  const authEntry=Object.values(db).find(u=>u.username===p.name);
                  const isGoogle=authEntry?.googleId;
                  return(
                    <div key={p.name} style={{position:"relative"}}>
                      <button onClick={()=>onDone(p)} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"clamp(10px,2vw,14px)",cursor:"pointer",textAlign:"center",minWidth:72,display:"block"}}>
                        <div style={{fontSize:"clamp(22px,4.5vw,30px)",marginBottom:4}}>
                          {p.avatarData?.type==="built"?<AvatarPreview hair={p.avatarData.hair} face={p.avatarData.face} skin={p.avatarData.skin} hairColor={p.avatarData.hairColor} eyes={p.avatarData.eyes} size={36}/>:p.avatar}
                        </div>
                        <div style={{color:"#aaa",fontSize:"clamp(7px,1.3vw,9px)",fontFamily:"'Press Start 2P',monospace"}}>{p.name}</div>
                        <div style={{color:"#333",fontSize:"clamp(6px,1vw,8px)",fontFamily:"'Press Start 2P',monospace",marginTop:2}}>{p.wins||0}W {p.losses||0}L</div>
                        {isGoogle&&<div style={{color:"#4FC3F7",fontSize:"6px",fontFamily:"'Press Start 2P',monospace",marginTop:2}}>G</div>}
                      </button>
                      {/* Remove from quick login */}
                      <button onClick={e=>{
                        e.stopPropagation();
                        const all=JSON.parse(localStorage.getItem("pkmn_profiles")||"[]");
                        localStorage.setItem("pkmn_profiles",JSON.stringify(all.filter(x=>x.name!==p.name)));
                        // force re-render by changing a dummy key — reload page section
                        window.location.reload();
                      }} style={{position:"absolute",top:-6,right:-6,background:"rgba(244,67,54,0.8)",border:"none",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:"9px",color:"#fff",fontFamily:"monospace",lineHeight:1}}>✕</button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function StarterScreen({onDone, allPokemon, onBack}){
  const [chosen, setChosen] = useState(null);
  const [genFilt, setGenFilt] = useState("all");
  const allStarters = allPokemon.filter(p=>STARTER_CHOICES.some(s=>s.id===p.id));
  const starters = genFilt==="all" ? allStarters : allStarters.filter(p=>{
    const sc=STARTER_CHOICES.find(s=>s.id===p.id);
    const gen=getGen(p.id);
    return genFilt==="all" || String(gen.g)===genFilt;
  });
  const GEN_LABELS={1:"Kanto",2:"Johto",3:"Hoenn",4:"Sinnoh",5:"Unova",6:"Kalos",7:"Alola",8:"Galar",9:"Paldea"};

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#05050d",padding:"20px"}}>
      {/* Back button for guests */}
      {onBack&&(
        <div style={{position:"fixed",top:14,left:14,zIndex:100}}>
          <button onClick={onBack} className="btn" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,padding:"7px 14px",color:"#888",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,1.8vw,12px)",display:"flex",alignItems:"center",gap:5}}>← LOGIN</button>
        </div>
      )}
      <div style={{fontSize:"clamp(11px,2.5vw,15px)",fontFamily:"'Press Start 2P',monospace",color:"#FFD54F",marginBottom:6,textAlign:"center"}}>🌟 CHOOSE YOUR STARTER!</div>
      <div style={{fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",color:"#555",marginBottom:16,textAlign:"center"}}>Your partner Pokémon — choose wisely!</div>

      {/* Gen filter tabs */}
      <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap",justifyContent:"center"}}>
        <button onClick={()=>setGenFilt("all")} style={{padding:"6px 10px",background:genFilt==="all"?"rgba(255,213,79,0.2)":"rgba(255,255,255,0.04)",border:`1px solid ${genFilt==="all"?"rgba(255,213,79,0.5)":"rgba(255,255,255,0.08)"}`,borderRadius:7,color:genFilt==="all"?"#FFD54F":"#444",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(7px,1.3vw,9px)"}}>ALL</button>
        {Object.entries(GEN_LABELS).map(([g,label])=>{
          const col=GENS[+g]?.col||"#888";
          return <button key={g} onClick={()=>setGenFilt(g)} style={{padding:"6px 10px",background:genFilt===g?`${col}28`:"rgba(255,255,255,0.04)",border:`1px solid ${genFilt===g?col+"66":"rgba(255,255,255,0.08)"}`,borderRadius:7,color:genFilt===g?col:"#333",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(7px,1.3vw,9px)"}}>G{g}</button>;
        })}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:10,maxWidth:820,width:"100%",marginBottom:24}}>
        {starters.map(p=>{
          const c=TC[p.types[0]]||"#888";
          const sel=chosen?.id===p.id;
          const gen=getGen(p.id);
          return(
            <div key={p.id} onClick={()=>setChosen(p)} style={{background:sel?`linear-gradient(160deg,rgba(255,213,79,0.15),rgba(255,107,53,0.1))`:"rgba(10,10,24,0.98)",border:`2px solid ${sel?"#FFD54F":`${c}33`}`,borderRadius:14,padding:"12px 8px",cursor:"pointer",textAlign:"center",transition:"all 0.18s",boxShadow:sel?"0 0 30px rgba(255,213,79,0.3)":"none",transform:sel?"scale(1.06)":"scale(1)",position:"relative"}}>
              <div style={{position:"absolute",top:4,right:4,fontSize:"7px",color:gen.col,fontFamily:"'Press Start 2P',monospace"}}>G{gen.g}</div>
              <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} style={{width:64,imageRendering:"pixelated",filter:`drop-shadow(0 0 8px ${c}99)`}}/>
              <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(8px,1.6vw,10px)",color:"#fff",marginBottom:4,textTransform:"capitalize"}}>{p.name}</div>
              <div style={{display:"flex",gap:3,justifyContent:"center",flexWrap:"wrap"}}>
                {p.types.map(t=><Badge key={t} type={t} small/>)}
              </div>
              {sel&&<div style={{marginTop:5,fontSize:"14px"}}>✅</div>}
            </div>
          );
        })}
      </div>

      <button onClick={()=>{ if(chosen) onDone(chosen); }} disabled={!chosen}
        style={{background:chosen?"linear-gradient(135deg,rgba(76,175,80,0.3),rgba(79,195,247,0.2))":"rgba(255,255,255,0.03)",border:`1.5px solid ${chosen?"rgba(76,175,80,0.6)":"rgba(255,255,255,0.1)"}`,borderRadius:12,padding:"14px 36px",color:chosen?"#fff":"#444",cursor:chosen?"pointer":"not-allowed",fontFamily:"'Press Start 2P',monospace",fontSize:"12px",transition:"all 0.2s"}}>
        {chosen?`I CHOOSE ${chosen.name.toUpperCase()}! →`:"← Select a starter"}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  POKÉMON SELECT CARD
// ══════════════════════════════════════════════════════════════════════
function PokemonCard({mon, onSelect, selected, unlocked, coins, onUnlock, cost, shopMode=false}){
  const col=TC[mon.types[0]]||"#888";
  const isLeg=LEGENDARY_IDS.has(mon.id);
  const isMega=!!MEGA_MAP[mon.id];
  const isGiga=GIGANTAMAX_IDS.has(mon.id);
  const gen=getGen(mon.id);
  const canAfford=(coins||0)>=cost;
  const locked=!unlocked;

  return(
    <div onClick={()=>{ if(!locked&&!shopMode) onSelect(mon); }}
      style={{
        background:locked?shopMode?"rgba(6,6,18,0.9)":"rgba(4,4,12,0.8)":selected?"rgba(255,213,79,0.12)":`linear-gradient(160deg,rgba(14,14,36,0.98),rgba(6,6,20,0.99))`,
        border:selected?`2px solid #FFD54F`:locked?`1px solid rgba(255,255,255,0.05)`:`1.5px solid ${isLeg?"#FFD54F55":isMega?"#CE93D855":`${col}33`}`,
        borderRadius:14,padding:"clamp(10px,2vw,14px) clamp(8px,1.5vw,12px)",
        cursor:locked&&!shopMode?"default":"pointer",
        transition:"all 0.18s",textAlign:"center",
        boxShadow:selected?"0 0 28px rgba(255,213,79,0.3)":isLeg?"0 2px 18px rgba(255,213,79,0.1)":"none",
        position:"relative",
        filter:locked&&!shopMode?"grayscale(0.8) brightness(0.4)":"none",
      }}>

      {/* Badges */}
      {isLeg&&<div style={{position:"absolute",top:5,left:5,fontSize:"clamp(9px,1.8vw,12px)"}}>⭐</div>}
      {isMega&&<div style={{position:"absolute",top:isLeg?20:5,left:5,fontSize:"clamp(9px,1.8vw,12px)"}}>💎</div>}
      {isGiga&&<div style={{position:"absolute",top:5,right:selected?22:5,fontSize:"clamp(9px,1.8vw,12px)"}}>⭕</div>}
      {selected&&<div style={{position:"absolute",top:5,right:5,fontSize:"clamp(12px,2vw,16px)"}}>✅</div>}
      <div style={{position:"absolute",top:5,right:isGiga||selected?22:5,fontSize:"clamp(6px,1vw,8px)",color:gen.col,fontFamily:"'Press Start 2P',monospace",opacity:0.8}}>G{gen.g}</div>

      {/* Sprite */}
      <div style={{position:"relative",display:"inline-block"}}>
        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.id}.png`}
          style={{width:"clamp(64px,11vw,84px)",imageRendering:"pixelated",filter:`drop-shadow(0 0 8px ${col}88)`,display:"block"}}/>
        {locked&&shopMode&&(
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)",borderRadius:8}}>
            <span style={{fontSize:"clamp(14px,2.5vw,20px)"}}>🔒</span>
          </div>
        )}
      </div>

      {/* Name — large and clearly readable */}
      <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,1.8vw,13px)",color:locked&&!shopMode?"#444":"#fff",marginBottom:3,textTransform:"capitalize",lineHeight:1.5,wordBreak:"break-word",marginTop:4}}>
        {mon.name}
      </div>
      <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(7px,1.2vw,9px)",color:"#2a2a4a",marginBottom:5}}>
        #{String(mon.id).padStart(3,"0")}
      </div>
      <div style={{display:"flex",gap:3,justifyContent:"center",flexWrap:"wrap",marginBottom:shopMode&&locked?6:0}}>
        {mon.types.map(t=><Badge key={t} type={t} small/>)}
      </div>

      {/* Shop mode: unlock button */}
      {shopMode&&locked&&(
        <button onClick={e=>{e.stopPropagation();onUnlock(mon);}} disabled={!canAfford}
          style={{marginTop:8,width:"100%",background:canAfford?"rgba(255,213,79,0.15)":"rgba(255,255,255,0.02)",border:`1.5px solid ${canAfford?"rgba(255,213,79,0.5)":"rgba(255,255,255,0.06)"}`,borderRadius:8,padding:"clamp(6px,1.2vw,9px)",color:canAfford?"#FFD54F":"#333",cursor:canAfford?"pointer":"not-allowed",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(8px,1.4vw,10px)",lineHeight:1.5}}>
          🔓 {cost}🪙
        </button>
      )}
      {shopMode&&!locked&&(
        <div style={{marginTop:6,color:"#4CAF50",fontSize:"clamp(7px,1.2vw,9px)",fontFamily:"'Press Start 2P',monospace"}}>✅ OWNED</div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  HALL OF FAME — proper ranked ladder with tiers
// ══════════════════════════════════════════════════════════════════════
function HallOfFame({onClose, currentName}){
  const [allPlayers, setAllPlayers] = useState(()=>{
    // Start with local profiles immediately
    return JSON.parse(localStorage.getItem("pkmn_profiles")||"[]").filter(p=>!p.isGuest);
  });
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    // Fetch global leaderboard from Supabase
    const SUPA_URL_HOF="https://hoqsdlpsqdtpvskbfafh.supabase.co";
    const SUPA_KEY_HOF="sb_publishable_-4k_spf5R3kfRVDWzF_38w_LMkv4ES2";
    fetch(`${SUPA_URL_HOF}/rest/v1/players?select=username,wins,losses,avatar&action=eq.stats_update&order=wins.desc&limit=100`,{
      headers:{"apikey":SUPA_KEY_HOF,"Authorization":`Bearer ${SUPA_KEY_HOF}`}
    })
    .then(r=>r.json())
    .then(rows=>{
      if(!Array.isArray(rows)) return;
      // Build a map of best stats per username from Supabase
      const supaMap={};
      rows.forEach(r=>{
        if(!r.username) return;
        const ex=supaMap[r.username];
        if(!ex||r.wins>ex.wins) supaMap[r.username]={name:r.username,wins:r.wins||0,losses:r.losses||0,avatar:r.avatar||"🔴"};
      });
      // Merge: local profiles take precedence for avatar/avatarData, supabase for stats
      const local=JSON.parse(localStorage.getItem("pkmn_profiles")||"[]").filter(p=>!p.isGuest);
      const localMap={};
      local.forEach(p=>{ localMap[p.name]=p; });
      // Combine: all supabase users + any local-only users
      const merged={...supaMap};
      local.forEach(p=>{ merged[p.name]={...supaMap[p.name],...p}; });
      setAllPlayers(Object.values(merged).filter(p=>!p.isGuest));
    })
    .catch(()=>{}) // silently keep local data on error
    .finally(()=>setLoading(false));
  },[]);

  // Score formula: wins * 100 + win_rate_bonus - losses * 10
  const scored = allPlayers.map(p=>{
    const total = (p.wins||0) + (p.losses||0);
    const wr = total>0 ? (p.wins||0)/total : 0;
    const score = (p.wins||0)*100 + Math.round(wr*500) - (p.losses||0)*10;
    return {...p, score: Math.max(0, score), wr: Math.round(wr*100)};
  });
  const ranked = [...scored].sort((a,b)=>b.score-a.score);

  // Tier system
  const getTier = (i, score) => {
    if(i===0) return {name:"CHAMPION",color:"#FFD700",bg:"rgba(255,215,0,0.12)",icon:"👑"};
    if(i<3)   return {name:"ELITE 4",color:"#C0C0C0",bg:"rgba(192,192,192,0.08)",icon:"⭐"};
    if(i<8)   return {name:"GYM LEADER",color:"#9C7DFF",bg:"rgba(156,125,255,0.07)",icon:"🏅"};
    if(i<15)  return {name:"ACE TRAINER",color:"#4FC3F7",bg:"rgba(79,195,247,0.07)",icon:"🎖️"};
    if(i<25)  return {name:"TRAINER",color:"#66BB6A",bg:"rgba(102,187,106,0.07)",icon:"🔰"};
    return      {name:"ROOKIE",color:"#555",bg:"transparent",icon:"🌱"};
  };

  const rankBadge = i => {
    if(i===0) return "🥇";
    if(i===1) return "🥈";
    if(i===2) return "🥉";
    return `#${i+1}`;
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.94)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:"16px"}} onClick={onClose}>
      <div style={{background:"#07070f",border:"1px solid rgba(255,213,79,0.3)",borderRadius:18,padding:"24px 20px",maxWidth:520,width:"100%",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 0 80px rgba(255,213,79,0.1)"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"16px",color:"#FFD54F",marginBottom:4}}>🏆 HALL OF FAME</div>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#333",marginBottom:4}}>🌐 GLOBAL TRAINER RANKINGS</div>
          {loading&&<div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:"#7C4DFF",marginBottom:8,animation:"pulse 1s infinite"}}>Loading global data…</div>}
          {/* Tier legend */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginBottom:4}}>
            {[{name:"CHAMPION",color:"#FFD700",icon:"👑"},{name:"ELITE 4",color:"#C0C0C0",icon:"⭐"},{name:"GYM LEADER",color:"#9C7DFF",icon:"🏅"},{name:"ACE",color:"#4FC3F7",icon:"🎖️"}].map(t=>(
              <div key={t.name} style={{fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:t.color,background:`${t.color}14`,border:`1px solid ${t.color}30`,borderRadius:5,padding:"3px 6px"}}>
                {t.icon} {t.name}
              </div>
            ))}
          </div>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:"#1e1e2e"}}>Score = Wins×100 + WinRate×500 - Losses×10</div>
        </div>

        {ranked.length===0 && (
          <div style={{color:"#222",fontSize:"10px",textAlign:"center",fontFamily:"'Press Start 2P',monospace",padding:28}}>
            No trainers yet!<br/>Start battling to appear here.
          </div>
        )}

        {ranked.map((p,i)=>{
          const tier = getTier(i, p.score);
          const isMe = currentName && p.name===currentName;
          const total = (p.wins||0)+(p.losses||0);
          return(
            <div key={p.name} style={{
              display:"flex",alignItems:"center",gap:10,
              padding:"11px 12px",
              borderRadius:10,marginBottom:6,
              background: isMe ? "rgba(124,77,255,0.12)" : tier.bg,
              border: isMe ? "1.5px solid rgba(124,77,255,0.5)" : i<3 ? `1.5px solid ${tier.color}35` : "1px solid rgba(255,255,255,0.04)",
              position:"relative",overflow:"hidden",
              transition:"all 0.2s"
            }}>
              {/* Rank glow for top 3 */}
              {i<3&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:tier.color,borderRadius:"3px 0 0 3px"}}/>}
              {isMe&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:"#7C4DFF",borderRadius:"3px 0 0 3px"}}/>}

              {/* Rank badge */}
              <div style={{minWidth:32,textAlign:"center"}}>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:i<3?"16px":"11px",color:tier.color}}>{rankBadge(i)}</div>
              </div>

              {/* Avatar */}
              <div style={{fontSize:"20px",minWidth:28,textAlign:"center"}}>
                {p.avatarData?.type==="built"
                  ? <AvatarPreview hair={p.avatarData.hair} face={p.avatarData.face} skin={p.avatarData.skin} hairColor={p.avatarData.hairColor} eyes={p.avatarData.eyes} size={28}/>
                  : p.avatar}
              </div>

              {/* Name + stats */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                  <div style={{color:isMe?"#9C7DFF":i<3?tier.color:"#ccc",fontSize:"10px",fontFamily:"'Press Start 2P',monospace",textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{p.name}</div>
                  {isMe&&<span style={{fontSize:"7px",color:"#7C4DFF",fontFamily:"'Press Start 2P',monospace",background:"rgba(124,77,255,0.2)",borderRadius:4,padding:"1px 4px"}}>YOU</span>}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <span style={{color:"#4CAF50",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>{p.wins||0}W</span>
                  <span style={{color:"#f44336",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>{p.losses||0}L</span>
                  <span style={{color:"#888",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>{p.wr}% WR</span>
                  {total>0&&<span style={{color:"#555",fontSize:"7px",fontFamily:"'Press Start 2P',monospace"}}>{total} battles</span>}
                </div>
              </div>

              {/* Tier + score */}
              <div style={{textAlign:"right",minWidth:60}}>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:tier.color,marginBottom:3}}>{tier.icon} {tier.name.split(" ")[0]}</div>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"9px",color:tier.color}}>{p.score}</div>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:"#222"}}>pts</div>
              </div>
            </div>
          );
        })}

        <button onClick={onClose} style={{width:"100%",marginTop:14,background:"rgba(255,213,79,0.06)",border:"1px solid rgba(255,213,79,0.2)",borderRadius:10,padding:"11px",color:"#FFD54F",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px"}}>CLOSE ×</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  AVATAR DISPLAY helper
// ══════════════════════════════════════════════════════════════════════
function ProfileAvatar({profile, size=32}){
  if(!profile) return null;
  if(profile.avatarData?.type==="built"){
    return <AvatarPreview hair={profile.avatarData.hair} face={profile.avatarData.face} skin={profile.avatarData.skin} hairColor={profile.avatarData.hairColor} eyes={profile.avatarData.eyes} size={size}/>;
  }
  return <span style={{fontSize:Math.round(size*0.75)+"px"}}>{profile.avatar}</span>;
}

// ══════════════════════════════════════════════════════════════════════
//  POKÉDEX SCREEN
// ══════════════════════════════════════════════════════════════════════
function PokedexScreen({allPokemon, unlockedIds, starterPokemon, onClose, isGuest}){
  const [search,setSearch]=useState("");
  const [genFilt,setGenFilt]=useState("all");
  const owned=useMemo(()=>{
    const s=new Set(unlockedIds);
    if(starterPokemon) s.add(starterPokemon.id);
    return s;
  },[unlockedIds,starterPokemon]);

  // Guests only see their owned Pokémon — no silhouettes of everything else
  const baseList = isGuest ? allPokemon.filter(p=>owned.has(p.id)) : allPokemon;

  const filtered=useMemo(()=>{
    let f=baseList;
    if(search) f=f.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||String(p.id).includes(search));
    if(genFilt!=="all"){ const g=GENS[+genFilt]; if(g) f=f.filter(p=>p.id>=g.range[0]&&p.id<=g.range[1]); }
    return f;
  },[baseList,search,genFilt]);

  const total=isGuest?owned.size:allPokemon.length;
  const ownedCount=[...owned].filter(id=>allPokemon.some(p=>p.id===id)).length;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:400,display:"flex",flexDirection:"column",alignItems:"center",padding:"16px",overflowY:"auto"}}>
      <div style={{width:"100%",maxWidth:860}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"14px",color:"#4FC3F7",marginBottom:4}}>📖 POKÉDEX</div>
            {isGuest
              ? <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#555"}}>Your Pokémon: <span style={{color:"#FFD54F"}}>{ownedCount}</span> caught · <span style={{color:"#4FC3F7"}}>Register to track all 1,010!</span></div>
              : <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#333"}}>Caught: <span style={{color:"#FFD54F"}}>{ownedCount}</span> / {total}</div>
            }
          </div>
          {/* Progress bar — only for registered users */}
          {!isGuest&&<div style={{flex:1,maxWidth:200}}>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:4,height:8,overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)"}}>
              <div style={{width:`${(ownedCount/Math.max(1,total))*100}%`,background:"linear-gradient(90deg,#4FC3F7,#7C4DFF)",height:"100%",borderRadius:4,transition:"width 0.5s"}}/>
            </div>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:"#333",marginTop:3,textAlign:"right"}}>{Math.round((ownedCount/Math.max(1,total))*100)}% complete</div>
          </div>}
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 14px",color:"#888",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{flex:"1 1 120px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 12px",color:"#fff",fontSize:"10px",fontFamily:"'Press Start 2P',monospace"}}/>
          <select value={genFilt} onChange={e=>setGenFilt(e.target.value)} style={{background:"rgba(10,10,28,0.98)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px",color:"#888",fontSize:"9px",fontFamily:"'Press Start 2P',monospace"}}>
            <option value="all">All Gens</option>
            {Object.entries(GENS).map(([g,d])=><option key={g} value={g}>Gen {g} {d.sub}</option>)}
          </select>
        </div>

        {/* Guest empty state */}
        {isGuest&&filtered.length===0&&(
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <div style={{fontSize:"48px",marginBottom:12}}>📖</div>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"11px",color:"#333",marginBottom:8}}>No Pokémon yet!</div>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#222",marginBottom:4}}>Choose a starter to get your first one.</div>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#4FC3F7",marginTop:8}}>Register an account to unlock more!</div>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:6}}>
          {filtered.map(p=>{
            const isOwned=owned.has(p.id);
            const gen=getGen(p.id);
            return(
              <div key={p.id} style={{background:isOwned?"rgba(14,14,36,0.98)":"rgba(4,4,10,0.8)",border:`1px solid ${isOwned?gen.col+"44":"rgba(255,255,255,0.04)"}`,borderRadius:10,padding:"8px 4px",textAlign:"center",position:"relative",transition:"all 0.15s"}}>
                {isOwned&&<div style={{position:"absolute",top:3,right:3,fontSize:"7px",color:gen.col}}>●</div>}
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                  style={{width:48,imageRendering:"pixelated",filter:isOwned?"none":"brightness(0) opacity(0.18)",transition:"filter 0.2s"}}/>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:isOwned?"#ccc":"#222",textTransform:"capitalize",marginTop:2,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{isOwned?p.name:`#${String(p.id).padStart(3,"0")}`}</div>
                {isOwned&&<div style={{display:"flex",gap:2,justifyContent:"center",flexWrap:"wrap",marginTop:2}}>{p.types.map(t=><span key={t} style={{fontSize:"5px",color:TC[t]||"#888",background:`${TC[t]||"#888"}18`,borderRadius:3,padding:"1px 3px",fontFamily:"'Press Start 2P',monospace"}}>{t}</span>)}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  TRAINER CARD
// ══════════════════════════════════════════════════════════════════════
function TrainerCard({profile, starterPokemon, winStreak, unlockedIds, onClose}){
  const [copied,setCopied]=useState(false);
  const [shared,setShared]=useState(false);
  const profiles=JSON.parse(localStorage.getItem("pkmn_profiles")||"[]");
  const scored=profiles.map(p=>{ const t=(p.wins||0)+(p.losses||0); const wr=t>0?(p.wins||0)/t:0; return {...p,score:(p.wins||0)*100+Math.round(wr*500)-(p.losses||0)*10}; });
  const ranked=[...scored].sort((a,b)=>b.score-a.score);
  const myRank=ranked.findIndex(p=>p.name===profile?.name)+1;
  const total=(profile?.wins||0)+(profile?.losses||0);
  const wr=total>0?Math.round(((profile?.wins||0)/total)*100):0;
  // Count owned: unlockedIds always includes the starter (added on starter selection).
  // Never add +1 for the starter again — that causes the double-count bug.
  const ownedCount = unlockedIds.size;
  const tier=myRank===1?"CHAMPION":myRank<=3?"ELITE 4":myRank<=8?"GYM LEADER":myRank<=15?"ACE TRAINER":"TRAINER";
  const tierColor=myRank===1?"#FFD700":myRank<=3?"#C0C0C0":myRank<=8?"#9C7DFF":myRank<=15?"#4FC3F7":"#66BB6A";

  const shareText=`⚡ Pokémon Battle Arena — Trainer Card
👤 ${profile?.name} · ${tier}
🏆 Rank #${myRank||"—"} · ${profile?.wins||0}W ${profile?.losses||0}L · ${wr}% WR
🔥 ${winStreak} win streak · ${ownedCount} Pokémon caught
🎮 Play at: pokemon-battle-simulator-xnmd.vercel.app`;

  async function handleShare(){
    // Try Web Share API first (works on mobile + some desktop)
    if(navigator.share){
      try{
        await navigator.share({title:"My Pokémon Trainer Card",text:shareText});
        setShared(true); setTimeout(()=>setShared(false),2500);
        return;
      }catch(e){}
    }
    // Fallback: copy to clipboard
    try{
      await navigator.clipboard.writeText(shareText);
      setCopied(true); setTimeout(()=>setCopied(false),2500);
    }catch(e){
      // Last resort: prompt
      window.prompt("Copy your trainer card:",shareText);
    }
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(160deg,#0a0a22,#04040e)",border:`2px solid ${tierColor}55`,borderRadius:20,padding:"clamp(20px,4vw,28px) clamp(18px,3.5vw,24px)",maxWidth:400,width:"100%",boxShadow:`0 0 80px ${tierColor}22,0 0 40px rgba(0,0,0,0.8)`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${tierColor}08,transparent,${tierColor}05)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${tierColor},transparent)`}}/>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"clamp(14px,3vw,20px)"}}>
          <div>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(8px,1.6vw,11px)",color:tierColor,marginBottom:5,letterSpacing:2}}>{tier}</div>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(14px,3vw,20px)",color:"#fff"}}>{profile?.name}</div>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(7px,1.3vw,9px)",color:"#333",marginTop:4}}>Rank #{myRank||"—"}</div>
          </div>
          <ProfileAvatar profile={profile} size={52}/>
        </div>

        {/* Starter */}
        {starterPokemon&&(
          <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"clamp(8px,1.5vw,12px)",marginBottom:"clamp(12px,2.5vw,16px)"}}>
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${starterPokemon.id}.png`} style={{width:"clamp(36px,7vw,48px)",imageRendering:"pixelated"}}/>
            <div>
              <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(6px,1.2vw,8px)",color:"#444",marginBottom:3}}>STARTER PARTNER</div>
              <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,1.8vw,12px)",color:"#FFD54F",textTransform:"capitalize"}}>{starterPokemon.name}</div>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(6px,1.2vw,9px)",marginBottom:"clamp(14px,3vw,18px)"}}>
          {[
            {label:"WIN STREAK",val:`${winStreak}🔥`,col:"#FF6B35"},
            {label:"WIN RATE",val:`${wr}%`,col:"#FFD54F"},
            {label:"WINS",val:profile?.wins||0,col:"#4CAF50"},
            {label:"LOSSES",val:profile?.losses||0,col:"#f44336"},
            {label:"POKÉDEX",val:`${ownedCount} caught`,col:"#4FC3F7"},
            {label:"BATTLES",val:total,col:"#888"},
          ].map(({label,val,col})=>(
            <div key={label} style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"clamp(8px,1.5vw,11px)"}}>
              <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(6px,1vw,7px)",color:"#333",marginBottom:4}}>{label}</div>
              <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(10px,2vw,13px)",color:col}}>{val}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{display:"flex",gap:8}}>
          <button onClick={handleShare} className="btn" style={{flex:2,background:copied||shared?`${tierColor}25`:"rgba(255,255,255,0.05)",border:`1.5px solid ${copied||shared?tierColor:"rgba(255,255,255,0.15)"}`,borderRadius:10,padding:"clamp(10px,2vw,13px)",color:copied||shared?tierColor:"#ccc",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,1.8vw,12px)",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {shared?"✅ SHARED!":copied?"✅ COPIED!":"📤 SHARE CARD"}
          </button>
          <button onClick={onClose} className="btn" style={{flex:1,background:`${tierColor}18`,border:`1.5px solid ${tierColor}44`,borderRadius:10,padding:"clamp(10px,2vw,13px)",color:tierColor,cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,1.8vw,12px)"}}>✕ CLOSE</button>
        </div>

        {/* Share preview text */}
        {(copied||shared)&&(
          <div style={{marginTop:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"10px 12px"}}>
            <div style={{color:"#555",fontSize:"clamp(6px,1vw,8px)",fontFamily:"monospace",lineHeight:1.8,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{shareText}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  DAILY CHALLENGES SCREEN
// ══════════════════════════════════════════════════════════════════════
function DailyChallengesScreen({challenges, onClose}){
  const totalReward=challenges.reduce((a,c)=>a+(c.done?c.reward:0),0);
  const remaining=challenges.filter(c=>!c.done).length;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.94)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(160deg,#0a0a22,#04040e)",border:"2px solid rgba(255,213,79,0.3)",borderRadius:20,padding:"28px 24px",maxWidth:440,width:"100%",boxShadow:"0 0 60px rgba(255,213,79,0.1)"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"14px",color:"#FFD54F",marginBottom:4}}>📅 DAILY CHALLENGES</div>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#333",marginBottom:8}}>Resets at midnight · {remaining} remaining</div>
          {totalReward>0&&<div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"9px",color:"#4CAF50"}}>+{totalReward}🪙 earned today!</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {challenges.map((ch,i)=>(
            <div key={i} style={{background:ch.done?"rgba(76,175,80,0.08)":"rgba(255,255,255,0.025)",border:`1.5px solid ${ch.done?"rgba(76,175,80,0.4)":"rgba(255,255,255,0.07)"}`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,transition:"all 0.2s"}}>
              <div style={{fontSize:"22px",minWidth:28}}>{ch.done?"✅":ch.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"9px",color:ch.done?"#4CAF50":"#ccc",marginBottom:4,textDecoration:ch.done?"line-through":"none"}}>{ch.desc}</div>
                {/* Progress bar for count goals */}
                {ch.countGoal&&!ch.done&&(
                  <div style={{background:"rgba(255,255,255,0.06)",borderRadius:3,height:5,overflow:"hidden",marginBottom:3}}>
                    <div style={{width:`${Math.min(100,((ch.progress||0)/ch.countGoal)*100)}%`,background:"#FFD54F",height:"100%",borderRadius:3,transition:"width 0.4s"}}/>
                  </div>
                )}
                {ch.countGoal&&<div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:"#444"}}>{ch.progress||0}/{ch.countGoal}</div>}
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"9px",color:ch.done?"#4CAF50":"#FFD54F"}}>+{ch.reward}</div>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:"#333"}}>🪙</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{width:"100%",background:"rgba(255,213,79,0.07)",border:"1px solid rgba(255,213,79,0.25)",borderRadius:10,padding:"11px",color:"#FFD54F",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px"}}>CLOSE</button>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════
//  MULTIPLAYER — FULL PAGE COMING SOON SCREEN
// ══════════════════════════════════════════════════════════════════════
function MultiplayerComingSoonPage({onBack}){
  const [frame, setFrame] = useState(0);
  useEffect(()=>{
    const id = setInterval(()=>setFrame(f=>f+1), 100);
    return ()=>clearInterval(id);
  },[]);

  const glowPulse = 0.5 + 0.5 * Math.abs(Math.sin(frame * 0.05));
  const textPulse = 0.65 + 0.35 * Math.abs(Math.sin(frame * 0.035));
  const dots = '.'.repeat(Math.floor(frame / 12) % 4);

  const auras = [0,1,2,3,4,5].map(i=>({
    x: 50 + Math.cos(frame * 0.012 + i * Math.PI/3) * (20 + i*5),
    y: 50 + Math.sin(frame * 0.016 + i * Math.PI/3) * (14 + i*2),
    color: ['rgba(124,77,255,','rgba(79,195,247,','rgba(240,98,146,',
            'rgba(255,213,79,','rgba(102,187,106,','rgba(255,107,53,'][i],
    size: 220 + i*55,
    alpha: (0.10 + glowPulse * 0.07).toFixed(2),
  }));

  const features = [
    {icon:'⚔️', title:'PvP Battles',  desc:'Fight real trainers online',   col:'#EF5350'},
    {icon:'🏆', title:'Ranked Mode',   desc:'Climb the global leaderboard', col:'#FFD54F'},
    {icon:'🎲', title:'Room Codes',    desc:'Private battles with friends', col:'#7C4DFF'},
    {icon:'💬', title:'Battle Chat',   desc:'Talk smack mid-fight',         col:'#4FC3F7'},
  ];

  return(
    <div style={{
      width:'100%',
      height:'100vh',        /* exactly one viewport height — no scroll */
      maxHeight:'100vh',
      overflow:'hidden',     /* this page only: lock scroll */
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'center',
      background:'#05050d',
      position:'relative',
      fontFamily:"'Press Start 2P',monospace",
    }}>

      {/* Aura blobs */}
      {auras.map((a,i)=>(
        <div key={i} style={{
          position:'absolute',
          left:a.x+'%', top:a.y+'%',
          width:a.size+'px', height:a.size+'px',
          transform:'translate(-50%,-50%)',
          borderRadius:'50%',
          background:'radial-gradient(circle, '+a.color+a.alpha+'), transparent 70%)',
          pointerEvents:'none', zIndex:0,
        }}/>
      ))}

      {/* Grid */}
      <div style={{
        position:'absolute', inset:0, zIndex:0, pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(124,77,255,0.04)1px,transparent 1px),linear-gradient(90deg,rgba(124,77,255,0.04)1px,transparent 1px)',
        backgroundSize:'40px 40px',
      }}/>

      {/* ← HOME button — top-left floating, matches app style */}
      <div style={{position:'absolute', top:14, left:14, zIndex:10}}>
        <button onClick={onBack} className='btn' style={{
          background:'rgba(255,255,255,0.04)',
          border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:9,
          padding:'7px 14px',
          color:'#888', cursor:'pointer',
          fontSize:'clamp(9px,1.8vw,12px)',
          fontFamily:"'Press Start 2P',monospace",
          display:'flex', alignItems:'center', gap:5,
          letterSpacing:1,
        }}>← HOME</button>
      </div>

      {/* Content — compact, fits in one screen */}
      <div style={{
        position:'relative', zIndex:1,
        display:'flex', flexDirection:'column',
        alignItems:'center',
        gap:'clamp(12px,1.8vh,24px)',
        width:'100%', maxWidth:620,
        padding:'0 clamp(20px,4vw,40px)',
      }}>

        {/* VS icons */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'clamp(32px,7vw,80px)'}}>
          {[{emoji:'🔴',shadow:'rgba(240,98,146,0.9)'},{emoji:'🔵',shadow:'rgba(79,195,247,0.9)'}].map((t,i)=>(
            <div key={i} style={{
              fontSize:'clamp(42px,7vw,68px)',
              filter:'drop-shadow(0 0 '+Math.round(10+glowPulse*22)+'px '+t.shadow+')',
              transform:'translateY('+Math.sin(frame*0.04+i*Math.PI)*9+'px)',
              transition:'transform 0.1s',
              lineHeight:1,
            }}>{t.emoji}</div>
          ))}
        </div>

        {/* Heading */}
        <div style={{textAlign:'center'}}>
          <div style={{
            fontSize:'clamp(24px,4.2vw,46px)',
            background:'linear-gradient(135deg,#7C4DFF,#4FC3F7,#F06292)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            letterSpacing:'clamp(3px,0.5vw,7px)',
            marginBottom:'clamp(7px,1vh,12px)',
            lineHeight:1.2,
          }}>MULTIPLAYER</div>
          <div style={{
            fontSize:'clamp(13px,2.4vw,24px)',
            color:'rgba(255,213,79,'+textPulse.toFixed(2)+')',
            textShadow:'0 0 '+Math.round(14+glowPulse*22)+'px rgba(255,213,79,0.85), 0 0 50px rgba(255,107,53,0.5)',
            letterSpacing:'clamp(3px,0.6vw,6px)',
          }}>{'COMING SOON'+dots}</div>
        </div>

        {/* Progress bar */}
        <div style={{width:'100%', maxWidth:420}}>
          <div style={{background:'rgba(255,255,255,0.06)',borderRadius:8,height:9,overflow:'hidden',border:'1px solid rgba(124,77,255,0.18)'}}>
            <div style={{
              width:(42+28*Math.abs(Math.sin(frame*0.018)))+'%',
              height:'100%',
              background:'linear-gradient(90deg,#7C4DFF,#4FC3F7,#F06292,#FFD54F)',
              borderRadius:8, boxShadow:'0 0 12px rgba(124,77,255,0.8)',
              transition:'width 0.15s ease',
            }}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:5,fontSize:'clamp(6px,1vw,8px)',color:'#2a2a3a'}}>
            <span>IN DEVELOPMENT</span>
            <span>{'~'+Math.round(42+28*Math.abs(Math.sin(frame*0.018)))+'%'}</span>
          </div>
        </div>

        {/* Feature cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'clamp(8px,1.2vw,14px)',width:'100%'}}>
          {features.map((f,i)=>(
            <div key={i} style={{
              background:'rgba(8,8,24,0.88)',
              border:'1px solid '+f.col+'30',
              borderRadius:12,
              padding:'clamp(12px,1.6vh,18px) clamp(12px,1.8vw,18px)',
              display:'flex', alignItems:'center',
              gap:'clamp(10px,1.4vw,14px)',
              backdropFilter:'blur(4px)',
            }}>
              <div style={{fontSize:'clamp(18px,2.8vw,26px)',minWidth:'clamp(24px,3.5vw,32px)',filter:'drop-shadow(0 0 7px '+f.col+'99)',flexShrink:0}}>{f.icon}</div>
              <div>
                <div style={{color:'#ccc',fontSize:'clamp(8px,1.3vw,11px)',marginBottom:4,lineHeight:1.5}}>{f.title}</div>
                <div style={{color:'#444',fontSize:'clamp(6px,0.9vw,8px)',lineHeight:1.8}}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{textAlign:'center',color:'#252535',fontSize:'clamp(6px,1vw,9px)',lineHeight:2}}>
          We're building something epic. Stay tuned for updates!
        </div>

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  PROFILE SCREEN — edit avatar, username, password, email
// ══════════════════════════════════════════════════════════════════════
function ProfileScreen({profile, onSave, onBack}){
  const [tab,setTab]=useState("avatar"); // "avatar" | "account"
  const [builderMode,setBuilderMode]=useState(profile?.avatarData?.type==="built");
  const [emojiAvatar,setEmojiAvatar]=useState(profile?.avatar||"🔴");
  const [hair,setHair]=useState(profile?.avatarData?.hair||"short-dark");
  const [face,setFace]=useState(profile?.avatarData?.face||"round");
  const [skin,setSkin]=useState(profile?.avatarData?.skin||"#FDDBB4");
  const [hairColor,setHairColor]=useState(profile?.avatarData?.hairColor||"#1a0a00");
  const [eyes,setEyes]=useState(profile?.avatarData?.eyes||"👀");
  // Account fields
  const [newUsername,setNewUsername]=useState(profile?.name||"");
  const [newEmail,setNewEmail]=useState("");
  const [newPass,setNewPass]=useState("");
  const [confirmPass,setConfirmPass]=useState("");
  const [verifyCode,setVerifyCode]=useState("");
  const [sentCode,setSentCode]=useState(null); // simulated code
  const [verifyField,setVerifyField]=useState(null); // "email"|"password"
  const [msg,setMsg]=useState({text:"",ok:true});
  const [saving,setSaving]=useState(false);

  const EMOJIS=["🔴","🔵","🟡","🟢","🟣","🟠","⚫","⚪","🌟","🔥","💧","⚡","🌿","❄️","👾","🎮","🦊","🐉","🦁","🐺","🦅","🌙","☀️","🎯","💀","👑","🎃","🤖","🦋","🐬"];
  const HAIR_OPTS=["short-dark","long-dark","short-blonde","long-blonde","short-red","curly-brown","afro-black","braids-brown","spiky-blue"];
  const HAIR_COLS=["#1a0a00","#3b1f00","#8B4513","#D4A017","#C0392B","#F0F0F0","#2C3E50","#9B59B6","#1ABC9C"];
  const SKIN_OPTS=["#FDDBB4","#EDB98A","#D08B5B","#AE5D29","#694C3B","#F2DCC9","#FDEDCA","#C68642"];
  const EYE_OPTS=["👀","🔵","🟤","🟢","⚫","🔴","💜","🌟"];

  function getDB(){try{return JSON.parse(localStorage.getItem("pkmn_auth_db")||"{}")}catch{return{}}}
  function saveDB(db){localStorage.setItem("pkmn_auth_db",JSON.stringify(db));}
  function hash(p){let h=0;for(let i=0;i<p.length;i++){h=(h<<5)-h+p.charCodeAt(i);h|=0;}return String(h);}

  function saveAvatar(){
    setSaving(true);
    const avatarData=builderMode?{type:"built",hair,face,skin,hairColor,eyes}:{type:"emoji",emoji:emojiAvatar};
    const av=builderMode?"[built]":emojiAvatar;
    // Update auth db
    const db=getDB();
    const entry=Object.values(db).find(u=>u.username===profile.name);
    if(entry){ const key=Object.keys(db).find(k=>db[k].username===profile.name); db[key]={...db[key],avatar:av,avatarData}; saveDB(db); }
    // Update profile
    const updated={...profile,avatar:av,avatarData};
    onSave(updated);
    setMsg({text:"✅ Avatar saved!",ok:true});
    setSaving(false);
  }

  function saveUsername(){
    const u=newUsername.trim();
    if(!u||u===profile.name){setMsg({text:"Enter a new username",ok:false});return;}
    if(u.length<2||u.length>16){setMsg({text:"Username: 2–16 characters",ok:false});return;}
    if(!/^[a-zA-Z0-9_-]+$/.test(u)){setMsg({text:"Letters, numbers, _ - only",ok:false});return;}
    const db=getDB();
    if(Object.values(db).find(x=>x.username.toLowerCase()===u.toLowerCase()&&x.username!==profile.name)){setMsg({text:"Username taken!",ok:false});return;}
    // Update auth db
    const entry=Object.values(db).find(x=>x.username===profile.name);
    if(entry){ const key=Object.keys(db).find(k=>db[k].username===profile.name); db[key]={...db[key],username:u}; saveDB(db); }
    // Update profiles list
    const profiles=JSON.parse(localStorage.getItem("pkmn_profiles")||"[]");
    localStorage.setItem("pkmn_profiles",JSON.stringify(profiles.map(p=>p.name===profile.name?{...p,name:u}:p)));
    onSave({...profile,name:u});
    setMsg({text:"✅ Username updated!",ok:true});
  }

  function requestEmailChange(){
    if(!newEmail.includes("@")||!newEmail.includes(".")){setMsg({text:"Enter a valid email",ok:false});return;}
    const code=Math.floor(100000+Math.random()*900000).toString();
    setSentCode(code); setVerifyField("email");
    if(window.emailjs){
      window.emailjs.send("service_hjpc4ci","template_y5vlzuf",{
        to_email: newEmail,
        verification_code: code,
        username: profile?.name,
      },"rUzcEDHNBzkCWPmBs").catch(()=>{});
    }
    setMsg({text:"📧 Verification code sent to your email!",ok:true});
  }

  function requestPasswordChange(){
    if(newPass.length<6){setMsg({text:"Password needs 6+ characters",ok:false});return;}
    if(newPass!==confirmPass){setMsg({text:"Passwords don't match",ok:false});return;}
    const code=Math.floor(100000+Math.random()*900000).toString();
    setSentCode(code); setVerifyField("password");
    const db=getDB();
    const entry=Object.values(db).find(u=>u.username===profile?.name);
    if(window.emailjs&&entry?.email){
      window.emailjs.send("service_hjpc4ci","template_y5vlzuf",{
        to_email: entry.email,
        verification_code: code,
        username: profile?.name,
      },"rUzcEDHNBzkCWPmBs").catch(()=>{});
    }
    setMsg({text:"📧 Verification code sent to your email!",ok:true});
  }

  function submitVerification(){
    if(verifyCode.trim()!==sentCode){setMsg({text:"Wrong code. Try again.",ok:false});return;}
    const db=getDB();
    const key=Object.keys(db).find(k=>db[k].username===profile.name);
    if(!key){setMsg({text:"Account not found",ok:false});return;}
    if(verifyField==="email"){
      db[newEmail]={...db[key]}; delete db[key]; db[newEmail].email=newEmail;
      saveDB(db);
      setMsg({text:"✅ Email updated!",ok:true});
    } else {
      db[key]={...db[key],password:hash(newPass)};
      saveDB(db);
      setMsg({text:"✅ Password updated!",ok:true});
    }
    setSentCode(null); setVerifyField(null); setVerifyCode(""); setNewPass(""); setConfirmPass(""); setNewEmail("");
  }

  const inputStyle={width:"100%",background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(124,77,255,0.3)",borderRadius:10,padding:"clamp(10px,2vw,13px)",color:"#fff",fontSize:"clamp(11px,2vw,14px)",fontFamily:"'Press Start 2P',monospace",marginBottom:8};
  const btnStyle=(col="#7C4DFF")=>({width:"100%",background:`rgba(${col==="green"?"76,175,80":"124,77,255"},0.2)`,border:`1.5px solid rgba(${col==="green"?"76,175,80":"124,77,255"},0.5)`,borderRadius:10,padding:"clamp(11px,2.2vw,14px)",color:"#fff",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(10px,1.8vw,13px)",marginTop:4});

  return(
    <div style={{width:"100%",maxWidth:580,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:"clamp(13px,3vw,20px)",color:"#FFD54F",fontFamily:"'Press Start 2P',monospace",marginBottom:4}}>👤 MY PROFILE</div>
        <div style={{color:"#444",fontSize:"9px",fontFamily:"'Press Start 2P',monospace"}}>{profile?.name}</div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:20,background:"rgba(0,0,0,0.3)",borderRadius:12,padding:4}}>
        {[["avatar","🎭 AVATAR"],["account","⚙️ ACCOUNT"]].map(([t,lbl])=>(
          <button key={t} onClick={()=>{setTab(t);setMsg({text:"",ok:true});}} style={{flex:1,padding:"clamp(10px,2vw,13px)",background:tab===t?"rgba(124,77,255,0.4)":"transparent",border:`1px solid ${tab===t?"rgba(124,77,255,0.6)":"transparent"}`,borderRadius:10,color:tab===t?"#fff":"#555",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,1.8vw,12px)"}}>{lbl}</button>
        ))}
      </div>

      <div style={{background:"rgba(8,8,24,0.97)",border:"1px solid rgba(124,77,255,0.25)",borderRadius:20,padding:"clamp(18px,4vw,28px)"}}>

        {/* ── AVATAR TAB ── */}
        {tab==="avatar"&&(
          <>
            <div style={{display:"flex",gap:6,marginBottom:18,background:"rgba(0,0,0,0.25)",borderRadius:10,padding:4}}>
              {[["🎭 EMOJI",false],["✏️ BUILD",true]].map(([lbl,bm])=>(
                <button key={lbl} onClick={()=>setBuilderMode(bm)} style={{flex:1,padding:"clamp(8px,1.6vw,11px)",background:builderMode===bm?"rgba(124,77,255,0.35)":"transparent",border:`1.5px solid ${builderMode===bm?"rgba(124,77,255,0.7)":"transparent"}`,borderRadius:8,color:builderMode===bm?"#fff":"#555",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(8px,1.5vw,10px)"}}>{lbl}</button>
              ))}
            </div>
            {!builderMode?(
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:16}}>
                {EMOJIS.map(a=>(
                  <button key={a} onClick={()=>setEmojiAvatar(a)} style={{aspectRatio:"1",background:emojiAvatar===a?"rgba(124,77,255,0.3)":"rgba(255,255,255,0.04)",border:`2px solid ${emojiAvatar===a?"rgba(124,77,255,0.8)":"rgba(255,255,255,0.08)"}`,borderRadius:10,cursor:"pointer",fontSize:"clamp(18px,3.5vw,24px)",transform:emojiAvatar===a?"scale(1.12)":"scale(1)",transition:"all 0.14s",display:"flex",alignItems:"center",justifyContent:"center"}}>{a}</button>
                ))}
              </div>
            ):(
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
                  <div style={{background:"rgba(124,77,255,0.08)",border:"1px solid rgba(124,77,255,0.2)",borderRadius:16,padding:16,display:"inline-flex",flexDirection:"column",alignItems:"center",gap:8}}>
                    <AvatarPreview hair={hair} face={face} skin={skin} hairColor={hairColor} eyes={eyes} size={90}/>
                    <div style={{color:"#ccc",fontSize:"10px",fontFamily:"'Press Start 2P',monospace"}}>{profile?.name}</div>
                  </div>
                </div>
                {[
                  {label:"FACE SHAPE",opts:["round","oval","square","heart"],val:face,set:setFace},
                ].map(({label,opts,val,set})=>(
                  <div key={label} style={{marginBottom:12}}>
                    <div style={{color:"#555",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:7}}>{label}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{opts.map(o=><button key={o} onClick={()=>set(o)} style={{padding:"7px 12px",background:val===o?"rgba(124,77,255,0.3)":"rgba(255,255,255,0.04)",border:`1.5px solid ${val===o?"rgba(124,77,255,0.7)":"rgba(255,255,255,0.1)"}`,borderRadius:8,color:val===o?"#fff":"#666",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(7px,1.3vw,9px)",textTransform:"capitalize"}}>{o}</button>)}</div>
                  </div>
                ))}
                <div style={{marginBottom:12}}>
                  <div style={{color:"#555",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:7}}>HAIR STYLE</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{HAIR_OPTS.map(h=><button key={h} onClick={()=>setHair(h)} style={{padding:"6px 10px",background:hair===h?"rgba(124,77,255,0.3)":"rgba(255,255,255,0.04)",border:`1.5px solid ${hair===h?"rgba(124,77,255,0.7)":"rgba(255,255,255,0.1)"}`,borderRadius:7,color:hair===h?"#fff":"#666",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(6px,1.1vw,8px)"}}>{h.replace(/-/g," ")}</button>)}</div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{color:"#555",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:7}}>HAIR COLOR</div>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{HAIR_COLS.map(c=><button key={c} onClick={()=>setHairColor(c)} style={{width:28,height:28,background:c,border:`2.5px solid ${hairColor===c?"#fff":"rgba(255,255,255,0.1)"}`,borderRadius:"50%",cursor:"pointer",transform:hairColor===c?"scale(1.25)":"scale(1)",transition:"transform 0.14s"}}/>)}</div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{color:"#555",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:7}}>SKIN TONE</div>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{SKIN_OPTS.map(c=><button key={c} onClick={()=>setSkin(c)} style={{width:28,height:28,background:c,border:`2.5px solid ${skin===c?"#fff":"rgba(255,255,255,0.1)"}`,borderRadius:"50%",cursor:"pointer",transform:skin===c?"scale(1.25)":"scale(1)",transition:"transform 0.14s"}}/>)}</div>
                </div>
                <div style={{marginBottom:8}}>
                  <div style={{color:"#555",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:7}}>EYES</div>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{EYE_OPTS.map(e=><button key={e} onClick={()=>setEyes(e)} style={{padding:"7px",background:eyes===e?"rgba(124,77,255,0.3)":"rgba(255,255,255,0.04)",border:`1.5px solid ${eyes===e?"rgba(124,77,255,0.7)":"rgba(255,255,255,0.08)"}`,borderRadius:9,cursor:"pointer",fontSize:"clamp(16px,3vw,22px)",transition:"all 0.14s",transform:eyes===e?"scale(1.12)":"scale(1)"}}>{e}</button>)}</div>
                </div>
              </div>
            )}
            <button onClick={saveAvatar} disabled={saving} style={btnStyle("green")}>💾 SAVE AVATAR</button>
          </>
        )}

        {/* ── ACCOUNT TAB ── */}
        {tab==="account"&&(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>

            {/* Username */}
            <div>
              <div style={{color:"#888",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:8}}>USERNAME</div>
              <input value={newUsername} onChange={e=>setNewUsername(e.target.value)} placeholder={profile?.name} style={inputStyle}/>
              <button onClick={saveUsername} style={btnStyle()}>UPDATE USERNAME</button>
            </div>

            <div style={{height:1,background:"rgba(255,255,255,0.06)"}}/>

            {/* Email change */}
            {!sentCode&&(
              <div>
                <div style={{color:"#888",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:8}}>CHANGE EMAIL</div>
                <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="new@email.com" type="email" style={inputStyle}/>
                <button onClick={requestEmailChange} style={btnStyle()}>SEND VERIFICATION CODE</button>
              </div>
            )}

            {/* Password change */}
            {!sentCode&&(
              <>
                <div style={{height:1,background:"rgba(255,255,255,0.06)"}}/>
                <div>
                  <div style={{color:"#888",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:8}}>CHANGE PASSWORD</div>
                  <input value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="New password (6+ chars)" type="password" style={inputStyle}/>
                  <input value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} placeholder="Confirm new password" type="password" style={{...inputStyle,marginTop:0}}/>
                  <button onClick={requestPasswordChange} style={btnStyle()}>SEND VERIFICATION CODE</button>
                </div>
              </>
            )}

            {/* Verification code input */}
            {sentCode&&(
              <div style={{background:"rgba(124,77,255,0.08)",border:"1px solid rgba(124,77,255,0.3)",borderRadius:14,padding:18}}>
                <div style={{color:"#FFD54F",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:4}}>
                  {verifyField==="email"?"📧 VERIFY EMAIL CHANGE":"🔑 VERIFY PASSWORD CHANGE"}
                </div>
                <div style={{color:"#555",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",marginBottom:14,lineHeight:1.8}}>
                  Enter the 6-digit code sent to your email.
                </div>
                <input value={verifyCode} onChange={e=>setVerifyCode(e.target.value)} placeholder="000000" maxLength={6} style={{...inputStyle,letterSpacing:8,textAlign:"center"}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{setSentCode(null);setVerifyField(null);setVerifyCode("");}} style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"10px",color:"#666",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"9px"}}>CANCEL</button>
                  <button onClick={submitVerification} style={{...btnStyle("green"),flex:2,marginTop:0}}>✅ VERIFY &amp; SAVE</button>
                </div>
              </div>
            )}
          </div>
        )}

        {msg.text&&<div style={{marginTop:14,padding:"10px 14px",background:msg.ok?"rgba(76,175,80,0.1)":"rgba(244,67,54,0.1)",border:`1px solid ${msg.ok?"rgba(76,175,80,0.4)":"rgba(244,67,54,0.4)"}`,borderRadius:9,color:msg.ok?"#4CAF50":"#f44336",fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",lineHeight:1.8}}>{msg.text}</div>}
      </div>

    </div>
  );
}

const WS_URL = "ws://localhost:3001";
const STARTER_COUNT = 6;
const UNLOCK_COST = 300;
const PAGE = 30;

function App(){
  // ── Profile ──────────────────────────────────────────────
  // ── Session persistence ───────────────────────────────────
  // On refresh: registered users restore their session; guests always reset to login
  const [profile,setProfile]=useState(()=>{
    try{
      const sess=localStorage.getItem("pkmn_active_session");
      if(!sess) return null;
      const {name, ts}=JSON.parse(sess);
      // Session valid for 30 days
      if(Date.now()-ts > 30*24*60*60*1000){ localStorage.removeItem("pkmn_active_session"); return null; }
      const profiles=JSON.parse(localStorage.getItem("pkmn_profiles")||"[]");
      const prof=profiles.find(p=>p.name===name&&!p.isGuest);
      return prof||null;
    }catch{ return null; }
  });
  const [screen,setScreen]=useState(()=>{
    try{
      const sess=localStorage.getItem("pkmn_active_session");
      if(!sess) return MODES.CHAR;
      const {name}=JSON.parse(sess);
      const profiles=JSON.parse(localStorage.getItem("pkmn_profiles")||"[]");
      const prof=profiles.find(p=>p.name===name&&!p.isGuest);
      if(!prof) return MODES.CHAR;
      // Check if they have a starter saved
      const hasSt=localStorage.getItem(`pkmn_starter_${name}`);
      return hasSt ? MODES.HOME : MODES.STARTER;
    }catch{ return MODES.CHAR; }
  });
  const [musicOn,setMusicOn]=useState(true);
  const musicStarted=useRef(false);
  const profileRef=useRef(null); // always holds latest profile, safe to use in async/setTimeout
  const [starterPokemon,setStarterPokemon]=useState(null); // the chosen starter

  // ── Pokédex ──────────────────────────────────────────────
  const [allPokemon,setAllPokemon]=useState([]);
  const [loading,setLoading]=useState(false);
  const [loadPct,setLoadPct]=useState(0);
  const [unlockedIds,setUnlockedIds]=useState(new Set());

  // ── Select screen ─────────────────────────────────────────
  const [searchQ,setSearchQ]=useState("");
  const [typeFilt,setTypeFilt]=useState("all");
  const [genFilt,setGenFilt]=useState("all");
  const [showLeg,setShowLeg]=useState(false);
  const [page,setPage]=useState(0);

  // ── Team ─────────────────────────────────────────────────
  const [team,setTeam]=useState([]);
  const [teamLevels,setTeamLevels]=useState({});

  // ── Battle ───────────────────────────────────────────────
  const [pMon,setPMon]=useState(null);
  const [eMon,setEMon]=useState(null);
  const [pHP,setPHP]=useState(0);
  const [eHP,setEHP]=useState(0);
  const [pMaxHP,setPMaxHP]=useState(0);
  const [eMaxHP,setEMaxHP]=useState(0);
  const [pLevel,setPLevel]=useState(50);
  const [log,setLog]=useState([]);
  const [busy,setBusy]=useState(false);
  const [shakeP,setShakeP]=useState(false);
  const [shakeE,setShakeE]=useState(false);
  const [hitP,setHitP]=useState(false);
  const [hitE,setHitE]=useState(false);
  const [faintP,setFaintP]=useState(false);
  const [faintE,setFaintE]=useState(false);
  const [winner,setWinner]=useState(null);
  const [anim,setAnim]=useState(null);
  const [showItems,setShowItems]=useState(false);
  const [showSwitch,setShowSwitch]=useState(false); // mid-battle pokemon switch
  const [bagItems,setBagItems]=useState({});
  const [pMega,setPMega]=useState(false);
  const [pMegaSlug,setPMegaSlug]=useState(null);
  const [pGiga,setPGiga]=useState(false);
  const [showMegaAnim,setShowMegaAnim]=useState(false);
  const [showGigaAnim,setShowGigaAnim]=useState(false);
  const [usedZ,setUsedZ]=useState(false);
  const [usedMega,setUsedMega]=useState(false);
  const [usedGiga,setUsedGiga]=useState(false);

  // ── Scores / Hall ─────────────────────────────────────────
  const [showBoard,setShowBoard]=useState(false);

  // ── Weather & Status ──────────────────────────────────────
  const [weather,setWeather]=useState(null);
  const [pStatus,setPStatus]=useState(null);
  const [eStatus,setEStatus]=useState(null);

  // ── Streak & combo ────────────────────────────────────────
  const [winStreak,setWinStreak]=useState(0); // loaded per-profile in init effect
  const [showStreakBanner,setShowStreakBanner]=useState(false);
  const [usedItemsThisBattle,setUsedItemsThisBattle]=useState(false);
  const [usedZThisBattle,setUsedZThisBattle]=useState(false);
  const [usedMegaThisBattle,setUsedMegaThisBattle]=useState(false);

  // ── EXP & Evolution ──────────────────────────────────────
  const [expMap,setExpMap]=useState(()=>{ try{return JSON.parse(localStorage.getItem(`pkmn_exp_${JSON.parse(localStorage.getItem('pkmn_profiles')||'[]').slice(-1)[0]?.name}`)||'{}')}catch{return {}} });
  const [pendingEvo,setPendingEvo]=useState(null); // {oldMon, newId}
  const [showEvoAnim,setShowEvoAnim]=useState(false);
  const [battleTurns,setBattleTurns]=useState(0);

  // ── Battle history ────────────────────────────────────────
  // Per-profile key so different accounts never share history.
  // Guests use sessionStorage (clears on tab close).
  const historyKey = (name, isGuest) => isGuest ? null : `pkmn_history_${name}`;
  const [battleHistory,setBattleHistory]=useState([]);

  // ── Story mode ────────────────────────────────────────────
  const [storyProgress,setStoryProgress]=useState(()=>{ try{return JSON.parse(localStorage.getItem(storyKey(JSON.parse(localStorage.getItem('pkmn_profiles')||'[]').slice(-1)[0]?.name||''))||'[]')}catch{return []} });
  const [storyBattle,setStoryBattle]=useState(null); // current gym leader being fought

  // ── Trade ─────────────────────────────────────────────────
  const [showTrade,setShowTrade]=useState(false);
  const [tradeOffer,setTradeOffer]=useState(null);
  const [tradeReceive,setTradeReceive]=useState(null);

  // ── Daily challenges ──────────────────────────────────────
  // NOTE: initialized empty here — loaded per-profile in the init effect below
  const [challenges,setChallenges]=useState([]);
  const [dailyWins,setDailyWins]=useState(0);
  const [caughtToday,setCaughtToday]=useState(false);
  const [showChallenges,setShowChallenges]=useState(false);

  // ── Move hover preview ────────────────────────────────────
  const [hoverMove,setHoverMove]=useState(null);

  // ── Heal center ──────────────────────────────────────────
  const [faintedTeam,setFaintedTeam]=useState([]);
  const [healQueue,setHealQueue]=useState([]);
  const [healDone,setHealDone]=useState(false);
  const [selectedToHeal,setSelectedToHeal]=useState(new Set()); // IDs selected for healing

  // ── Shop ─────────────────────────────────────────────────
  const [inventory,setInventory]=useState({});
  const [homeLog,setHomeLog]=useState([]);
  const pushHomeLog=msg=>setHomeLog(l=>[...l.slice(-4),msg]);

  // ── Multiplayer ──────────────────────────────────────────
  const [wsStatus,setWsStatus]=useState("disconnected");
  const [roomId,setRoomId]=useState("");
  const [roomInput,setRoomInput]=useState("");
  const [mpLog,setMpLog]=useState([]);
  const [oppMon,setOppMon]=useState(null);
  const [oppHP,setOppHP]=useState(0);
  const [myTurn,setMyTurn]=useState(false);
  const [mpMode,setMpMode]=useState("create"); // "create" or "join"
  const [copySuccess,setCopySuccess]=useState(false);
  const [isMpBattle,setIsMpBattle]=useState(false);
  const wsRef=useRef(null);
  const logRef=useRef(null);

  // ── Music ─────────────────────────────────────────────────
  useEffect(()=>{
    if(!musicStarted.current||!musicOn) return;
    if(screen===MODES.HOME) AUDIO.play("home");
    else if(screen===MODES.SHOP) AUDIO.play("shop");
    else if(screen===MODES.TEAM) AUDIO.play("team");
    else if(screen===MODES.HEAL) AUDIO.play("heal");
    else if(screen===MODES.SELECT||screen===MODES.UNLOCK||screen===MODES.STARTER||screen===MODES.STORY) AUDIO.play("select");
    else if(screen===MODES.HISTORY) AUDIO.play("home");
    else if(screen===MODES.BATTLE||screen===MODES.MP||screen===MODES.WAIT) AUDIO.play("battle");
    else if(screen===MODES.OVER) AUDIO.play(winner==="player"?"victory":"defeat");
  },[screen,winner,musicOn]);

  // Clean up ALL guest data on app load
  useEffect(()=>{
    // Remove all guest-prefixed keys from localStorage
    Object.keys(localStorage)
      .filter(k=>k.includes("_Guest_")||k.startsWith("pkmn_starter_Guest")||k.startsWith("pkmn_unlocked_Guest")||k.startsWith("pkmn_streak_Guest")||k.startsWith("pkmn_history_Guest")||k.startsWith("pkmn_inv_Guest")||k.startsWith("pkmn_fainted_Guest")||k.startsWith("pkmn_team_Guest")||k.startsWith("pkmn_exp_Guest")||k.startsWith("pkmn_levels_Guest"))
      .forEach(k=>localStorage.removeItem(k));
    // Remove old shared battle history key (legacy — everyone was reading from it)
    localStorage.removeItem('pkmn_history');
    // Remove guest entries from pkmn_profiles so they never show in quick login
    try{
      const profiles=JSON.parse(localStorage.getItem("pkmn_profiles")||"[]");
      const cleaned=profiles.filter(p=>!p.isGuest);
      if(cleaned.length!==profiles.length) localStorage.setItem("pkmn_profiles",JSON.stringify(cleaned));
    }catch{}
    // sessionStorage auto-clears on tab close
  },[]);

  // ── Auto-start music on first interaction or immediately ─────
  useEffect(()=>{
    if(!musicOn) return;
    // Try immediate autoplay
    const tryPlay=()=>{
      if(musicStarted.current) return;
      musicStarted.current=true;
      if(screen===MODES.HOME||screen===MODES.CHAR) AUDIO.play("home");
      else if(screen===MODES.BATTLE) AUDIO.play("battle");
      else AUDIO.play("home");
    };
    // Browsers block audio until user interacts — listen for first interaction
    const onFirst=()=>{
      tryPlay();
      document.removeEventListener("click",onFirst,true);
      document.removeEventListener("keydown",onFirst,true);
      document.removeEventListener("touchstart",onFirst,true);
    };
    document.addEventListener("click",onFirst,true);
    document.addEventListener("keydown",onFirst,true);
    document.addEventListener("touchstart",onFirst,true);
    // Also try immediately (works on some browsers/reload scenarios)
    tryPlay();
    return()=>{
      document.removeEventListener("click",onFirst,true);
      document.removeEventListener("keydown",onFirst,true);
      document.removeEventListener("touchstart",onFirst,true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[musicOn]);

  // ── Load Pokémon ─────────────────────────────────────────
  useEffect(()=>{
    async function load(){
      setLoading(true);
      const TOTAL=1010, BATCH=50;
      let acc=[];
      for(let s=1;s<=TOTAL;s+=BATCH){
        const ids=Array.from({length:Math.min(BATCH,TOTAL-s+1)},(_,i)=>s+i);
        const res=await Promise.allSettled(ids.map(async id=>{
          try{
            const d=await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r=>r.json());
            const stats=Object.fromEntries(d.stats.map(s=>[s.stat.name,s.base_stat]));
            const types=d.types.map(t=>t.type.name);
            const isLeg=LEGENDARY_IDS.has(id);
            const boost=isLeg?1.35:1;
            return{id:d.id,name:d.name,types,
              hp:Math.floor((stats.hp||45)*boost),
              attack:Math.floor((stats.attack||50)*boost),
              defense:Math.floor((stats.defense||50)*boost),
              speed:Math.floor((stats.speed||50)*boost),
              moves:getMoves(types[0]),
              legendary:isLeg,
              canMega:!!MEGA_MAP[id],
              canGiga:GIGANTAMAX_IDS.has(id),
            };
          }catch{return null;}
        }));
        const valid=res.filter(r=>r.status==="fulfilled"&&r.value).map(r=>r.value);
        acc=[...acc,...valid];
        setAllPokemon([...acc]);
        setLoadPct(Math.round((acc.length/TOTAL)*100));
        await new Promise(r=>setTimeout(r,80));
      }
      setLoading(false);
    }
    load();
  },[]);

  // ── Init after profile loads ──────────────────────────────
  useEffect(()=>{
    if(!profile) return;
    const store=profile?.isGuest?sessionStorage:localStorage;
    const saved=store.getItem(`pkmn_unlocked_${profile.name}`);
    // For guests: always start with empty unlocked set (no overlap between sessions)
    if(profile.isGuest){
      setUnlockedIds(new Set());
    } else if(saved){
      setUnlockedIds(new Set(JSON.parse(saved)));
    } else {
      setUnlockedIds(new Set());
    }
    const savedInv=localStorage.getItem(`pkmn_inv_${profile.name}`);
    if(savedInv) setInventory(JSON.parse(savedInv));
    const savedFainted=localStorage.getItem(`pkmn_fainted_${profile.name}`);
    if(savedFainted) setFaintedTeam(JSON.parse(savedFainted));
    const savedTeam=localStorage.getItem(`pkmn_team_${profile.name}`);
    if(savedTeam) setTeam(JSON.parse(savedTeam));
    const savedLevels=localStorage.getItem(`pkmn_levels_${profile.name}`);
    if(savedLevels) setTeamLevels(JSON.parse(savedLevels));
    const savedStarter=store.getItem(`pkmn_starter_${profile.name}`);
    if(savedStarter) setStarterPokemon(JSON.parse(savedStarter));
    const savedExp=localStorage.getItem(`pkmn_exp_${profile.name}`);
    if(savedExp) try{setExpMap(JSON.parse(savedExp))}catch{}
    const savedHistory=profile.isGuest ? null : localStorage.getItem(`pkmn_history_${profile.name}`);
    if(savedHistory) try{setBattleHistory(JSON.parse(savedHistory))}catch{}
    else setBattleHistory([]);
    const savedStory=localStorage.getItem(storyKey(profile.name));
    if(savedStory) try{setStoryProgress(JSON.parse(savedStory))}catch{}
    // Load per-profile streak (guests always start at 0)
    if(profile.isGuest){
      setWinStreak(0);
    } else {
      setWinStreak(parseInt(localStorage.getItem(`pkmn_streak_${profile.name}`)||"0"));
    }
    // ── Load challenges per-profile + per-day ──────────────
    // Key includes both profile name AND today's date, so:
    // • Different accounts never share progress
    // • Each new day gets fresh challenges automatically
    if(profile.isGuest){
      // Guests always get fresh challenges (sessionStorage clears on tab close)
      setChallenges(getDailyChallenges());
      setDailyWins(0);
      setCaughtToday(false);
    } else {
      const savedCh=localStorage.getItem(challengeKey(profile.name));
      if(savedCh){
        try{ setChallenges(JSON.parse(savedCh)); }catch{ setChallenges(getDailyChallenges()); }
      } else {
        // New day or new account — generate fresh challenges
        const fresh=getDailyChallenges();
        setChallenges(fresh);
        localStorage.setItem(challengeKey(profile.name),JSON.stringify(fresh));
      }
      setDailyWins(parseInt(localStorage.getItem(dailyWinsKey(profile.name))||"0"));
      setCaughtToday(localStorage.getItem(caughtTodayKey(profile.name))==="1");
    }
  },[profile]);

  useEffect(()=>{ profileRef.current=profile; },[profile]);
  useEffect(()=>{ if(profile&&!profile.isGuest) localStorage.setItem(`pkmn_fainted_${profile.name}`,JSON.stringify(faintedTeam)); },[faintedTeam,profile]);
  useEffect(()=>{ if(profile) localStorage.setItem(`pkmn_team_${profile.name}`,JSON.stringify(team)); },[team,profile]);
  useEffect(()=>{ if(profile) localStorage.setItem(`pkmn_exp_${profile.name}`,JSON.stringify(expMap)); },[expMap,profile]);
  // Trigger evolution animation when pendingEvo arrives
  useEffect(()=>{ if(pendingEvo) setTimeout(()=>setShowEvoAnim(true),1500); },[pendingEvo]);

  // ── Filter ────────────────────────────────────────────────
  const filteredPokemon = useMemo(()=>{
    let f=allPokemon;
    if(searchQ) f=f.filter(p=>p.name.toLowerCase().includes(searchQ.toLowerCase())||String(p.id).includes(searchQ));
    if(typeFilt!=="all") f=f.filter(p=>p.types.includes(typeFilt));
    if(genFilt!=="all"){ const g=GENS[+genFilt]; if(g) f=f.filter(p=>p.id>=g.range[0]&&p.id<=g.range[1]); }
    if(showLeg) f=f.filter(p=>p.legendary||p.canMega||p.canGiga);
    return f;
  },[allPokemon,searchQ,typeFilt,genFilt,showLeg]);

  const pagedPokemon = filteredPokemon.slice(page*PAGE,(page+1)*PAGE);

  // ── Unlock ────────────────────────────────────────────────
  function unlockPokemon(mon){
    if(!profile) return;
    const cost=mon.legendary?UNLOCK_COST*3:mon.canMega?UNLOCK_COST*2:UNLOCK_COST;
    if((profile.coins||0)<cost){ alert(`Need ${cost} coins! You have ${profile.coins}`); return; }
    const np={...profile,coins:(profile.coins||0)-cost};
    setProfile(np); updateProfile(np);
    const nu=new Set([...unlockedIds,mon.id]);
    setUnlockedIds(nu);
    (profile?.isGuest?sessionStorage:localStorage).setItem(`pkmn_unlocked_${profile.name}`,JSON.stringify([...nu]));
  }

  function isUnlocked(mon){
    if(starterPokemon?.id===mon.id) return true; // starter always unlocked
    return unlockedIds.has(mon.id);            // only explicitly caught/unlocked
  }

  // ── Team ─────────────────────────────────────────────────
  function toggleTeam(mon){
    setTeam(t=>{
      if(t.some(p=>p.id===mon.id)) return t.filter(p=>p.id!==mon.id);
      if(t.length>=6){ alert("Team is full!"); return t; }
      return [...t,mon];
    });
  }

  // ── Profile utils ─────────────────────────────────────────
  function updateProfile(p){
    const profiles=JSON.parse(localStorage.getItem("pkmn_profiles")||"[]");
    const idx=profiles.findIndex(x=>x.name===p.name);
    if(idx>=0) profiles[idx]=p; else profiles.push(p);
    localStorage.setItem("pkmn_profiles",JSON.stringify(profiles));
  }

  function addCoins(amount){
    setProfile(p=>{
      const np={...p,coins:(p.coins||0)+amount};
      updateProfile(np); return np;
    });
  }

  function markNeedsHeal(mon, didFaint, remainingHP=0){
    const p=profileRef.current;
    const newEntry={id:mon.id,name:mon.name,fainted:!!didFaint,hp:didFaint?0:remainingHP};
    setFaintedTeam(ft=>{
      const exists=ft.some(f=>f.id===mon.id);
      const updated=exists
        ? ft.map(f=>f.id===mon.id?{...f,fainted:f.fainted||didFaint,hp:didFaint?0:remainingHP}:f)
        : [...ft,newEntry];
      // Synchronous write — survives navigation and refresh immediately
      if(p&&!p.isGuest){
        try{ localStorage.setItem(`pkmn_fainted_${p.name}`,JSON.stringify(updated)); }catch{}
      }
      return updated;
    });
  }

  // ── Battle start ──────────────────────────────────────────
  function startBattle(mon){
    if(!mon) return;
    // Block only pokemon that have truly fainted (hp=0), not just injured
    const trulyFainted=faintedTeam.filter(f=>f.fainted);
    if(trulyFainted.some(f=>f.id===mon.id)){
      alert(`${mon.name.toUpperCase()} has fainted! Take them to the Pokémon Center first.`);
      return;
    }
    const pool=allPokemon.filter(x=>x.id!==mon.id&&x.legendary===mon.legendary);
    const enemy=pool[Math.floor(Math.random()*pool.length)];
    if(!enemy) return;
    const lvl=teamLevels[mon.id]||50;
    const pMax=(mon.hp+lvl)*2, eMax=enemy.hp*2;
    setPMon(mon); setEMon(enemy);
    setPHP(pMax); setEHP(eMax);
    setPMaxHP(pMax); setEMaxHP(eMax);
    setPLevel(lvl);
    setLog([`⚔️ A wild ${enemy.name.toUpperCase()} appeared!`,`Go, ${mon.name.toUpperCase()}! (Lv${lvl})`]);
    setFaintP(false); setFaintE(false); setHitP(false); setHitE(false);
    setWinner(null); setBusy(false); setAnim(null); setShowItems(false); setShowSwitch(false);
    setBattleTurns(0); setPMega(false); setPMegaSlug(null); setPGiga(false); setUsedZ(false); setUsedMega(false); setUsedGiga(false); setShowMegaAnim(false); setShowGigaAnim(false); setIsMpBattle(false);
    battleEndedRef.current = false; // reset guard for new battle
    // Pick random weather
    const wRoll=Math.random();
    const wx=wRoll<0.14?WEATHERS[1]:wRoll<0.28?WEATHERS[4]:wRoll<0.38?WEATHERS[2]:wRoll<0.48?WEATHERS[3]:wRoll<0.56?WEATHERS[5]:wRoll<0.64?WEATHERS[6]:WEATHERS[0];
    setWeather(wx); setPStatus(null); setEStatus(null);
    setUsedItemsThisBattle(false); setUsedZThisBattle(false); setUsedMegaThisBattle(false);
    const bag={};
    SHOP_ITEMS.filter(it=>!it.isBall).forEach(it=>{ bag[it.id]=(inventory[it.id]||0); });
    // Pokeballs only in CPU battle
    SHOP_ITEMS.filter(it=>it.isBall).forEach(it=>{ bag[it.id]=(inventory[it.id]||0); });
    setBagItems(bag);
    setScreen(MODES.BATTLE);
  }

  // Guard flag — prevents handleEnemyFaint / handlePlayerFaint firing twice in one battle
  // (can happen when weather chip + move damage both reach 0 on the same turn)
  const battleEndedRef = useRef(false);

  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const pushLog=msg=>setLog(l=>[...l.slice(-12),msg]);

  // ── Mid-battle Pokémon switch ─────────────────────────────
  async function switchPokemon(newMon){
    if(busy||!newMon||newMon.id===pMon?.id) return;
    if(faintedTeam.some(f=>f.id===newMon.id&&f.fainted)){ pushLog(`${newMon.name.toUpperCase()} has fainted and can't battle!`); return; }
    setBusy(true); setShowSwitch(false);
    const lvl=teamLevels[newMon.id]||50;
    const newMax=(newMon.hp+lvl)*2;
    pushLog(`Come back, ${pMon.name.toUpperCase()}!`);
    await sleep(500);
    setPMon(newMon); setPLevel(lvl);
    setPMaxHP(newMax); setPHP(newMax);
    setPMega(false); setPMegaSlug(null); setPGiga(false);
    pushLog(`Go, ${newMon.name.toUpperCase()}! (Lv${lvl})`);
    await sleep(400);
    // Enemy gets a free attack for switching
    await enemyAttackTurn();
    await sleep(300);
    setBusy(false);
  }

  // ── Mega Evolution ────────────────────────────────────────
  function doMega(){
    if(usedMega||!pMon?.canMega||bagItems.mega_stone<=0) return;
    setUsedMega(true);
    setBagItems(b=>({...b,mega_stone:0}));
    setInventory(inv=>{ const n={...inv,mega_stone:Math.max(0,(inv.mega_stone||0)-1)}; localStorage.setItem(`pkmn_inv_${profile?.name}`,JSON.stringify(n)); return n; });
    setShowMegaAnim(true);
    setUsedMegaThisBattle(true);
  }

  function onMegaDone(){
    setPMega(true);
    const md=MEGA_MAP[pMon.id];
    if(md?.slug) setPMegaSlug(md.slug);
    setPMon(m=>({...m,
      megaName:md.name,
      megaTypes:md.typeOverride||m.types,
      attack:Math.floor(m.attack*(md.atkMult||1)),
      defense:Math.floor(m.defense*(md.defMult||1)),
      speed:Math.floor(m.speed*(md.spdMult||1)),
    }));
    pushLog(`✨ ${pMon.name.toUpperCase()} MEGA EVOLVED into ${MEGA_MAP[pMon.id].name.toUpperCase()}!`);
  }

  // ── Gigantamax ────────────────────────────────────────────
  function doGiga(){
    if(usedGiga||!pMon?.canGiga||bagItems.dynamax_band<=0) return;
    setUsedGiga(true);
    setBagItems(b=>({...b,dynamax_band:0}));
    setInventory(inv=>{ const n={...inv,dynamax_band:Math.max(0,(inv.dynamax_band||0)-1)}; localStorage.setItem(`pkmn_inv_${profile?.name}`,JSON.stringify(n)); return n; });
    setShowGigaAnim(true);
  }

  function onGigaDone(){
    setShowGigaAnim(false);
    setPGiga(true);
    const gd=GIGANTAMAX_MAP[pMon.id];
    setPMon(m=>({...m,
      gigaName:`Gigantamax ${m.name}`,
      gigaMove:gd,
      attack:Math.floor(m.attack*1.5),
    }));
    setPMaxHP(h=>h*1.5); setPHP(hp=>hp*1.5);
    pushLog(`⭕ ${pMon.name.toUpperCase()} GIGANTAMAXED! Size and power increased!`);
  }

  // ── Z-Move ────────────────────────────────────────────────
  async function useZMove(){
    if(usedZ||bagItems.z_crystal<=0||busy) return;
    setUsedZ(true);
    setBagItems(b=>({...b,z_crystal:0}));
    setInventory(inv=>{ const n={...inv,z_crystal:Math.max(0,(inv.z_crystal||0)-1)}; localStorage.setItem(`pkmn_inv_${profile?.name}`,JSON.stringify(n)); return n; });
    setBusy(true);
    setUsedZThisBattle(true);
    const zType=pMon.types[0];
    const zm=Z_MOVES[zType]||{name:"Z-Move",power:200};
    const fakeMove={...zm,type:zType};
    const{dmg,eff}=calcDmg(pMon,fakeMove,eMon,pLevel);
    const effTxt=eff>=2?" 💥 SUPER EFFECTIVE!":eff===0?" ❌ No effect!":"";
    pushLog(`💎 Z-POWER! ${pMon.name.toUpperCase()} uses ${zm.name}!${effTxt}`);
    setAnim({type:zType,fromPlayer:true,key:Date.now(),isZMove:true});
    await sleep(900); setAnim(null); await sleep(80);
    setHitE(true); await sleep(110); setHitE(false);
    setShakeE(true); await sleep(440); setShakeE(false);
    let enemyDied=false;
    setEHP(h=>{ const n=Math.max(0,h-dmg); if(n<=0){ enemyDied=true; handleEnemyFaint(); } return n; });
    pushLog(`Z-Move dealt ${dmg} damage!`);
    await sleep(600);
    if(!enemyDied){
      await enemyAttackTurn();
      await sleep(300);
      setBusy(false);
    }
  }

  // ── G-Max Move ────────────────────────────────────────────
  async function useGigaMove(){
    if(!pGiga||busy) return;
    const gd=GIGANTAMAX_MAP[pMon.id];
    if(!gd) return;
    setBusy(true);
    const fakeMove={name:gd.name,type:gd.type,power:gd.power};
    const{dmg,eff}=calcDmg(pMon,fakeMove,eMon,pLevel);
    const effTxt=eff>=2?" 💥 SUPER EFFECTIVE!":eff===0?" ❌ No effect!":"";
    pushLog(`⭕ ${gd.name.toUpperCase()}!${effTxt}`);
    setAnim({type:gd.type,fromPlayer:true,key:Date.now(),isGiga:true});
    await sleep(900); setAnim(null); await sleep(80);
    setHitE(true); await sleep(110); setHitE(false);
    setShakeE(true); await sleep(440); setShakeE(false);
    let enemyDied=false;
    setEHP(h=>{ const n=Math.max(0,h-dmg); if(n<=0){ enemyDied=true; handleEnemyFaint(); } return n; });
    pushLog(`G-Max dealt ${dmg} damage!`);
    await sleep(600);
    if(!enemyDied){
      await enemyAttackTurn();
      await sleep(300);
      setBusy(false);
    }
  }

  // ── Battle Items ──────────────────────────────────────────
  async function useBattleItem(item){
    if(busy||bagItems[item.id]<=0) return;
    setBusy(true); setShowItems(false);
    setUsedItemsThisBattle(true);
    setBagItems(b=>({...b,[item.id]:b[item.id]-1}));
    setInventory(inv=>{ const n={...inv,[item.id]:Math.max(0,(inv[item.id]||0)-1)}; localStorage.setItem(`pkmn_inv_${profile?.name}`,JSON.stringify(n)); return n; });
    if(item.id==="rare_candy"){
      setPLevel(l=>{
        const nl=Math.min(100,l+1);
        setTeamLevels(tl=>{ const n={...tl,[pMon.id]:nl}; localStorage.setItem(`pkmn_levels_${profile?.name}`,JSON.stringify(n)); return n; });
        return nl;
      });
      pushLog(`🍬 Rare Candy used! ${pMon.name.toUpperCase()} is now Lv${Math.min(100,pLevel+1)}!`);
    } else {
      const heal=Math.min(item.heal,pMaxHP-pHP);
      setPHP(hp=>Math.min(pMaxHP,hp+(item.heal||0)));
      pushLog(`Used ${item.name}! +${heal} HP ✓`);
    }
    await sleep(600);
    await enemyAttackTurn();
    await sleep(300);
    setBusy(false);
  }

  async function usePokeball(ball){
    if(busy||bagItems[ball.id]<=0) return;
    setBusy(true); setShowItems(false);
    setBagItems(b=>({...b,[ball.id]:b[ball.id]-1}));
    setInventory(inv=>{ const n={...inv,[ball.id]:Math.max(0,(inv[ball.id]||0)-1)}; localStorage.setItem(`pkmn_inv_${profile?.name}`,JSON.stringify(n)); return n; });
    pushLog(`Threw a ${ball.name}! ${ball.emoji}`);
    await sleep(800);
    const hpFactor=(eMaxHP-eHP)/eMaxHP;
    const roll=Math.random();
    const catchChance=ball.catch*(0.5+hpFactor*0.5);
    if(roll<catchChance){
      pushLog(`Gotcha! ${eMon.name.toUpperCase()} was caught! 🎉`);
      addCoins(150);
      setCaughtToday(true); if(!profile?.isGuest) localStorage.setItem(caughtTodayKey(profile?.name),"1");
      setChallenges(prev=>{ const u=prev.map(ch=>ch.isCatch?{...ch,progress:1,done:true}:ch); if(!profile?.isGuest) localStorage.setItem(challengeKey(profile?.name),JSON.stringify(u)); return u; });
      const nu=new Set([...unlockedIds,eMon.id]);
      setUnlockedIds(nu);
      (profile?.isGuest?sessionStorage:localStorage).setItem(`pkmn_unlocked_${profile?.name}`,JSON.stringify([...nu]));
      await sleep(600);
      setWinner("player"); setScreen(MODES.OVER);
    } else {
      pushLog(`Oh no! ${eMon.name.toUpperCase()} broke free!`);
      await sleep(600);
      await enemyAttackTurn();
      await sleep(300);
    }
    setBusy(false);
  }

  async function enemyAttackTurn(){
    // Status chip damage
    if(pStatus?.type==="burn"||pStatus?.type==="poison"){
      const chip=Math.max(1,Math.floor(pMaxHP*(STATUSES[pStatus.type].chipPct||0.12)));
      setPHP(h=>{ const n=Math.max(0,h-chip); if(n<=0) handlePlayerFaint(); return n; });
      pushLog(`${STATUSES[pStatus.type].icon} ${pMon.name.toUpperCase()} is hurt by ${pStatus.type}! -${chip}HP`);
    }
    if(eStatus?.type==="burn"||eStatus?.type==="poison"){
      const chip=Math.max(1,Math.floor(eMaxHP*(STATUSES[eStatus.type].chipPct||0.12)));
      setEHP(h=>{ const n=Math.max(0,h-chip); if(n<=0){ handleEnemyFaint(); return n; } return n; });
      pushLog(`${STATUSES[eStatus.type].icon} ${eMon.name.toUpperCase()} is hurt by ${eStatus.type}! -${chip}HP`);
    }
    // Weather chip on player
    if(weather?.chip>0){
      const chip=Math.max(1,Math.floor(pMaxHP*weather.chip));
      setPHP(h=>{ const n=Math.max(0,h-chip); if(n<=0) handlePlayerFaint(); return n; });
    }
    // Enemy status skip
    if(eStatus?.type==="sleep"||eStatus?.type==="freeze"){
      const thaw=eStatus.type==="freeze"&&Math.random()<0.2;
      if(thaw){ pushLog(`❄️ ${eMon.name.toUpperCase()} thawed out!`); setEStatus(null); }
      else{
        pushLog(`${STATUSES[eStatus.type].icon} ${eMon.name.toUpperCase()} can't move!`);
        setEStatus(s=>s?{...s,turnsLeft:(s.turnsLeft||1)-1}:null);
        return;
      }
    }
    if(eStatus?.type==="paralysis"&&Math.random()<0.25){
      pushLog(`⚡ ${eMon.name.toUpperCase()} is paralyzed and can't move!`); return;
    }
    const eMove=aiPickMove(eMon,pMon,eStatus,weather);
    const wxMult=WEATHER_MULT(weather,eMove.type);
    const eBurnMult=(eStatus?.type==="burn")?STATUSES.burn.atkMult:1;
    const{dmg:rawEDmg,eff:eEff}=calcDmg(eMon,eMove,pMon,50);
    const eDmg=Math.max(1,Math.floor(rawEDmg*wxMult*eBurnMult));
    // Status infliction on player
    if(!pStatus&&STATUS_CHANCE[eMove.type]&&Math.random()<STATUS_CHANCE[eMove.type]){
      const st=STATUS_FROM[eMove.type];
      if(st){ setPStatus({type:st,turnsLeft:st==="sleep"?Math.ceil(Math.random()*3):99}); pushLog(`${STATUSES[st].icon} ${pMon.name.toUpperCase()} got ${st.toUpperCase()}ED!`); }
    }
    const eEffTxt=eEff>=2?" 💥 SUPER EFFECTIVE!":eEff<=0.5?" 😶 Not very effective...":"";
    pushLog(`${eMon.name.toUpperCase()} used ${eMove.name}!${eEffTxt}`);
    setAnim({type:eMove.type,fromPlayer:false,key:Date.now()});
    await sleep(750); setAnim(null); await sleep(80);
    setHitP(true); await sleep(110); setHitP(false);
    setShakeP(true); await sleep(420); setShakeP(false);
    setPHP(h=>{
      const n=Math.max(0,h-eDmg);
      if(n<=0) handlePlayerFaint();
      return n;
    });
    pushLog(`Took ${eDmg} damage!`);
  }

  async function useMove(move){
    if(busy) return;
    setBattleTurns(t=>t+1);
    // Status: sleep/freeze skip
    if(pStatus?.type==="sleep"||pStatus?.type==="freeze"){
      const thaw=pStatus.type==="freeze"&&Math.random()<0.2;
      if(thaw){ pushLog(`❄️ ${pMon.name.toUpperCase()} thawed out!`); setPStatus(null); }
      else{
        pushLog(`${STATUSES[pStatus.type].icon} ${pMon.name.toUpperCase()} can't move! (${STATUSES[pStatus.type].name})`);
        setPStatus(s=>s?{...s,turnsLeft:(s.turnsLeft||1)-1}:null);
        setBusy(true); await sleep(600); await enemyAttackTurn(); await sleep(300); setBusy(false); return;
      }
    }
    if(pStatus?.type==="paralysis"&&Math.random()<0.25){
      pushLog(`⚡ ${pMon.name.toUpperCase()} is paralyzed! Can't move!`);
      setBusy(true); await sleep(600); await enemyAttackTurn(); await sleep(300); setBusy(false); return;
    }
    setBusy(true);
    const wxMult=WEATHER_MULT(weather,move.type);
    const burnMult=(pStatus?.type==="burn")?STATUSES.burn.atkMult:1;
    const{dmg:rawDmg,eff}=calcDmg(pMon,move,eMon,pLevel);
    const dmg=Math.max(1,Math.floor(rawDmg*wxMult*burnMult));
    const effTxt=eff>=2?" 💥 SUPER EFFECTIVE!":eff<=0.5?" 😶 Not very effective...":eff===0?" ❌ No effect!":"";
    pushLog(`${pMon.name.toUpperCase()} used ${move.name}!${effTxt}`);
    setAnim({type:move.type,fromPlayer:true,key:Date.now(),isMega:pMega,isGiga:pGiga});
    await sleep(750); setAnim(null); await sleep(80);
    setHitE(true); await sleep(110); setHitE(false);
    setShakeE(true); await sleep(420); setShakeE(false);
    let enemyDied=false;
    setEHP(h=>{ const n=Math.max(0,h-dmg); if(n<=0){ enemyDied=true; handleEnemyFaint(); } return n; });
    pushLog(`Dealt ${dmg} damage!`);
    // Status infliction on enemy
    if(!eStatus&&!enemyDied&&STATUS_CHANCE[move.type]&&Math.random()<STATUS_CHANCE[move.type]){
      const st=STATUS_FROM[move.type];
      if(st){ setEStatus({type:st,turnsLeft:st==="sleep"?Math.ceil(Math.random()*3):99}); pushLog(`${STATUSES[st].icon} ${eMon.name.toUpperCase()} is now ${st.toUpperCase()}ED!`); }
    }
    // Weather chip on enemy
    if(weather?.chip>0&&!enemyDied){
      const chip=Math.max(1,Math.floor(eMaxHP*weather.chip));
      setEHP(h=>{ const n=Math.max(0,h-chip); if(n<=0) handleEnemyFaint(); return n; });
      pushLog(`${weather.icon} ${weather.name} dealt ${chip} chip dmg!`);
    }
    await sleep(600);
    if(!enemyDied){
      await enemyAttackTurn();
      await sleep(300);
      setBusy(false);
    }
  }

  function handlePlayerFaint(){
    if(battleEndedRef.current) return; // guard: only fire once per battle
    battleEndedRef.current = true;
    setFaintP(true);
    setTimeout(async()=>{
      pushLog(`💀 ${pMon.name.toUpperCase()} fainted!`);
      setProfile(p=>{const np={...p,losses:(p.losses||0)+1};updateProfile(np);
        if(!np.isGuest) supaUpdateStats(np.name,np.wins||0,np.losses,np.coins||0);
        return np;});
      markNeedsHeal(pMon, true);
      setWinStreak(0); if(!profile?.isGuest) localStorage.setItem(`pkmn_streak_${profile?.name}`,"0");
      const rec=makeBattleRecord(pMon,eMon,"enemy",battleTurns,pLevel);
      supaBattle(profile?.name||"unknown","enemy",pMon.name,eMon.name,battleTurns);
      setBattleHistory(h=>{ const n=[rec,...h].slice(0,50); if(!profile?.isGuest) localStorage.setItem(`pkmn_history_${profile?.name}`,JSON.stringify(n)); return n; });
      setWinner("enemy"); setScreen(MODES.OVER); setBusy(false);
    },700);
  }

  function handleEnemyFaint(){
    if(battleEndedRef.current) return; // guard: only fire once per battle
    battleEndedRef.current = true;
    setFaintE(true);
    setTimeout(async()=>{
      pushLog(`🏆 ${eMon.name.toUpperCase()} fainted! YOU WIN!`);
      // Streak
      setWinStreak(prev=>{
        const ns=prev+1;
        if(!profile?.isGuest) localStorage.setItem(`pkmn_streak_${profile?.name}`,String(ns));
        if(ns>=3){ setShowStreakBanner(true); setTimeout(()=>setShowStreakBanner(false),3500); }
        return ns;
      });
      const curStreak=winStreak+1; // accurate current streak value
      // x2 coins only when streak is strictly more than 2 wins (3+)
      const streakMult=curStreak>2?2:1;
      const baseReward=eMon.legendary?300:100;
      const reward=baseReward*streakMult;
      addCoins(reward);
      pushLog(`+${reward} 🪙 earned!${streakMult>1?` 🔥 ×${streakMult} STREAK BONUS!`:""}`);
      pushLog(`Win streak: ${curStreak} 🔥`);
      setProfile(p=>{ const np={...p,wins:(p.wins||0)+1}; updateProfile(np);
        if(!np.isGuest) supaUpdateStats(np.name,np.wins,np.losses||0,np.coins||0);
        return np; });
      markNeedsHeal(pMon, false, pHP); // track remaining HP after winning
      // Daily wins
      setDailyWins(prev=>{
        const nd=prev+1;
        if(!profile?.isGuest) localStorage.setItem(dailyWinsKey(profile?.name),String(nd));
        return nd;
      });
      // Update challenges
      setChallenges(prev=>{
        const updated=prev.map(ch=>{
          if(ch.done) return ch;
          let prog=ch.progress||0;
          if(ch.countGoal){ prog=Math.min(ch.countGoal,(prog||0)+1); }
          if(ch.checkWin&&ch.checkWin(eMon)) prog=1;
          if(ch.isNoItems&&!usedItemsThisBattle) prog=1;
          if(ch.isZWin&&usedZThisBattle) prog=1;
          if(ch.isMegaWin&&usedMegaThisBattle) prog=1;
          if(ch.isStreak&&curStreak>=3) prog=1;
          const done=ch.countGoal?prog>=ch.countGoal:prog>=1;
          return {...ch,progress:prog,done};
        });
        if(!profile?.isGuest) localStorage.setItem(challengeKey(profile?.name),JSON.stringify(updated));
        updated.forEach((ch,i)=>{ if(ch.done&&!prev[i].done){ addCoins(ch.reward); pushLog(`🌟 Challenge: "${ch.desc}" done! +${ch.reward}🪙`); } });
        return updated;
      });
      // ── EXP gain + evolution check ──────────────────────────
      const expGain = Math.floor((eMon.legendary?300:eMon.hp*2+eMon.attack) * (1+(pLevel-50)*0.01));
      setExpMap(prev=>{
        const cur=prev[pMon.id]||0;
        const newExp=cur+expGain;
        const oldLvl=LEVEL_FROM_EXP(cur);
        const newLvl=LEVEL_FROM_EXP(newExp);
        const updated={...prev,[pMon.id]:newExp};
        localStorage.setItem(`pkmn_exp_${profile?.name}`,JSON.stringify(updated));
        if(newLvl>oldLvl){
          pushLog(`⬆️ ${pMon.name.toUpperCase()} grew to Lv${newLvl}!`);
          setTeamLevels(tl=>{
            const n={...tl,[pMon.id]:newLvl};
            localStorage.setItem(`pkmn_levels_${profile?.name}`,JSON.stringify(n));
            return n;
          });
          // Check evolution
          const evo=EVOLVE_MAP[pMon.id];
          if(evo&&!evo.item&&newLvl>=evo.minLevel){
            setPendingEvo({oldMon:pMon,newId:evo.evolvesTo,newLevel:newLvl});
          }
        }
        return updated;
      });
      pushLog(`+${expGain} EXP gained!`);
      // ── Trigger evolution if pending (after battle over screen)
      // Evolution fires when navigating away from OVER screen — handled via useEffect
      // ── Save battle to history ──────────────────────────────
      const record=makeBattleRecord(pMon,eMon,"player",battleTurns,pLevel);
      supaBattle(profile?.name||"unknown","player",pMon.name,eMon.name,battleTurns);
      setBattleHistory(h=>{ const n=[record,...h].slice(0,50); if(!profile?.isGuest) localStorage.setItem(`pkmn_history_${profile?.name}`,JSON.stringify(n)); return n; });
      // ── Story mode progress ─────────────────────────────────
      if(storyBattle!=null){
        setStoryProgress(prev=>{
          const n=[...new Set([...prev,storyBattle])];
          localStorage.setItem(storyKey(profile?.name),JSON.stringify(n));
          return n;
        });
        setStoryBattle(null);
      }
      setWinner("player"); setScreen(MODES.OVER); setBusy(false);
    },700);
  }

  // ── Heal center — select individual pokemon to heal ──────────────────────────
  function toggleHealSelect(id){
    setSelectedToHeal(s=>{ const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });
  }

  function submitHeal(targetOverride){
    const p=profileRef.current;
    const target = targetOverride
      ? targetOverride
      : faintedTeam.filter(m=>selectedToHeal.has(m.id)).length>0
        ? faintedTeam.filter(m=>selectedToHeal.has(m.id))
        : faintedTeam;
    if(target.length===0){ setHealDone(true); return; }
    setHealQueue([...target]);
    setHealDone(false);
    AUDIO.sfx("heal_chime");
    setTimeout(()=>{
      const healedIds = new Set(target.map(m=>m.id));
      setFaintedTeam(ft=>{
        const remaining=ft.filter(m=>!healedIds.has(m.id));
        // Synchronously clear healed pokemon from localStorage
        if(p&&!p.isGuest){
          try{ localStorage.setItem(`pkmn_fainted_${p.name}`,JSON.stringify(remaining)); }catch{}
        }
        return remaining;
      });
      setSelectedToHeal(new Set());
      setHealQueue([]);
      setHealDone(true);
      AUDIO.sfx("heal_chime");
    }, 2800);
  }

  // ── Shop ──────────────────────────────────────────────────
  // ── Trade handler ────────────────────────────────────────
  function handleTrade(giving, receiving, cost){
    // Validate both sides are proper pokemon objects with ids
    if(!giving?.id || !receiving?.id){
      pushHomeLog("Trade failed: invalid Pokémon selection!"); return;
    }
    // Get full pokemon data from allPokemon to ensure we have moves/stats
    const fullReceiving = allPokemon.find(p=>p.id===receiving.id);
    if(!fullReceiving){
      pushHomeLog("Trade failed: Pokémon data not loaded yet. Try again!"); return;
    }
    // Check coins again at time of trade (double safety)
    if((profile.coins||0)<cost){
      pushHomeLog(`Trade failed: Need ${cost}🪙! You have ${profile.coins||0}🪙.`); return;
    }
    // Deduct coins
    const np={...profile,coins:(profile.coins||0)-cost};
    setProfile(np); updateProfile(np);
    // Update unlocked: remove given, add received
    const nu=new Set([...unlockedIds]);
    nu.delete(giving.id);
    nu.add(fullReceiving.id);
    setUnlockedIds(nu);
    const store=profile?.isGuest?sessionStorage:localStorage;
    store.setItem(`pkmn_unlocked_${profile.name}`,JSON.stringify([...nu]));
    // Update team: replace traded-away pokemon with received one
    setTeam(t=>t.map(m=>m.id===giving.id?fullReceiving:m));
    // If traded the starter, update starter to received
    if(starterPokemon?.id===giving.id){
      setStarterPokemon(fullReceiving);
      store.setItem(`pkmn_starter_${profile.name}`,JSON.stringify(fullReceiving));
    }
    pushHomeLog(`✅ Traded ${giving.name} → ${fullReceiving.name}! (-${cost}🪙)`);
    setShowTrade(false);
  }

  // ── Story battle start ────────────────────────────────────
  function startStoryBattle(gym, allPokemon){
    const enemyMon = allPokemon.find(p=>p.id===gym.team[gym.team.length-1]) || allPokemon.find(p=>p.types.includes(gym.type)) || allPokemon[Math.floor(Math.random()*allPokemon.length)];
    if(!enemyMon||!pMon){ alert("Select your Pokémon from Team first!"); return; }
    const lvl=teamLevels[pMon.id]||50;
    const pMax=(pMon.hp+lvl)*2, eMax=(enemyMon.hp+gym.level)*2;
    setPMon(pMon); setEMon({...enemyMon,attack:Math.floor(enemyMon.attack*(1+(gym.level-50)*0.02)),defense:Math.floor(enemyMon.defense*(1+(gym.level-50)*0.02))});
    setPHP(pMax); setEHP(eMax); setPMaxHP(pMax); setEMaxHP(eMax); setPLevel(lvl);
    setLog([`🏟️ GYM LEADER ${gym.name.toUpperCase()} wants to battle!`,`${gym.hint}`,`Go, ${pMon.name.toUpperCase()}! (Lv${lvl})`]);
    setFaintP(false); setFaintE(false); setHitP(false); setHitE(false);
    setWinner(null); setBusy(false); setAnim(null); setShowItems(false); setBattleTurns(0);
    setPMega(false); setPMegaSlug(null); setPGiga(false); setUsedZ(false); setUsedMega(false); setUsedGiga(false); setShowMegaAnim(false); setShowGigaAnim(false);
    setWeather(WEATHERS[Math.floor(Math.random()*WEATHERS.length)]);
    setPStatus(null); setEStatus(null);
    setStoryBattle(gym.id);
    const bag={};
    SHOP_ITEMS.forEach(it=>{ bag[it.id]=(inventory[it.id]||0); });
    setBagItems(bag);
    setScreen(MODES.BATTLE);
  }

  function buyItem(item){
    if((profile?.coins||0)<item.cost){ alert(`Need ${item.cost} coins!`); return; }
    const np={...profile,coins:(profile.coins||0)-item.cost};
    setProfile(np); updateProfile(np);
    const ni={...inventory,[item.id]:(inventory[item.id]||0)+1};
    setInventory(ni);
    localStorage.setItem(`pkmn_inv_${profile?.name}`,JSON.stringify(ni));
    pushHomeLog(`Bought ${item.name}!`);
  }

  // ── Multiplayer ───────────────────────────────────────────
  function connectWS(){
    if(wsRef.current) wsRef.current.close();
    setWsStatus("connecting");
    const ws=new WebSocket(WS_URL); wsRef.current=ws;
    ws.onopen=()=>setWsStatus("connected");
    ws.onclose=()=>setWsStatus("disconnected");
    ws.onerror=()=>setWsStatus("disconnected");
    ws.onmessage=e=>handleWS(JSON.parse(e.data));
  }

  function handleWS(msg){
    switch(msg.type){
      case"room_joined": setRoomId(msg.roomId); setMpLog(l=>[...l,`✅ Room ${msg.roomId} — waiting…`]); setScreen(MODES.WAIT); break;
      case"battle_start": setOppMon(msg.opponentPokemon); setOppHP(msg.opponentPokemon.hp*2); setMyTurn(msg.firstTurn); setIsMpBattle(true); setScreen(MODES.MP); break;
      case"opponent_move": setPHP(h=>Math.max(0,h-msg.damage)); setShakeP(true); setTimeout(()=>setShakeP(false),420); setMyTurn(true); break;
      case"battle_result": setWinner(msg.winner==="you"?"player":"enemy"); setScreen(MODES.OVER); break;
    }
  }

  function createRoom(){
    if(!wsRef.current||wsStatus!=="connected") return;
    const code=genRoomCode();
    setRoomInput(code);
    wsRef.current.send(JSON.stringify({type:"join_room",roomId:code,pokemon:pMon}));
  }

  function joinRoom(){
    if(!wsRef.current||wsStatus!=="connected"||!roomInput) return;
    wsRef.current.send(JSON.stringify({type:"join_room",roomId:roomInput,pokemon:pMon}));
  }

  function sendMove(move){
    if(!myTurn||!wsRef.current) return;
    const{dmg}=calcDmg(pMon,move,oppMon,pLevel);
    wsRef.current.send(JSON.stringify({type:"use_move",move,damage:dmg}));
    setOppHP(h=>Math.max(0,h-dmg)); setShakeE(true); setTimeout(()=>setShakeE(false),420);
    setMpLog(l=>[...l,`You used ${move.name}! -${dmg}`]);
    setMyTurn(false);
  }

  function copyInvite(){
    const inviteText=`Join my Pokémon battle! Room code: ${roomId} — Open the game and enter this code in Multiplayer!`;
    navigator.clipboard.writeText(inviteText).then(()=>{
      setCopySuccess(true); setTimeout(()=>setCopySuccess(false),2000);
    });
  }

  useEffect(()=>{ if(logRef.current) logRef.current.scrollTop=logRef.current.scrollHeight; },[log,mpLog]);

  // ══════════════════════════════════════════════════════════
  //  CHARACTER SCREEN
  // ══════════════════════════════════════════════════════════
  if(screen===MODES.CHAR){
    return <CharacterScreen onDone={p=>{
      if(p.isGuest){
        // Guests: no session saved — they always go back to login on refresh
        setProfile(p);
        setScreen(MODES.STARTER);
        setTimeout(()=>{ musicStarted.current=true; if(musicOn) AUDIO.play("select"); },200);
        return;
      }
      // Registered user: save session so refresh restores them
      localStorage.setItem("pkmn_active_session",JSON.stringify({name:p.name,ts:Date.now()}));
      setProfile(p);
      const savedStarter=localStorage.getItem(`pkmn_starter_${p.name}`);
      if(savedStarter){ setStarterPokemon(JSON.parse(savedStarter)); setScreen(MODES.HOME); }
      else { setScreen(MODES.STARTER); }
      setTimeout(()=>{ musicStarted.current=true; if(musicOn) AUDIO.play("home"); },200);
    }}/>;
  }

  // ══════════════════════════════════════════════════════════
  //  STARTER SCREEN
  // ══════════════════════════════════════════════════════════
  if(screen===MODES.STARTER){
    if(allPokemon.length<12) return(
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#05050d",color:"#555",fontFamily:"'Press Start 2P',monospace",fontSize:"10px",flexDirection:"column",gap:16}}>
        <div style={{animation:"pulse 1.5s infinite"}}>Loading Pokémon… {loadPct}%</div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:3,height:4,width:220,overflow:"hidden"}}>
          <div style={{width:`${loadPct}%`,background:"linear-gradient(90deg,#7C4DFF,#4FC3F7)",height:"100%",transition:"width 0.3s"}}/>
        </div>
      </div>
    );
    return <StarterScreen allPokemon={allPokemon} onBack={profile?.isGuest?()=>{setProfile(null);setScreen(MODES.CHAR);}:null} onDone={p=>{
      setStarterPokemon(p);
      const store=profile?.isGuest?sessionStorage:localStorage;
      store.setItem(`pkmn_starter_${profile.name}`,JSON.stringify(p));
      const nu=new Set([p.id]); // only the starter — fresh start
      setUnlockedIds(nu);
      store.setItem(`pkmn_unlocked_${profile.name}`,JSON.stringify([...nu]));
      // Reset streak for fresh account
      setWinStreak(0);
      if(!profile?.isGuest) localStorage.setItem(`pkmn_streak_${profile.name}`,"0");
      setScreen(MODES.HOME);
    }}/>;
  }

  // ══════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════
  const canUseZ=!usedZ&&(bagItems.z_crystal||0)>0;
  const canMega=!usedMega&&pMon?.canMega&&(bagItems.mega_stone||0)>0;
  const canGiga=!usedGiga&&pMon?.canGiga&&(bagItems.dynamax_band||0)>0;

  return(
    <div style={{minHeight:"100vh",background:"#05050d",fontFamily:"'Press Start 2P',monospace",display:"flex",flexDirection:"column",alignItems:"center",padding:"clamp(12px,3vw,24px) clamp(10px,3vw,20px)",position:"relative",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        /* ── Responsive font base ── */
        html{ font-size:18px; }
        @media(max-width:1200px){ html{ font-size:17px; } }
        @media(max-width:768px){ html{ font-size:16px; } }
        @media(max-width:480px){ html{ font-size:14px; } }

        /* ── Keyframes ── */
        @keyframes shake{0%,100%{transform:translateX(0)scale(1.42)}25%{transform:translateX(-14px)scale(1.42)}75%{transform:translateX(14px)scale(1.42)}}
        @keyframes shakeBack{0%,100%{transform:scaleX(-1)scale(1.65)}25%{transform:scaleX(-1)translateX(14px)scale(1.65)}75%{transform:scaleX(-1)translateX(-14px)scale(1.65)}}
        @keyframes faintAnim{0%{opacity:1;transform:scale(1.42)translateY(0)}100%{opacity:0;transform:scale(0.55)translateY(60px)}}
        @keyframes floatMon{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes floatMega{0%,100%{transform:translateY(0) scale(1.65) scaleX(-1)}33%{transform:translateY(-10px) scale(1.72) scaleX(-1) rotate(-2deg)}66%{transform:translateY(-6px) scale(1.68) scaleX(-1) rotate(2deg)}}
        @keyframes floatGiga{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes glow{0%,100%{text-shadow:0 0 20px #FFD54F,0 0 50px #FF6B35}50%{text-shadow:0 0 55px #FFD54F,0 0 110px #FF6B35}}
        @keyframes megaGlow{0%,100%{box-shadow:0 0 20px #7C4DFF}50%{box-shadow:0 0 50px #7C4DFF,0 0 90px #F06292}}
        @keyframes gigaGlow{0%,100%{box-shadow:0 0 20px #FFD54F}50%{box-shadow:0 0 50px #FFD54F,0 0 90px #FF6B35}}
        @keyframes zPulse{0%,100%{box-shadow:0 0 20px #FF6B35}50%{box-shadow:0 0 50px #FF6B35,0 0 90px #FFD54F}}
        @keyframes loginBlob1{0%{transform:translate(0,0) scale(1)}100%{transform:translate(5%,8%) scale(1.1)}}
        @keyframes loginBlob2{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-6%,4%) scale(1.08)}}
        @keyframes loginBlob3{0%{transform:translate(0,0) scale(1)}100%{transform:translate(3%,-5%) scale(1.06)}}
        @keyframes floatParticle0{0%{transform:translateY(0)}100%{transform:translateY(-18px)}}
        @keyframes floatParticle1{0%{transform:translateY(0)}100%{transform:translateY(-12px)}}
        @keyframes floatParticle2{0%{transform:translateY(0)}100%{transform:translateY(-22px)}}
        @keyframes floatParticle3{0%{transform:translateY(0)}100%{transform:translateY(-15px)}}

        /* ── Interactive ── */
        .pcard:hover:not([disabled]){transform:translateY(-4px) scale(1.06)!important;z-index:2}
        .btn:hover:not(:disabled){filter:brightness(1.35);transform:scale(1.04);}
        .btn:active:not(:disabled){transform:scale(0.95);}

        /* ── Scrollbar ── */
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#080816}::-webkit-scrollbar-thumb{background:#1e1e32;border-radius:4px}

        /* ── Base ── */
        input,select{outline:none!important}
        *{box-sizing:border-box}

        /* ── Touch targets ── */
        button{min-height:36px; touch-action:manipulation;}
        @media(max-width:480px){ button{min-height:44px;} }

        /* ── Battle responsive ── */
        @media(max-width:600px){
          .battle-arena{flex-direction:column!important;gap:8px!important}
          .move-grid{grid-template-columns:1fr 1fr!important}
          .battle-sprite{width:80px!important}
        }

        /* ── Home grid responsive ── */
        @media(max-width:400px){
          .home-grid{grid-template-columns:1fr 1fr!important}
        }

        /* ── Text scaling ── */
        .ps2{font-family:'Press Start 2P',monospace!important}
        .t-xs{font-size:clamp(7px,1.5vw,10px)}
        .t-sm{font-size:clamp(9px,1.8vw,12px)}
        .t-md{font-size:clamp(11px,2.2vw,15px)}
        .t-lg{font-size:clamp(14px,2.8vw,20px)}
        .t-xl{font-size:clamp(18px,4vw,28px)}

        /* ── Card spacing ── */
        .game-card{
          background:rgba(10,10,28,0.98);
          border-radius:clamp(10px,2vw,16px);
          padding:clamp(12px,3vw,20px);
        }

        /* ── Input style ── */
        .game-input{
          width:100%;
          background:rgba(255,255,255,0.05);
          border:1.5px solid rgba(124,77,255,0.3);
          border-radius:10px;
          padding:clamp(10px,2vw,13px);
          color:#fff;
          font-size:clamp(11px,2vw,14px);
          font-family:'Press Start 2P',monospace;
        }
      `}</style>

      {/* Background grid */}
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(124,77,255,0.035)1px,transparent 1px),linear-gradient(90deg,rgba(124,77,255,0.035)1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>

      {/* ── TOP BAR ─────────────────────────────────────── */}
      {screen!==MODES.HOME&&screen!==MODES.CHAR&&screen!==MODES.STARTER&&screen!==MODES.MP_SOON&&(
        <div style={{position:"fixed",top:12,left:12,zIndex:300}}>
          <button className="btn" onClick={e=>{
            e.stopPropagation();
            if(screen===MODES.BATTLE||screen===MODES.OVER||screen===MODES.WAIT||screen===MODES.MP){
              setBusy(false); setAnim(null); setWinner(null);
              setScreen(MODES.SELECT);
              if(musicOn&&musicStarted.current) AUDIO.play("select");
            } else if(screen===MODES.UNLOCK){
              setScreen(MODES.HOME);
              if(musicOn&&musicStarted.current) setTimeout(()=>AUDIO.play("home"),80);
            } else {
              AUDIO.stop(); AUDIO.theme=null;
              setScreen(MODES.HOME);
              if(musicOn&&musicStarted.current) setTimeout(()=>AUDIO.play("home"),80);
            }
          }} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,padding:"7px 14px",color:"#888",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,1.8vw,12px)",display:"flex",alignItems:"center",gap:5}}>
            ← {screen===MODES.BATTLE||screen===MODES.OVER?"SELECT":screen===MODES.UNLOCK?"HOME":screen===MODES.SELECT||screen===MODES.UNLOCK||screen===MODES.TEAM||screen===MODES.SHOP||screen===MODES.HEAL||screen===MODES.STORY||screen===MODES.HISTORY?"HOME":"BACK"}
          </button>
        </div>
      )}

      {screen!==MODES.MP_SOON&&<div style={{position:"fixed",top:12,right:12,display:"flex",gap:6,zIndex:300,flexWrap:"wrap",justifyContent:"flex-end"}}>
        {screen!==MODES.HOME&&(
          <button onClick={e=>{e.stopPropagation();AUDIO.stop();AUDIO.theme=null;setScreen(MODES.HOME);setBusy(false);setAnim(null);setWinner(null);if(musicOn&&musicStarted.current)setTimeout(()=>AUDIO.play("home"),80);}}
            className="btn" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"7px 11px",color:"#aaa",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(10px,2vw,14px)"}}>
            🏠
          </button>
        )}
        <button onClick={e=>{e.stopPropagation();setShowBoard(true);}} className="btn" style={{background:"rgba(255,213,79,0.07)",border:"1px solid rgba(255,213,79,0.18)",borderRadius:8,padding:"7px 10px",color:"#FFD54F",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"12px"}}>🏆</button>
        <button onClick={e=>{e.stopPropagation();setShowChallenges(true);}} className="btn" style={{background:"rgba(79,195,247,0.07)",border:"1px solid rgba(79,195,247,0.18)",borderRadius:8,padding:"7px 10px",color:"#4FC3F7",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"12px",position:"relative"}}>
          📅
          {challenges.filter(c=>!c.done).length>0&&<span style={{position:"absolute",top:-3,right:-3,background:"#f44336",color:"#fff",fontSize:"7px",borderRadius:"50%",width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Press Start 2P',monospace"}}>{challenges.filter(c=>!c.done).length}</span>}
        </button>
        <button onClick={e=>{e.stopPropagation();const n=!musicOn;setMusicOn(n);if(!n)AUDIO.stop();else if(musicStarted.current) AUDIO.play(screen===MODES.BATTLE||screen===MODES.MP?"battle":"home");}}
          className="btn" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"7px 10px",color:musicOn?"#FFD54F":"#333",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"14px"}}>
          {musicOn?"♪":"♩"}
        </button>
      </div>}

      {showBoard&&<HallOfFame onClose={()=>setShowBoard(false)} currentName={profile?.name}/>}
      {showChallenges&&<DailyChallengesScreen challenges={challenges} onClose={()=>setShowChallenges(false)}/>}
      {screen===MODES.DEX&&<PokedexScreen allPokemon={allPokemon} unlockedIds={unlockedIds} starterPokemon={starterPokemon} isGuest={!!profile?.isGuest} onClose={()=>setScreen(MODES.HOME)}/>}
      {screen===MODES.CARD&&<TrainerCard profile={profile} starterPokemon={starterPokemon} winStreak={winStreak} unlockedIds={unlockedIds} onClose={()=>setScreen(MODES.HOME)}/>}
      {showStreakBanner&&<StreakBanner streak={winStreak+1}/>}

      {/* ── HEADER ──────────────────────────────────────── */}
      {screen!==MODES.MP_SOON&&(
      <div style={{textAlign:"center",marginBottom:"clamp(14px,3vw,24px)",paddingTop:"clamp(6px,1.5vw,10px)"}}>
        <div style={{fontSize:"clamp(18px,4.5vw,32px)",background:"linear-gradient(135deg,#FF6B35,#FFD54F,#4FC3F7,#7C4DFF,#F06292)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:2,marginBottom:4,fontFamily:"'Press Start 2P',monospace"}}>⚡ POKÉMON</div>
        <div style={{fontSize:"clamp(7px,1.5vw,11px)",color:"#252535",letterSpacing:5,fontFamily:"'Press Start 2P',monospace"}}>BATTLE ARENA</div>
      </div>
      )}

      {/* ══════════════════════════════════════════════════
          HOME SCREEN
      ══════════════════════════════════════════════════ */}
      {screen===MODES.HOME&&(
        <div style={{width:"100%",maxWidth:720,display:"flex",flexDirection:"column",gap:14}}>
          {/* Guest sign-in banner */}
          {profile?.isGuest&&(
            <div style={{background:"linear-gradient(135deg,rgba(124,77,255,0.15),rgba(79,195,247,0.1))",border:"1.5px solid rgba(124,77,255,0.4)",borderRadius:14,padding:"clamp(12px,2.5vw,16px) clamp(14px,3vw,20px)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:4}}>
              <div>
                <div style={{color:"#FFD54F",fontSize:"clamp(9px,1.8vw,12px)",fontFamily:"'Press Start 2P',monospace",marginBottom:4}}>👤 PLAYING AS GUEST</div>
                <div style={{color:"#555",fontSize:"clamp(7px,1.3vw,9px)",fontFamily:"'Press Start 2P',monospace"}}>Sign in to save your progress!</div>
              </div>
              <button onClick={()=>setScreen(MODES.CHAR)} className="btn" style={{background:"linear-gradient(135deg,rgba(124,77,255,0.4),rgba(79,195,247,0.25))",border:"2px solid rgba(124,77,255,0.7)",borderRadius:10,padding:"clamp(9px,1.8vw,12px) clamp(14px,2.5vw,20px)",color:"#fff",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,1.8vw,12px)",boxShadow:"0 0 20px rgba(124,77,255,0.3)",whiteSpace:"nowrap"}}>
                🔐 SIGN IN
              </button>
            </div>
          )}

          {/* Profile bar */}
          <div style={{background:"rgba(10,10,28,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>

            {/* Left: avatar + name + stats */}
            <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
              <ProfileAvatar profile={profile} size={42}/>
              <div style={{minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{color:"#fff",fontSize:"clamp(11px,2vw,16px)",fontFamily:"'Press Start 2P',monospace",whiteSpace:"nowrap"}}>{profile?.name}</span>
                  {profile?.isGuest&&<span style={{color:"#555",fontSize:"clamp(6px,1vw,8px)",fontFamily:"'Press Start 2P',monospace",background:"rgba(255,255,255,0.05)",borderRadius:4,padding:"2px 6px"}}>GUEST</span>}
                </div>
                <div style={{color:"#444",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",marginTop:4,display:"flex",gap:10,flexWrap:"wrap"}}>
                  <span><span style={{color:"#4CAF50"}}>{profile?.wins||0}</span>W / <span style={{color:"#f44336"}}>{profile?.losses||0}</span>L</span>
                  <span style={{color:"#FFD54F"}}>🪙{profile?.coins||0}</span>
                </div>
              </div>
            </div>

            {/* Center: starter pokemon */}
            {starterPokemon&&(
              <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"6px 12px"}}>
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${starterPokemon.id}.png`} style={{width:30,imageRendering:"pixelated"}}/>
                <div>
                  <div style={{color:"#FFD54F",fontSize:"7px",fontFamily:"'Press Start 2P',monospace",marginBottom:2}}>STARTER</div>
                  <div style={{color:"#fff",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",textTransform:"capitalize"}}>{starterPokemon.name}</div>
                </div>
              </div>
            )}

            {/* Right: sign out */}
            <button onClick={()=>{
              localStorage.removeItem("pkmn_active_session");
              AUDIO.stop(); AUDIO.theme=null;
              setProfile(null); setScreen(MODES.CHAR);
              setStarterPokemon(null); setUnlockedIds(new Set());
              setTeam([]); setFaintedTeam([]); setBattleHistory([]);
            }} className="btn" style={{background:"rgba(244,67,54,0.08)",border:"1px solid rgba(244,67,54,0.2)",borderRadius:8,padding:"8px 14px",color:"#f44336",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(7px,1.2vw,9px)",whiteSpace:"nowrap",flexShrink:0}}>
              🚪 SIGN OUT
            </button>

          </div>

          {/* Injured warning */}
          {faintedTeam.length>0&&(
            <div style={{background:"rgba(244,67,54,0.08)",border:"1px solid rgba(244,67,54,0.3)",borderRadius:12,padding:"12px 16px",display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{color:"#f44336",fontSize:"11px",fontFamily:"'Press Start 2P',monospace",marginBottom:4}}>⚠️ INJURED POKÉMON</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {faintedTeam.map(f=><span key={f.id} style={{color:"#888",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>💀{f.name}</span>)}
                </div>
              </div>
              <button onClick={()=>{setHealDone(false);setScreen(MODES.HEAL);}} className="btn" style={{background:"rgba(244,67,54,0.15)",border:"1px solid rgba(244,67,54,0.4)",borderRadius:9,padding:"9px 14px",color:"#f44336",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px"}}>🏥 HEAL NOW</button>
            </div>
          )}

          {/* Main actions */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(120px,20vw,160px),1fr))",gap:10}}>
            {[
              {icon:"⚔️", label:"BATTLE",        sub:"VS CPU",            col:"#FF6B35", action:()=>setScreen(MODES.SELECT)},
              {icon:"👥", label:"TEAM",           sub:"Manage roster",     col:"#4FC3F7", action:()=>setScreen(MODES.TEAM)},
              {icon:"🛒", label:"SHOP",           sub:"Spend coins",       col:"#FFD54F", action:()=>setScreen(MODES.SHOP)},
              {icon:"🏥", label:"POKÉMON\nCENTER",sub:"Heal fainted",      col:"#f44336", action:()=>{setHealDone(false);setScreen(MODES.HEAL);}},
              {icon:"👤", label:"PROFILE",        sub:"Edit avatar & account",col:"#CE93D8", action:()=>setScreen(MODES.PROFILE)},
              {icon:"🌐", label:"MULTIPLAYER",    sub:"Coming soon!",      col:"#7C4DFF", action:()=>setScreen(MODES.MP_SOON)},
              {icon:"📖", label:"POKÉDEX",        sub:`${unlockedIds.size} caught`, col:"#4FC3F7", action:()=>setScreen(MODES.DEX)},
              {icon:"📅", label:"CHALLENGES",     sub:`${challenges.filter(c=>!c.done).length} remaining`, col:"#66BB6A", action:()=>setShowChallenges(true),
                badge: challenges.filter(c=>!c.done).length>0 ? challenges.filter(c=>!c.done).length : null},
              {icon:"🎴", label:"TRAINER CARD",   sub:"View your record",  col:"#CE93D8", action:()=>setScreen(MODES.CARD)},
              {icon:"🗺️", label:"STORY MODE",      sub:`${storyProgress.length}/13 gyms`, col:"#FF6B35", action:()=>setScreen(MODES.STORY)},
              {icon:"📜", label:"BATTLE LOG",      sub:`${battleHistory.length} battles`,  col:"#9E9E9E", action:()=>setScreen(MODES.HISTORY)},
              {icon:"🔄", label:"TRADE",           sub:"Swap Pokémon",       col:"#66BB6A", action:()=>setShowTrade(true)},
            ].map((b,i)=>(
              <div key={i} onClick={b.action} className="btn pcard" style={{background:`linear-gradient(160deg,rgba(14,14,36,0.98),rgba(6,6,22,0.99))`,border:`1.5px solid ${b.col}33`,borderRadius:14,padding:"18px 14px",cursor:"pointer",textAlign:"center",transition:"all 0.16s",boxShadow:`0 4px 20px ${b.col}18`,position:"relative"}}>
                {b.badge&&<div style={{position:"absolute",top:8,right:8,background:"#f44336",color:"#fff",fontSize:"7px",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Press Start 2P',monospace"}}>{b.badge}</div>}
                <div style={{fontSize:"clamp(24px,4vw,34px)",marginBottom:6}}>{b.icon}</div>
                <div style={{color:"#fff",fontSize:"clamp(10px,2vw,15px)",fontFamily:"'Press Start 2P',monospace",marginBottom:4,whiteSpace:"pre-line",lineHeight:1.6}}>{b.label}</div>
                <div style={{color:"#333",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>{b.sub}</div>
              </div>
            ))}
          </div>

          {/* Win streak display */}
          {winStreak>=2&&(
            <div style={{background:"linear-gradient(135deg,rgba(255,107,53,0.12),rgba(255,213,79,0.08))",border:"1px solid rgba(255,107,53,0.3)",borderRadius:12,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:"24px"}}>🔥</div>
              <div>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"10px",color:"#FF6B35"}}>WIN STREAK: {winStreak}</div>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#555",marginTop:2}}>Coin bonus: ×{winStreak>=5?3:winStreak>=3?2:1} — keep it going!</div>
              </div>
            </div>
          )}

          {/* Daily challenges teaser */}
          <div onClick={()=>setShowChallenges(true)} className="btn pcard" style={{background:"rgba(10,10,28,0.98)",border:"1px solid rgba(79,195,247,0.15)",borderRadius:12,padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:"22px"}}>📅</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"9px",color:"#4FC3F7",marginBottom:3}}>DAILY CHALLENGES</div>
              <div style={{display:"flex",gap:6}}>{challenges.map((c,i)=><div key={i} style={{fontSize:"14px"}}>{c.done?"✅":c.icon}</div>)}</div>
            </div>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#333"}}>{challenges.filter(c=>c.done).length}/3 done</div>
          </div>

          {homeLog.length>0&&(
            <div style={{background:"rgba(4,4,12,0.8)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:9,padding:"10px 14px"}}>
              {homeLog.map((l,i)=><div key={i} style={{color:"#555",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",lineHeight:2}}>{l}</div>)}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          BATTLE SELECT — owned Pokémon only
      ══════════════════════════════════════════════════ */}
      {screen===MODES.SELECT&&(
        <div style={{width:"100%",maxWidth:960}}>
          <div style={{textAlign:"center",marginBottom:"clamp(12px,2.5vw,18px)"}}>
            <div style={{fontSize:"clamp(13px,3vw,20px)",color:"#FFD54F",fontFamily:"'Press Start 2P',monospace",marginBottom:6}}>⚔️ CHOOSE YOUR FIGHTER</div>
            <div style={{fontSize:"clamp(8px,1.5vw,11px)",color:"#333",fontFamily:"'Press Start 2P',monospace"}}>
              {allPokemon.filter(isUnlocked).length} Pokémon owned
              {" · "}
              <button onClick={()=>setScreen(MODES.UNLOCK)} style={{background:"none",border:"none",color:"#4FC3F7",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(8px,1.5vw,11px)",textDecoration:"underline"}}>
                + Unlock more →
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            <input value={searchQ} onChange={e=>{setSearchQ(e.target.value);setPage(0);}}
              placeholder="Search your Pokémon…"
              style={{flex:"1 1 160px",minWidth:140,background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"clamp(9px,1.8vw,12px) clamp(10px,2vw,14px)",color:"#fff",fontSize:"clamp(10px,1.8vw,13px)",fontFamily:"'Press Start 2P',monospace"}}/>
            <select value={typeFilt} onChange={e=>{setTypeFilt(e.target.value);setPage(0);}}
              style={{background:"rgba(10,10,28,0.98)",border:"1.5px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"clamp(9px,1.8vw,12px)",color:"#888",fontSize:"clamp(9px,1.6vw,12px)",fontFamily:"'Press Start 2P',monospace"}}>
              <option value="all">All Types</option>
              {Object.keys(TC).map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Owned Pokémon grid */}
          {(()=>{
            const owned=allPokemon.filter(p=>isUnlocked(p)&&(searchQ?p.name.toLowerCase().includes(searchQ.toLowerCase())||String(p.id).includes(searchQ):true)&&(typeFilt!=="all"?p.types.includes(typeFilt):true));
            if(owned.length===0) return(
              <div style={{textAlign:"center",padding:"clamp(20px,4vw,40px)",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16}}>
                <div style={{fontSize:"clamp(24px,5vw,40px)",marginBottom:12}}>📭</div>
                <div style={{color:"#555",fontSize:"clamp(9px,1.8vw,12px)",fontFamily:"'Press Start 2P',monospace",marginBottom:12}}>No Pokémon found!</div>
                <button onClick={()=>setScreen(MODES.UNLOCK)} className="btn"
                  style={{background:"rgba(79,195,247,0.15)",border:"1.5px solid rgba(79,195,247,0.4)",borderRadius:10,padding:"clamp(10px,2vw,13px) clamp(16px,3vw,24px)",color:"#4FC3F7",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,1.8vw,12px)"}}>
                  🔓 UNLOCK POKÉMON
                </button>
              </div>
            );
            return(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(120px,16vw,160px),1fr))",gap:"clamp(8px,1.5vw,12px)",marginBottom:16}}>
                {owned.map(p=>{
                  const isTrulyFainted=faintedTeam.some(f=>f.id===p.id&&f.fainted);
                  return(
                    <div key={p.id} className="pcard" style={{position:"relative"}}>
                      <PokemonCard mon={p} onSelect={m=>{
                        if(isTrulyFainted){
                          setHealDone(false); setScreen(MODES.HEAL);
                        } else {
                          startBattle(m);
                        }
                      }} selected={false} unlocked={true} coins={profile?.coins||0} onUnlock={()=>{}} cost={0}/>
                      {isTrulyFainted&&(
                        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.72)",borderRadius:"inherit",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,pointerEvents:"none"}}>
                          <div style={{fontSize:"22px"}}>💀</div>
                          <div style={{color:"#f44336",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",textAlign:"center",lineHeight:1.6}}>FAINTED<br/><span style={{color:"#888",fontSize:"6px"}}>Heal first</span></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          UNLOCK SHOP — browse all Pokémon, buy what you want
      ══════════════════════════════════════════════════ */}
      {screen===MODES.UNLOCK&&(
        <div style={{width:"100%",maxWidth:960}}>
          <div style={{textAlign:"center",marginBottom:"clamp(12px,2.5vw,18px)"}}>
            <div style={{fontSize:"clamp(13px,3vw,20px)",color:"#4FC3F7",fontFamily:"'Press Start 2P',monospace",marginBottom:6}}>🔓 UNLOCK POKÉMON</div>
            <div style={{fontSize:"clamp(8px,1.5vw,11px)",color:"#FFD54F",fontFamily:"'Press Start 2P',monospace"}}>
              Balance: {profile?.coins||0}🪙
            </div>
          </div>

          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
            <input value={searchQ} onChange={e=>{setSearchQ(e.target.value);setPage(0);}}
              placeholder="Search Pokémon…"
              style={{flex:"1 1 160px",minWidth:140,background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"clamp(9px,1.8vw,12px) clamp(10px,2vw,14px)",color:"#fff",fontSize:"clamp(10px,1.8vw,13px)",fontFamily:"'Press Start 2P',monospace"}}/>
            <select value={typeFilt} onChange={e=>{setTypeFilt(e.target.value);setPage(0);}}
              style={{background:"rgba(10,10,28,0.98)",border:"1.5px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"clamp(9px,1.8vw,12px)",color:"#888",fontSize:"clamp(9px,1.6vw,12px)",fontFamily:"'Press Start 2P',monospace"}}>
              <option value="all">All Types</option>
              {Object.keys(TC).map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={()=>setShowLeg(l=>!l)} className="btn"
              style={{background:showLeg?"rgba(255,213,79,0.15)":"transparent",border:`1.5px solid ${showLeg?"#FFD54F55":"rgba(255,255,255,0.1)"}`,borderRadius:10,padding:"clamp(9px,1.8vw,12px)",color:showLeg?"#FFD54F":"#444",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,1.6vw,12px)"}}>
              ⭐ LEGENDS
            </button>
          </div>

          <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
            <button onClick={()=>{setGenFilt("all");setPage(0);}} className="btn"
              style={{background:genFilt==="all"?"rgba(255,255,255,0.08)":"transparent",border:`1px solid ${genFilt==="all"?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.06)"}`,borderRadius:8,padding:"clamp(5px,1vw,7px) clamp(8px,1.5vw,11px)",color:genFilt==="all"?"#ccc":"#333",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(7px,1.3vw,9px)"}}>ALL</button>
            {Object.entries(GENS).map(([g,d])=>(
              <button key={g} onClick={()=>{setGenFilt(genFilt===g?"all":g);setPage(0);}} className="btn"
                style={{background:genFilt===g?`${d.col}22`:"transparent",border:`1px solid ${genFilt===g?d.col+"55":"rgba(255,255,255,0.06)"}`,borderRadius:8,padding:"clamp(5px,1vw,7px) clamp(7px,1.3vw,10px)",color:genFilt===g?d.col:"#2a2a3a",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(7px,1.3vw,9px)"}}>
                G{g}
              </button>
            ))}
          </div>

          {loading&&(
            <div style={{marginBottom:10,textAlign:"center"}}>
              <div style={{color:"#333",fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",animation:"pulse 1.5s infinite",marginBottom:6}}>Loading Pokédex {loadPct}%…</div>
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:4,height:4,overflow:"hidden",maxWidth:300,margin:"0 auto"}}>
                <div style={{width:`${loadPct}%`,background:"linear-gradient(90deg,#7C4DFF,#4FC3F7)",height:"100%",transition:"width 0.3s"}}/>
              </div>
            </div>
          )}

          <div style={{color:"#1a1a2e",fontSize:"clamp(8px,1.5vw,10px)",fontFamily:"'Press Start 2P',monospace",marginBottom:10}}>
            {filteredPokemon.length} Pokémon • page {page+1}/{Math.max(1,Math.ceil(filteredPokemon.length/PAGE))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(120px,16vw,160px),1fr))",gap:"clamp(8px,1.5vw,12px)",marginBottom:16}}>
            {pagedPokemon.map(p=>(
              <div key={p.id} className="pcard">
                <PokemonCard mon={p} onSelect={m=>startBattle(m)}
                  selected={false} unlocked={isUnlocked(p)}
                  coins={profile?.coins||0} onUnlock={unlockPokemon}
                  cost={p.legendary?UNLOCK_COST*3:p.canMega?UNLOCK_COST*2:UNLOCK_COST}
                  shopMode={true}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            {page>0&&<button onClick={()=>setPage(p=>p-1)} className="btn" style={{background:"rgba(255,255,255,0.03)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"clamp(9px,1.8vw,12px) clamp(14px,2.5vw,20px)",color:"#777",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,1.8vw,12px)"}}>← PREV</button>}
            {(page+1)*PAGE<filteredPokemon.length&&<button onClick={()=>setPage(p=>p+1)} className="btn" style={{background:"rgba(255,255,255,0.03)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"clamp(9px,1.8vw,12px) clamp(14px,2.5vw,20px)",color:"#777",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(9px,1.8vw,12px)"}}>NEXT →</button>}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TEAM MANAGEMENT
      ══════════════════════════════════════════════════ */}
      {screen===MODES.TEAM&&(
        <div style={{width:"100%",maxWidth:900}}>
          <div style={{color:"#FFD54F",fontSize:"clamp(11px,2.5vw,16px)",fontFamily:"'Press Start 2P',monospace",marginBottom:4,textAlign:"center"}}>YOUR TEAM ({team.length}/6)</div>
          {team.length>0&&(
            <div style={{background:"rgba(10,10,28,0.98)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"14px",marginBottom:16}}>
              <div style={{color:"#888",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:10}}>ACTIVE TEAM</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {team.map(m=>{
                  const isFainted=faintedTeam.some(f=>f.id===m.id);
                  const lvl=teamLevels[m.id]||50;
                  return(
                    <div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,opacity:isFainted?0.4:1}}>
                      <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`} style={{width:44,imageRendering:"pixelated"}}/>
                      <div style={{color:"#ccc",fontSize:"7px",fontFamily:"'Press Start 2P',monospace",textTransform:"capitalize",textAlign:"center"}}>{m.name}</div>
                      <div style={{color:"#FFD54F",fontSize:"7px",fontFamily:"'Press Start 2P',monospace"}}>Lv{lvl}</div>
                      {isFainted&&<div style={{color:"#f44336",fontSize:"6px",fontFamily:"'Press Start 2P',monospace"}}>💀FAINT</div>}
                      <button onClick={()=>toggleTeam(m)} style={{background:"rgba(244,67,54,0.1)",border:"1px solid rgba(244,67,54,0.3)",borderRadius:5,padding:"3px 7px",color:"#f44336",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"6px"}}>REMOVE</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:8}}>
            {allPokemon.filter(isUnlocked).map(p=>(
              <div key={p.id} className="pcard" onClick={()=>toggleTeam(p)}
                style={{background:team.some(t=>t.id===p.id)?"rgba(79,195,247,0.08)":"rgba(10,10,24,0.98)",border:`1px solid ${team.some(t=>t.id===p.id)?"#4FC3F7":"rgba(255,255,255,0.06)"}`,borderRadius:11,padding:"10px 8px",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} style={{width:48,imageRendering:"pixelated"}}/>
                <div style={{color:"#ccc",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",textTransform:"capitalize"}}>{p.name}</div>
                {team.some(t=>t.id===p.id)&&<div style={{fontSize:"14px",marginTop:2}}>✅</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          SHOP
      ══════════════════════════════════════════════════ */}
      {screen===MODES.SHOP&&(
        <div style={{width:"100%",maxWidth:680}}>
          <div style={{color:"#FFD54F",fontSize:"clamp(11px,2.5vw,16px)",fontFamily:"'Press Start 2P',monospace",marginBottom:4,textAlign:"center"}}>🛒 SHOP</div>
          <div style={{color:"#555",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:16,textAlign:"center"}}>Balance: <span style={{color:"#FFD54F"}}>{profile?.coins||0}🪙</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
            {SHOP_ITEMS.map(item=>{
              const owned=inventory[item.id]||0;
              const canBuy=(profile?.coins||0)>=item.cost;
              return(
                <div key={item.id} style={{background:"rgba(10,10,28,0.98)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:13,padding:"14px 12px",textAlign:"center"}}>
                  <div style={{fontSize:"24px",marginBottom:6}}>{item.emoji}</div>
                  <div style={{color:"#fff",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:4}}>{item.name}</div>
                  <div style={{color:"#333",fontSize:"7px",fontFamily:"'Press Start 2P',monospace",marginBottom:8}}>{item.desc}</div>
                  <div style={{color:"#4FC3F7",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",marginBottom:6}}>Owned: {owned}</div>
                  <button onClick={()=>buyItem(item)} disabled={!canBuy} className="btn"
                    style={{width:"100%",background:canBuy?"rgba(124,77,255,0.15)":"rgba(255,255,255,0.02)",border:`1px solid ${canBuy?"rgba(124,77,255,0.4)":"rgba(255,255,255,0.06)"}`,borderRadius:8,padding:"7px",color:canBuy?"#fff":"#333",cursor:canBuy?"pointer":"not-allowed",fontFamily:"'Press Start 2P',monospace",fontSize:"8px"}}>
                    {item.cost}🪙
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          HEAL CENTER
      ══════════════════════════════════════════════════ */}
      {screen===MODES.HEAL&&(
        <div style={{width:"100%",maxWidth:560,textAlign:"center"}}>
          <div style={{color:"#4FC3F7",fontSize:"13px",fontFamily:"'Press Start 2P',monospace",marginBottom:4}}>🏥 POKÉMON CENTER</div>
          <div style={{color:"#1a2a3a",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",marginBottom:18}}>— NURSE JOY WELCOMES YOU —</div>

          {/* Healing in progress */}
          {healQueue.length>0&&(
            <div style={{background:"rgba(4,4,14,0.97)",border:"1px solid rgba(79,195,247,0.3)",borderRadius:16,padding:28,marginBottom:16,animation:"slideIn 0.3s ease"}}>
              <div style={{fontSize:"36px",marginBottom:10,animation:"pulse 0.7s infinite"}}>⚕️</div>
              <div style={{color:"#4FC3F7",fontSize:"12px",fontFamily:"'Press Start 2P',monospace",marginBottom:14}}>HEALING…</div>
              <div style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center"}}>
                {healQueue.map(m=>(
                  <div key={m.id} style={{textAlign:"center"}}>
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`}
                      style={{width:44,imageRendering:"pixelated",filter:"drop-shadow(0 0 12px #4FC3F7) brightness(1.2)",animation:"pulse 0.9s infinite"}}/>
                    <div style={{color:"#4FC3F7",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",marginTop:4,textTransform:"capitalize"}}>{m.name}</div>
                    <div style={{color:"#2a6a8a",fontSize:"7px",fontFamily:"'Press Start 2P',monospace"}}>restoring…</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Healed success */}
          {healDone&&healQueue.length===0&&(
            <div style={{background:"rgba(76,175,80,0.08)",border:"1px solid rgba(76,175,80,0.3)",borderRadius:16,padding:28,marginBottom:16,animation:"slideIn 0.4s ease"}}>
              <div style={{fontSize:"36px",marginBottom:8}}>💚</div>
              <div style={{color:"#4CAF50",fontSize:"12px",fontFamily:"'Press Start 2P',monospace",marginBottom:4}}>HEALED!</div>
              <div style={{color:"#2a6a2a",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>Come back anytime!</div>
            </div>
          )}

          {/* Selection panel — shown when not healing */}
          {healQueue.length===0&&(
            <div style={{background:"rgba(4,4,14,0.98)",border:"1px solid rgba(79,195,247,0.15)",borderRadius:16,padding:"20px 18px",marginBottom:14}}>

              {/* Header row */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
                <div style={{color:"#888",fontSize:"10px",fontFamily:"'Press Start 2P',monospace"}}>SELECT POKÉMON TO HEAL</div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>setSelectedToHeal(new Set(faintedTeam.map(m=>m.id)))} className="btn"
                    style={{background:"rgba(79,195,247,0.1)",border:"1px solid rgba(79,195,247,0.3)",borderRadius:7,padding:"5px 9px",color:"#4FC3F7",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"7px"}}>
                    ALL
                  </button>
                  <button onClick={()=>setSelectedToHeal(new Set())} className="btn"
                    style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"5px 9px",color:"#555",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"7px"}}>
                    NONE
                  </button>
                </div>
              </div>

              {/* Pokémon list — fainted team members */}
              {faintedTeam.length===0 ? (
                <div style={{padding:"28px 0",textAlign:"center"}}>
                  <div style={{fontSize:"32px",marginBottom:10}}>💚</div>
                  <div style={{color:"#4CAF50",fontSize:"10px",fontFamily:"'Press Start 2P',monospace",marginBottom:4}}>All Pokémon are healthy!</div>
                  <div style={{color:"#1a3a1a",fontSize:"8px",fontFamily:"'Press Start 2P',monospace"}}>No healing needed right now.</div>
                </div>
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:9,marginBottom:16}}>
                  {faintedTeam.map(m=>{
                    const sel = selectedToHeal.has(m.id);
                    return(
                      <div key={m.id} onClick={()=>toggleHealSelect(m.id)}
                        style={{
                          background: sel ? "rgba(79,195,247,0.12)" : "rgba(255,255,255,0.02)",
                          border: sel ? "1.5px solid rgba(79,195,247,0.6)" : "1px solid rgba(255,255,255,0.07)",
                          borderRadius:12, padding:"12px 8px", cursor:"pointer",
                          textAlign:"center", transition:"all 0.15s",
                          boxShadow: sel ? "0 0 16px rgba(79,195,247,0.2)" : "none",
                          position:"relative"
                        }}>
                        {/* Checkbox */}
                        <div style={{
                          position:"absolute",top:6,right:6,
                          width:16,height:16,borderRadius:4,
                          background: sel ? "#4FC3F7" : "rgba(255,255,255,0.06)",
                          border: sel ? "1.5px solid #4FC3F7" : "1px solid rgba(255,255,255,0.15)",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:"10px", transition:"all 0.12s"
                        }}>{sel?"✓":""}</div>

                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`}
                          style={{width:48,imageRendering:"pixelated",
                            filter: m.fainted
                              ? "grayscale(0.9) brightness(0.55)"
                              : "grayscale(0.4) brightness(0.75)",
                            transition:"filter 0.2s"
                          }}/>
                        <div style={{color: sel?"#4FC3F7":"#ccc",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",textTransform:"capitalize",marginTop:5,marginBottom:3}}>{m.name}</div>
                        <div style={{
                          color: m.fainted ? "#f44336" : "#FFC107",
                          fontSize:"7px",fontFamily:"'Press Start 2P',monospace",
                          background: m.fainted ? "rgba(244,67,54,0.12)" : "rgba(255,193,7,0.1)",
                          borderRadius:4, padding:"2px 5px", display:"inline-block", marginBottom:2
                        }}>
                          {m.fainted ? "💀 FAINTED" : "❤️ INJURED"}
                        </div>
                        {/* Show remaining HP if not fully fainted */}
                        {!m.fainted&&m.hp>0&&(
                          <div style={{color:"#888",fontSize:"6px",fontFamily:"'Press Start 2P',monospace",marginTop:2}}>
                            HP: {m.hp} left
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Heal button */}
              {faintedTeam.length>0&&(
                <>
                  <div style={{color:"#1a3a4a",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",marginBottom:10}}>
                    {selectedToHeal.size>0
                      ? `${selectedToHeal.size} Pokémon selected`
                      : "Tap Pokémon to select, or HEAL ALL"}
                  </div>
                  <button onClick={()=>{
                    // Pass the target list directly — avoids stale closure on selectedToHeal
                    const selected=faintedTeam.filter(m=>selectedToHeal.has(m.id));
                    submitHeal(selected.length>0 ? selected : faintedTeam);
                  }} className="btn"
                    style={{width:"100%",background:"linear-gradient(135deg,rgba(79,195,247,0.2),rgba(124,77,255,0.14))",border:"1.5px solid rgba(79,195,247,0.5)",borderRadius:12,padding:"13px",color:"#fff",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"11px",transition:"all 0.15s"}}>
                    ⚕️ {selectedToHeal.size>0 ? `HEAL ${selectedToHeal.size} POKÉMON` : "HEAL ALL"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          BATTLE SCREEN
      ══════════════════════════════════════════════════ */}
      {screen===MODES.BATTLE&&pMon&&eMon&&(
        <div style={{width:"100%",maxWidth:740}}>
          <div style={{background:"linear-gradient(180deg,#070714,#0a0a1e)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:16,padding:"18px",marginBottom:12,position:"relative",overflow:"hidden",boxShadow:"0 0 50px rgba(124,77,255,0.07)"}}>
            {/* Weather + status row */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:6}}>
              {weather&&weather.id!=="clear"
                ? <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(0,0,0,0.4)",borderRadius:7,padding:"4px 8px"}}><span style={{fontSize:"14px"}}>{weather.icon}</span><span style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#FFD54F"}}>{weather.name}</span></div>
                : <div/>}
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#555"}}>YOU</span>
                <StatusBadge status={pStatus}/>
                <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#555",marginLeft:8}}>ENEMY</span>
                <StatusBadge status={eStatus}/>
              </div>
            </div>
            <div className="battle-arena" style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              <BattleStatCard mon={pMon} hp={pHP} maxHP={pMaxHP} level={pLevel} isMega={pMega} isGiga={pGiga} exp={expMap[pMon?.id]}/>
              <BattleStatCard mon={eMon} hp={eHP} maxHP={eMaxHP} level={50}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",padding:"0 20px",minHeight:140,position:"relative"}}>
              <WeatherCanvas weather={weather}/>
              <PokemonSprite id={pMon.id} isPlayer shake={shakeP} hit={hitP} faint={faintP} isMega={pMega} isGiga={pGiga} megaSlug={pMegaSlug}/>
              <PokemonSprite id={eMon.id} isPlayer={false} shake={shakeE} hit={hitE} faint={faintE}/>
              {anim&&<AttackAnimation key={anim.key} type={anim.type} fromPlayer={anim.fromPlayer} onDone={()=>setAnim(null)} isZMove={anim.isZMove} isMega={anim.isMega||pMega} isGiga={anim.isGiga||pGiga}/>}
              {showMegaAnim&&<MegaEvolutionAnim onDone={onMegaDone} isGiga={false}/>}
              {showGigaAnim&&<MegaEvolutionAnim onDone={onGigaDone} isGiga={true}/>}
            </div>
          </div>

          {/* Weather desc strip */}
          {weather&&weather.id!=="clear"&&<WeatherBanner weather={weather}/>}

          <div ref={logRef} style={{background:"rgba(3,3,10,0.97)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 14px",height:"clamp(70px,12vw,90px)",overflowY:"auto",marginBottom:12,fontSize:"clamp(10px,2vw,13px)",lineHeight:2.4,fontFamily:"'Press Start 2P',monospace"}}>
            {log.map((l,i)=><div key={i} style={{color:i===log.length-1?"#eee":i===log.length-2?"#555":"#1a1a2e",animation:i===log.length-1?"slideIn 0.25s ease":"none"}}>{l}</div>)}
          </div>

          {/* Special action buttons */}
          <div style={{display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}}>
            {canMega&&<button onClick={doMega} disabled={busy} className="btn" style={{flex:1,background:"rgba(124,77,255,0.15)",border:"1.5px solid rgba(124,77,255,0.5)",borderRadius:9,padding:"9px 10px",color:"#9C7DFF",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px",animation:"megaGlow 2s ease-in-out infinite"}}>💎 MEGA</button>}
            {canGiga&&<button onClick={doGiga} disabled={busy} className="btn" style={{flex:1,background:"rgba(255,213,79,0.12)",border:"1.5px solid rgba(255,213,79,0.4)",borderRadius:9,padding:"9px 10px",color:"#FFD54F",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px",animation:"gigaGlow 2s ease-in-out infinite"}}>⭕ G-MAX</button>}
            {pGiga&&pMon.gigaMove&&<button onClick={useGigaMove} disabled={busy} className="btn" style={{flex:1,background:"rgba(255,171,64,0.18)",border:"1.5px solid rgba(255,171,64,0.5)",borderRadius:9,padding:"9px 10px",color:"#FFAB40",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"9px",animation:"gigaGlow 1.5s ease-in-out infinite"}}>⭕ {pMon.gigaMove.name.split(" ").slice(0,2).join(" ")}</button>}
            {canUseZ&&<button onClick={useZMove} disabled={busy} className="btn" style={{flex:1,background:"rgba(255,107,53,0.12)",border:"1.5px solid rgba(255,107,53,0.4)",borderRadius:9,padding:"9px 10px",color:"#FF6B35",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px",animation:"zPulse 2s ease-in-out infinite"}}>💎 Z-MOVE</button>}
          </div>

          {showSwitch?(
            <div style={{background:"rgba(4,4,14,0.98)",border:"1px solid rgba(79,195,247,0.3)",borderRadius:12,padding:"14px"}}>
              <div style={{color:"#4FC3F7",fontSize:"10px",fontFamily:"'Press Start 2P',monospace",marginBottom:10}}>🔄 SWITCH POKÉMON</div>
              <div style={{color:"#444",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",marginBottom:10}}>Enemy gets a free attack!</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:7}}>
                {allPokemon.filter(p=>isUnlocked(p)&&p.id!==pMon?.id&&!faintedTeam.some(f=>f.id===p.id&&f.fainted)).map(p=>(
                  <button key={p.id} onClick={()=>switchPokemon(p)} disabled={busy} className="btn"
                    style={{background:"rgba(79,195,247,0.06)",border:"1px solid rgba(79,195,247,0.2)",borderRadius:10,padding:"8px 4px",cursor:"pointer",textAlign:"center",opacity:busy?0.4:1}}>
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} style={{width:40,imageRendering:"pixelated"}}/>
                    <div style={{color:"#ccc",fontSize:"6px",fontFamily:"'Press Start 2P',monospace",textTransform:"capitalize",marginTop:2,lineHeight:1.3}}>{p.name}</div>
                    <div style={{color:"#FFD54F",fontSize:"6px",fontFamily:"'Press Start 2P',monospace"}}>Lv{teamLevels[p.id]||50}</div>
                  </button>
                ))}
              </div>
              <button onClick={()=>setShowSwitch(false)} style={{width:"100%",marginTop:8,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"8px",color:"#444",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"9px"}}>← BACK</button>
            </div>
          ):showItems?(
            <div style={{background:"rgba(4,4,14,0.98)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"14px"}}>
              <div style={{color:"#888",fontSize:"10px",fontFamily:"'Press Start 2P',monospace",marginBottom:10}}>🎒 ITEMS & POKÉ BALLS</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:7}}>
                {SHOP_ITEMS.map(it=>{
                  const cnt=bagItems[it.id]||0;
                  if(cnt<=0) return null;
                  const isBall=it.isBall;
                  if(isBall && isMpBattle) return null;
                  return(
                    <button key={it.id} onClick={()=>isBall?usePokeball(it):useBattleItem(it)} disabled={busy||cnt<=0} className="btn"
                      style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"10px",cursor:"pointer",opacity:cnt>0?1:0.3,textAlign:"left"}}>
                      <div style={{fontSize:"16px",marginBottom:3}}>{it.emoji}</div>
                      <div style={{color:"#fff",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:2}}>{it.name}</div>
                      <div style={{color:"#444",fontSize:"7px",fontFamily:"'Press Start 2P',monospace"}}>{it.desc}</div>
                      <div style={{color:"#4FC3F7",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginTop:3}}>×{cnt}</div>
                    </button>
                  );
                })}
              </div>
              <button onClick={()=>setShowItems(false)} style={{width:"100%",marginTop:8,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"8px",color:"#444",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"9px"}}>← BACK</button>
            </div>
          ):(
            <div>
              <div className="move-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
                {pMon.moves.map(m=>{
                  const mc=TC[m.type]||"#888";
                  const actualPower = pGiga ? Math.round(m.power*1.5) : pMega ? Math.round(m.power*1.2) : m.power;
                  const isHovered = hoverMove===m.name;
                  return(
                    <button key={m.name} className="btn" onClick={()=>useMove(m)} disabled={busy}
                      onMouseEnter={()=>setHoverMove(m.name)} onMouseLeave={()=>setHoverMove(null)}
                      style={{background:`linear-gradient(135deg,${mc}22,${mc}0a)`,border:`1px solid ${isHovered?mc+"88":mc+"44"}`,borderRadius:11,padding:"13px 14px",cursor:busy?"not-allowed":"pointer",transition:"all 0.14s",textAlign:"left",opacity:busy?0.45:1,position:"relative"}}>
                      {isHovered&&eMon&&<MatchupPreview move={m} enemyTypes={eMon.types}/>}
                      <div style={{color:"#fff",fontSize:"clamp(11px,2vw,15px)",marginBottom:8,fontFamily:"'Press Start 2P',monospace",lineHeight:1.5}}>{m.name}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <Badge type={m.type} small/><span style={{color:"#333",fontSize:"9px",fontFamily:"'Press Start 2P',monospace"}}>PWR {actualPower}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setShowItems(true);setShowSwitch(false);}} disabled={busy} className="btn"
                  style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px",color:"#777",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px"}}>
                  🎒 ITEMS
                </button>
                {!isMpBattle&&allPokemon.filter(p=>isUnlocked(p)&&p.id!==pMon?.id&&!faintedTeam.some(f=>f.id===p.id&&f.fainted)).length>0&&(
                  <button onClick={()=>{setShowSwitch(true);setShowItems(false);}} disabled={busy} className="btn"
                    style={{flex:1,background:"rgba(79,195,247,0.06)",border:"1px solid rgba(79,195,247,0.25)",borderRadius:10,padding:"10px",color:"#4FC3F7",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px"}}>
                    🔄 SWITCH
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          WAIT FOR MULTIPLAYER OPPONENT
      ══════════════════════════════════════════════════ */}
      {screen===MODES.WAIT&&(
        <div style={{width:"100%",maxWidth:460,textAlign:"center"}}>
          <div style={{color:"#666",fontSize:"11px",fontFamily:"'Press Start 2P',monospace",marginBottom:18,animation:"pulse 1.5s infinite"}}>⏳ WAITING FOR OPPONENT…</div>
          <div style={{background:"rgba(10,10,28,0.98)",border:"1px solid rgba(124,77,255,0.2)",borderRadius:14,padding:24,marginBottom:14}}>
            <div style={{color:"#333",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:8}}>YOUR ROOM CODE</div>
            <div style={{color:"#7C4DFF",fontSize:"28px",letterSpacing:10,fontFamily:"'Press Start 2P',monospace",marginBottom:8}}>{roomId}</div>
            <div style={{color:"#1a1a2a",fontSize:"8px",fontFamily:"'Press Start 2P',monospace",marginBottom:16}}>Share this code with your opponent</div>
            <button onClick={copyInvite} className="btn" style={{width:"100%",background:copySuccess?"rgba(76,175,80,0.2)":"rgba(124,77,255,0.15)",border:`1px solid ${copySuccess?"rgba(76,175,80,0.5)":"rgba(124,77,255,0.35)"}`,borderRadius:10,padding:"11px",color:copySuccess?"#4CAF50":"#9C7DFF",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px",transition:"all 0.2s"}}>
              {copySuccess?"✅ COPIED!":"📋 COPY INVITE LINK"}
            </button>
          </div>
          <div ref={logRef} style={{background:"rgba(3,3,10,0.97)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 14px",height:80,overflowY:"auto",fontSize:"9px",lineHeight:2,fontFamily:"'Press Start 2P',monospace"}}>
            {mpLog.map((l,i)=><div key={i} style={{color:"#555"}}>{l}</div>)}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MULTIPLAYER BATTLE
      ══════════════════════════════════════════════════ */}
      {screen===MODES.MP&&pMon&&oppMon&&(
        <div style={{width:"100%",maxWidth:740}}>
          <div style={{background:"rgba(7,7,20,0.98)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:16,padding:"18px",marginBottom:12,position:"relative"}}>
            <div className="battle-arena" style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              <BattleStatCard mon={pMon} hp={pHP} maxHP={pMon.hp*2} level={pLevel}/>
              <BattleStatCard mon={oppMon} hp={oppHP} maxHP={oppMon.hp*2} level={50}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",padding:"0 20px",minHeight:140,position:"relative"}}>
              <PokemonSprite id={pMon.id} isPlayer shake={shakeP} hit={hitP} faint={false}/>
              <PokemonSprite id={oppMon.id} isPlayer={false} shake={shakeE} hit={hitE} faint={false}/>
              {anim&&<AttackAnimation key={anim.key} type={anim.type} fromPlayer={anim.fromPlayer} onDone={()=>setAnim(null)}/>}
            </div>
          </div>
          <div style={{textAlign:"center",marginBottom:10,fontSize:"12px",fontFamily:"'Press Start 2P',monospace",color:myTurn?"#FFD54F":"#222",animation:myTurn?"pulse 1s infinite":"none"}}>
            {myTurn?"⚡ YOUR TURN":"⏳ Waiting for opponent…"}
          </div>
          <div ref={logRef} style={{background:"rgba(3,3,10,0.97)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 14px",height:70,overflowY:"auto",marginBottom:12,fontSize:"9px",lineHeight:2,fontFamily:"'Press Start 2P',monospace"}}>
            {mpLog.map((l,i)=><div key={i} style={{color:i===mpLog.length-1?"#eee":"#333"}}>{l}</div>)}
          </div>
          {/* NO pokeball in multiplayer */}
          <div className="move-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            {pMon.moves.map(m=>{ const mc=TC[m.type]||"#888"; return(
              <button key={m.name} className="btn" onClick={()=>sendMove(m)} disabled={!myTurn}
                style={{background:`linear-gradient(135deg,${mc}22,${mc}0a)`,border:`1px solid ${mc}44`,borderRadius:11,padding:"13px 14px",cursor:!myTurn?"not-allowed":"pointer",opacity:!myTurn?0.35:1,textAlign:"left"}}>
                <div style={{color:"#fff",fontSize:"11px",marginBottom:5,fontFamily:"'Press Start 2P',monospace"}}>{m.name}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Badge type={m.type} small/><span style={{color:"#333",fontSize:"9px"}}>PWR {m.power}</span></div>
              </button>
            ); })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          GAME OVER
      ══════════════════════════════════════════════════ */}
      {screen===MODES.OVER&&(
        <div style={{textAlign:"center",animation:"slideIn 0.5s ease",maxWidth:500,width:"100%",padding:"0 8px"}}>
          {winner==="player"?(
            <>
              <div style={{fontSize:"clamp(18px,4vw,28px)",color:"#FFD54F",marginBottom:6,animation:"glow 1.5s ease-in-out infinite",fontFamily:"'Press Start 2P',monospace",letterSpacing:2}}>🏆 VICTORY!</div>
              <div style={{fontSize:"12px",color:"#555",fontFamily:"'Press Start 2P',monospace",marginBottom:4}}>★ ★ ★ ★ ★</div>
            </>
          ):(
            <div style={{fontSize:"20px",color:"#f44336",marginBottom:6,fontFamily:"'Press Start 2P',monospace",letterSpacing:2}}>💀 DEFEATED!</div>
          )}
          <div style={{color:"#333",fontSize:"10px",fontFamily:"'Press Start 2P',monospace",marginBottom:6}}>
            {winner==="player"?`${pMon?.name.toUpperCase()} stood victorious!`:`${(eMon||oppMon)?.name.toUpperCase()} won this time…`}
          </div>
          {winner==="enemy"&&<div style={{color:"#f44336",fontSize:"9px",fontFamily:"'Press Start 2P',monospace",marginBottom:8}}>Visit Pokémon Center to heal! 🏥</div>}
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:12}}>
            <button onClick={()=>setScreen(MODES.SELECT)} className="btn" style={{background:"rgba(124,77,255,0.1)",border:"1px solid rgba(124,77,255,0.25)",borderRadius:10,padding:"11px 16px",color:"#fff",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px"}}>← CHOOSE</button>
            {pMon&&winner==="player"&&<button onClick={()=>startBattle(pMon)} disabled={faintedTeam.some(f=>f.id===pMon?.id)} className="btn" style={{background:"rgba(255,107,53,0.1)",border:"1px solid rgba(255,107,53,0.25)",borderRadius:10,padding:"11px 16px",color:"#fff",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px"}}>⚡ REMATCH</button>}
            <button onClick={()=>setShowBoard(true)} className="btn" style={{background:"rgba(255,213,79,0.07)",border:"1px solid rgba(255,213,79,0.2)",borderRadius:10,padding:"11px 16px",color:"#FFD54F",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px"}}>🏆 HALL</button>
            <button onClick={()=>setScreen(MODES.HOME)} className="btn" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"11px 16px",color:"#888",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"10px"}}>🏠 HOME</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MULTIPLAYER — COMING SOON FULL PAGE
      ══════════════════════════════════════════════════ */}
      {screen===MODES.MP_SOON&&(
        <MultiplayerComingSoonPage onBack={()=>setScreen(MODES.HOME)}/>
      )}

      {/* ══════════════════════════════════════════════════
          STORY MODE
      ══════════════════════════════════════════════════ */}
      {screen===MODES.STORY&&(
        <StoryScreen
          profile={profile}
          storyProgress={storyProgress}
          allPokemon={allPokemon}
          onStartGym={gym=>{
            if(!pMon){ alert("Go to TEAM and pick a Pokémon first!"); return; }
            startStoryBattle(gym,allPokemon);
          }}
          onBack={()=>setScreen(MODES.HOME)}
        />
      )}

      {/* ══════════════════════════════════════════════════
          BATTLE HISTORY
      ══════════════════════════════════════════════════ */}
      {screen===MODES.HISTORY&&(
        <HistoryScreen history={battleHistory} onBack={()=>setScreen(MODES.HOME)}/>
      )}

      {/* ══════════════════════════════════════════════════
          PROFILE
      ══════════════════════════════════════════════════ */}
      {screen===MODES.PROFILE&&(
        <ProfileScreen
          profile={profile}
          onBack={()=>setScreen(MODES.HOME)}
          onSave={updated=>{
            setProfile(updated);
            updateProfile(updated);
            setScreen(MODES.HOME);
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════
          TRADE CENTER (modal overlay)
      ══════════════════════════════════════════════════ */}
      {showTrade&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:16}} onClick={()=>setShowTrade(false)}>
          <div style={{background:"#07070f",border:"1px solid rgba(102,187,106,0.3)",borderRadius:18,padding:"24px 20px",maxWidth:740,width:"100%",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <TradeScreen
              allPokemon={allPokemon}
              unlockedIds={unlockedIds}
              starterPokemon={starterPokemon}
              profile={profile}
              onTrade={handleTrade}
            />
            <button onClick={()=>setShowTrade(false)} style={{width:"100%",marginTop:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"10px",color:"#555",cursor:"pointer",fontFamily:"'Press Start 2P',monospace",fontSize:"9px"}}>✕ CLOSE</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          EVOLUTION ANIMATION
      ══════════════════════════════════════════════════ */}
      {pendingEvo&&showEvoAnim&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500}}>
          <div style={{position:"relative",width:320,height:220,textAlign:"center"}}>
            <EvolutionAnim oldMon={pendingEvo.oldMon} newId={pendingEvo.newId} onDone={()=>{
              setShowEvoAnim(false);
              // Swap pokemon in allPokemon lookup
              const newMon=allPokemon.find(p=>p.id===pendingEvo.newId);
              if(newMon){
                // Unlock the evolved form
                const nu=new Set([...unlockedIds,pendingEvo.newId]);
                setUnlockedIds(nu);
                localStorage.setItem(`pkmn_unlocked_${profile?.name}`,JSON.stringify([...nu]));
                pushLog(`🎉 ${pendingEvo.oldMon.name.toUpperCase()} evolved into ${newMon.name.toUpperCase()}!`);
              }
              setPendingEvo(null);
            }}/>
            <div style={{position:"absolute",bottom:10,left:0,right:0}}>
              <div style={{color:"#FFD54F",fontSize:"11px",fontFamily:"'Press Start 2P',monospace",animation:"pulse 0.8s infinite"}}>
                {pendingEvo.oldMon.name.toUpperCase()} → ?
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


export default App;

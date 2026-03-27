# Bonding Games

Offline-first social party games to bond with friends in real life.

## Inspiration

While I was locked up in a military camp 5 days a week against my will as part of National Service, social games became one of the few ways my bunkmates and I could destress and stay sane during our free time. When searching for apps that offered such games, most options were bloated with ads, locked behind paywalls, or had too little flexibility for customization to meet our gameplay needs. Therefore, I made something simple, fast, and actually useful for real-world hangouts.

## Live App

https://javen05.github.io/bonding_games/

## Features

- 13 playable party games:
  - Truth or Dare
  - Never Have I Ever
  - Would You Rather
  - Hot Seat
  - Word Imposter
  - Infinite Tic Tac Toe
  - Werewolf
  - Pass The Heat
  - Callout Clash
  - Chain Reaction
  - Poison Candy
  - Guess The Number
  - Stop The Timer
- Home page game discovery improvements:
  - Search by title, description, and tags
  - Category filters (Social, Callout, Deduction, Competitive, Chaos)
  - Favorites-only toggle with localStorage persistence
  - Color-coded icon strategy with in-app info popup
  - Persistent floating search bar on scroll (mobile-friendly)
- Rich per-game customization with localStorage support:
  - Add/remove custom prompts, questions, rules, and penalties in supported games
  - Content source modes where available: ALL data, BUILT-IN only, CUSTOM only
  - Drinking mode selectors in newer social/drinking games
- Mobile UX improvements:
  - Footer action to install/add app to home screen (with browser guidance fallback)
  - Input zoom prevention on mobile when focusing text fields
- Socials page with links to GitHub, LinkedIn, email, and Buy Me a Coffee

## New Game Highlights

- Infinite Tic Tac Toe:
  - Strict 2-player mode
  - Configurable tile removal mode (remove on 4th or 5th placement)
  - Optional marker visibility for the next tile to be removed

- Werewolf:
  - Narrator Mode and pass-the-phone Gameplay Mode
  - Private role reveal flow
  - Night actions, recap phase, discussion timer, and voting phases
  - Optional skip-wait action during discussion
  - Configurable role counts with balancing caps
  - Roles include Werewolf, Doctor, Seer, Tanner, and Villager
  - End-game reveal option for werewolf identities/status

- Pass The Heat:
  - Rapid pass-and-play prompts with timer pressure
  - Penalty mode selector and customizable penalty pool

- Callout Clash:
  - Group callout prompts with configurable outcomes
  - Unified custom outcomes and custom prompt support

- Chain Reaction:
  - Escalating rules/challenges format for chaotic rounds
  - Custom social/drinking questions, rules, and penalties

- Word Imposter:
  - Optional Jester role with unique win condition
  - Expanded role reveal and elimination flow

- Poison Candy:
  - Configurable board size and poison count per player
  - Poison placement modes: Random (game-generated) or Player (manual private selection)
  - Turn-order modes: Fixed, Random, Alternate
  - End-of-round reveal tools: kill log and board reveal popup

- Guess The Number:
  - 2-player head-to-head duel mode
  - Configurable number range
  - First-turn modes: Random, Alternate, Democratic (Rock/Paper/Scissors)

- Stop The Timer:
  - 2+ player timing challenge with random target time
  - Results include winner accuracy percentage

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Run tests:

```bash
npm run test
```

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui components

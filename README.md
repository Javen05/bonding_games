# Bonding Games

Offline-first social party games to bond with friends in real life.

## Inspiration

While I was locked up in a military camp 5 days a week against my will as part of National Service, social games became one of the few ways my bunkmates and I could destress and stay sane during our free time. When searching for apps that offered such games, most options were bloated with ads, locked behind paywalls, or had too little flexibility for customization to meet our gameplay needs. Therefore, I made something simple, fast, and actually useful for real-world hangouts.

## Live App

https://javen05.github.io/bonding_games/

## Features

- 7 playable party games:
	- Truth or Dare
	- Never Have I Ever
	- Would You Rather
	- Hot Seat
	- Word Imposter
	- Infinite Tic Tac Toe
	- Werewolf
- Searchable game selection grid on the main page
- Favorite games UI with localStorage persistence
- Custom question support saved in localStorage
- Timer and voting options across game flows
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

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui components

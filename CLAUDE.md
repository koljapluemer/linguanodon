# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Linguanodon is a language learning application built with Vue 3, TypeScript, and Vite. The app is currently being rebuilt around a queue-based MVP architecture where users consume exercises and tasks in an infinite queue system.

## Common Development Commands

```bash
# Development
npm run dev                # Start development server
npm run build              # Build for production (includes type checking)
npm run preview            # Preview production build

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint errors automatically
npm run test               # Run tests with Vitest
```

## Architecture

The project follows **Feature-Sliced Design (FSD)** architecture with strict layer dependencies. Layers can only import from layers below them:

### Layer Structure (top to bottom)
- **app/**: Global app configuration, router, dependency injection
- **pages/**: High-level entry points, main page components
- **widgets/**: Large self-sufficient UI blocks, reusable across pages
- **features/**: Main user interactions and business logic
- **entities/**: Real-world business concepts (Vocab, ImmersionContent)
- **shared/**: Foundation utilities, UI components, external connections

### Key Architectural Concepts

**Queue-Based Learning System**: The core MVP revolves around `src/pages/queue/PageQueue.vue` which provides an infinite queue of:
- **Exercises**: Practice sessions for vocabulary units
- **Tasks**: Specific actions like adding pronunciation or consuming immersion content

**Caching Strategy**: Uses `src/pages/queue/useCachedQueue.ts` to maintain:
- Current/next vocab batches for exercises (5-20 units)
- Current/next task in queue
- Seamless user experience with preloading

**Entity Repositories**: Uses contract-based repositories with Dexie (IndexedDB) for persistence:
- `VocabAndTranslationRepo`: Core vocabulary management
- Immersion content management
- All repos injected via `src/app/injectRepositories.ts`

## Key Development Patterns

**Import Syntax**: Always use `@/...` imports except for same-directory files
**Component Structure**: Components are either controller (logic) or representational (props/emits only)
**Type Organization**: Types live in dedicated files, never duplicated in components
**Testing**: Unit tests live alongside code, use Vitest with jsdom environment

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Styling**: Tailwind CSS + DaisyUI (mobile + desktop responsive, dark/light mode)
- **Database**: Dexie (IndexedDB wrapper)
- **Icons**: Lucide Vue Next
- **Testing**: Vitest + Vue Test Utils
- **State**: Pinia with persistence
- **Learning Algorithm**: ts-fsrs for spaced repetition

## Code Organization Notes

**Legacy Code**: Legacy implementation exists in `/legacy/` folder for reference only. New code goes in `/src/` following FSD principles.

**Exercise Generation**: Vocabulary exercises generated based on mastery level:
- Level -1: "Try to remember" style
- Higher levels: Reveal exercises from content to translations

**Task System**: Tasks are registered in `TaskRegistry.ts` and rendered via `MetaTaskRenderer`. Current tasks include pronunciation addition and immersion content consumption.
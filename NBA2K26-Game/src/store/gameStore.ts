import { create } from 'zustand'

interface Player {
  id: string
  name: string
  position: string
  height: number
  weight: number
  overall: number
  attributes: {
    shooting: number
    passing: number
    dribbling: number
    defense: number
    athleticism: number
  }
}

interface Team {
  id: string
  name: string
  abbreviation: string
  conference: string
  players: Player[]
}

interface CareerProgress {
  chapter: number
  currentTeam: string
  stats: {
    points: number
    rebounds: number
    assists: number
    gamesPlayed: number
  }
}

interface MyTeamCard {
  id: string
  player: Player
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  version: string
}

interface GameState {
  currentUser: string | null
  mode: string
  player: Player | null
  careerProgress: CareerProgress
  myTeamCards: MyTeamCard[]
  selectedTeam: Team | null
  settings: {
    difficulty: string
    quarterLength: number
    shotTiming: 'real' | 'release'
  }
  setUser: (user: string) => void
  setMode: (mode: string) => void
  createPlayer: (player: Player) => void
  updateCareerProgress: (progress: Partial<CareerProgress>) => void
  addCard: (card: MyTeamCard) => void
  selectTeam: (team: Team) => void
  updateSettings: (settings: Partial<GameState['settings']>) => void
}

const mockPlayer: Player = {
  id: '1',
  name: 'Player 1',
  position: 'SG',
  height: 198,
  weight: 95,
  overall: 60,
  attributes: {
    shooting: 55,
    passing: 50,
    dribbling: 55,
    defense: 50,
    athleticism: 60,
  },
}

const mockCareerProgress: CareerProgress = {
  chapter: 1,
  currentTeam: '',
  stats: {
    points: 0,
    rebounds: 0,
    assists: 0,
    gamesPlayed: 0,
  },
}

export const useGameStore = create<GameState>((set) => ({
  currentUser: null,
  mode: 'menu',
  player: mockPlayer,
  careerProgress: mockCareerProgress,
  myTeamCards: [],
  selectedTeam: null,
  settings: {
    difficulty: 'pro',
    quarterLength: 12,
    shotTiming: 'real',
  },
  setUser: (user) => set({ currentUser: user }),
  setMode: (mode) => set({ mode }),
  createPlayer: (player) => set({ player }),
  updateCareerProgress: (progress) =>
    set((state) => ({ careerProgress: { ...state.careerProgress, ...progress } })),
  addCard: (card) =>
    set((state) => ({ myTeamCards: [...state.myTeamCards, card] })),
  selectTeam: (team) => set({ selectedTeam: team }),
  updateSettings: (settings) =>
    set((state) => ({ settings: { ...state.settings, ...settings } })),
}))
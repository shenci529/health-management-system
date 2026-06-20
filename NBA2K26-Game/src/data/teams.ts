export interface Team {
  id: string
  name: string
  city: string
  abbreviation: string
  conference: 'East' | 'West'
  division: string
  colors: {
    primary: string
    secondary: string
    tertiary: string
  }
}

export const nbaTeams: Team[] = [
  { id: 'ATL', name: 'Atlanta Hawks', city: 'Atlanta', abbreviation: 'ATL', conference: 'East', division: 'Southeast', colors: { primary: '#E03A3E', secondary: '#C4D600', tertiary: '#26282A' } },
  { id: 'BOS', name: 'Boston Celtics', city: 'Boston', abbreviation: 'BOS', conference: 'East', division: 'Atlantic', colors: { primary: '#007A33', secondary: '#BA9653', tertiary: '#000000' } },
  { id: 'BKN', name: 'Brooklyn Nets', city: 'Brooklyn', abbreviation: 'BKN', conference: 'East', division: 'Atlantic', colors: { primary: '#000000', secondary: '#FFFFFF', tertiary: '#7C7C7C' } },
  { id: 'CHA', name: 'Charlotte Hornets', city: 'Charlotte', abbreviation: 'CHA', conference: 'East', division: 'Southeast', colors: { primary: '#00788C', secondary: '#1D1160', tertiary: '#888B8D' } },
  { id: 'CHI', name: 'Chicago Bulls', city: 'Chicago', abbreviation: 'CHI', conference: 'East', division: 'Central', colors: { primary: '#CE1141', secondary: '#000000', tertiary: '#888B8D' } },
  { id: 'CLE', name: 'Cleveland Cavaliers', city: 'Cleveland', abbreviation: 'CLE', conference: 'East', division: 'Central', colors: { primary: '#860038', secondary: '#FDBB30', tertiary: '#041E42' } },
  { id: 'DAL', name: 'Dallas Mavericks', city: 'Dallas', abbreviation: 'DAL', conference: 'West', division: 'Southwest', colors: { primary: '#00538C', secondary: '#B8C4CA', tertiary: '#002B5E' } },
  { id: 'DEN', name: 'Denver Nuggets', city: 'Denver', abbreviation: 'DEN', conference: 'West', division: 'Northwest', colors: { primary: '#0E2240', secondary: '#FEC524', tertiary: '#8B2131' } },
  { id: 'DET', name: 'Detroit Pistons', city: 'Detroit', abbreviation: 'DET', conference: 'East', division: 'Central', colors: { primary: '#C8102E', secondary: '#1D428A', tertiary: '#BEC0C6' } },
  { id: 'GSW', name: 'Golden State Warriors', city: 'Golden State', abbreviation: 'GSW', conference: 'West', division: 'Pacific', colors: { primary: '#1D428A', secondary: '#FFC72C', tertiary: '#FFFFFF' } },
  { id: 'HOU', name: 'Houston Rockets', city: 'Houston', abbreviation: 'HOU', conference: 'West', division: 'Southwest', colors: { primary: '#CE1141', secondary: '#000000', tertiary: '#C4CED4' } },
  { id: 'IND', name: 'Indiana Pacers', city: 'Indiana', abbreviation: 'IND', conference: 'East', division: 'Central', colors: { primary: '#002D62', secondary: '#FDBB30', tertiary: '#BEC0C6' } },
  { id: 'LAC', name: 'LA Clippers', city: 'Los Angeles', abbreviation: 'LAC', conference: 'West', division: 'Pacific', colors: { primary: '#C8102E', secondary: '#1D428A', tertiary: '#BEC0C6' } },
  { id: 'LAL', name: 'Los Angeles Lakers', city: 'Los Angeles', abbreviation: 'LAL', conference: 'West', division: 'Pacific', colors: { primary: '#552583', secondary: '#FDB927', tertiary: '#000000' } },
  { id: 'MEM', name: 'Memphis Grizzlies', city: 'Memphis', abbreviation: 'MEM', conference: 'West', division: 'Southwest', colors: { primary: '#5D76A9', secondary: '#12173F', tertiary: '#F5B112' } },
  { id: 'MIA', name: 'Miami Heat', city: 'Miami', abbreviation: 'MIA', conference: 'East', division: 'Southeast', colors: { primary: '#98002E', secondary: '#F9A01B', tertiary: '#000000' } },
  { id: 'MIL', name: 'Milwaukee Bucks', city: 'Milwaukee', abbreviation: 'MIL', conference: 'East', division: 'Central', colors: { primary: '#00471B', secondary: '#EEE1C6', tertiary: '#0077C0' } },
  { id: 'MIN', name: 'Minnesota Timberwolves', city: 'Minnesota', abbreviation: 'MIN', conference: 'West', division: 'Northwest', colors: { primary: '#0C2340', secondary: '#236192', tertiary: '#9EA2A2' } },
  { id: 'NOP', name: 'New Orleans Pelicans', city: 'New Orleans', abbreviation: 'NOP', conference: 'West', division: 'Southwest', colors: { primary: '#0C2340', secondary: '#C8102E', tertiary: '#85714D' } },
  { id: 'NYK', name: 'New York Knicks', city: 'New York', abbreviation: 'NYK', conference: 'East', division: 'Atlantic', colors: { primary: '#006BB6', secondary: '#F58426', tertiary: '#BEC0C6' } },
  { id: 'OKC', name: 'Oklahoma City Thunder', city: 'Oklahoma City', abbreviation: 'OKC', conference: 'West', division: 'Northwest', colors: { primary: '#007AC1', secondary: '#EF3B24', tertiary: '#002D62' } },
  { id: 'ORL', name: 'Orlando Magic', city: 'Orlando', abbreviation: 'ORL', conference: 'East', division: 'Southeast', colors: { primary: '#0077C0', secondary: '#C4CED4', tertiary: '#000000' } },
  { id: 'PHI', name: 'Philadelphia 76ers', city: 'Philadelphia', abbreviation: 'PHI', conference: 'East', division: 'Atlantic', colors: { primary: '#006BB6', secondary: '#ED174C', tertiary: '#002B5C' } },
  { id: 'PHX', name: 'Phoenix Suns', city: 'Phoenix', abbreviation: 'PHX', conference: 'West', division: 'Pacific', colors: { primary: '#1D1160', secondary: '#E56020', tertiary: '#F9AD1B' } },
  { id: 'POR', name: 'Portland Trail Blazers', city: 'Portland', abbreviation: 'POR', conference: 'West', division: 'Northwest', colors: { primary: '#E03A3E', secondary: '#000000', tertiary: '#C4CED4' } },
  { id: 'SAC', name: 'Sacramento Kings', city: 'Sacramento', abbreviation: 'SAC', conference: 'West', division: 'Pacific', colors: { primary: '#5A2D81', secondary: '#63727A', tertiary: '#000000' } },
  { id: 'SAS', name: 'San Antonio Spurs', city: 'San Antonio', abbreviation: 'SAS', conference: 'West', division: 'Southwest', colors: { primary: '#000000', secondary: '#C4CED4', tertiary: '#000000' } },
  { id: 'TOR', name: 'Toronto Raptors', city: 'Toronto', abbreviation: 'TOR', conference: 'East', division: 'Atlantic', colors: { primary: '#CE1141', secondary: '#000000', tertiary: '#A1A1A4' } },
  { id: 'UTA', name: 'Utah Jazz', city: 'Utah', abbreviation: 'UTA', conference: 'West', division: 'Northwest', colors: { primary: '#002B5C', secondary: '#F9A01B', tertiary: '#7C7C7C' } },
  { id: 'WAS', name: 'Washington Wizards', city: 'Washington', abbreviation: 'WAS', conference: 'East', division: 'Southeast', colors: { primary: '#002B5C', secondary: '#E31837', tertiary: '#C4CED4' } },
]

export const getTeamById = (id: string): Team | undefined => {
  return nbaTeams.find(team => team.id === id)
}

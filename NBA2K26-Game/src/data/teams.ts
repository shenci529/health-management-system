export interface Team {
  id: string
  name: string
  abbreviation: string
  conference: 'East' | 'West'
  division: string
  colors: {
    primary: string
    secondary: string
  }
}

export const nbaTeams: Team[] = [
  { id: 'ATL', name: 'Atlanta Hawks', abbreviation: 'ATL', conference: 'East', division: 'Southeast', colors: { primary: '#E03A3E', secondary: '#1D1160' } },
  { id: 'BOS', name: 'Boston Celtics', abbreviation: 'BOS', conference: 'East', division: 'Atlantic', colors: { primary: '#007A33', secondary: '#BA0C2F' } },
  { id: 'BKN', name: 'Brooklyn Nets', abbreviation: 'BKN', conference: 'East', division: 'Atlantic', colors: { primary: '#000000', secondary: '#FFFFFF' } },
  { id: 'CHA', name: 'Charlotte Hornets', abbreviation: 'CHA', conference: 'East', division: 'Southeast', colors: { primary: '#1D1160', secondary: '#00788C' } },
  { id: 'CHI', name: 'Chicago Bulls', abbreviation: 'CHI', conference: 'East', division: 'Central', colors: { primary: '#CE1141', secondary: '#000000' } },
  { id: 'CLE', name: 'Cleveland Cavaliers', abbreviation: 'CLE', conference: 'East', division: 'Central', colors: { primary: '#860038', secondary: '#FFB81C' } },
  { id: 'DAL', name: 'Dallas Mavericks', abbreviation: 'DAL', conference: 'West', division: 'Southwest', colors: { primary: '#00538C', secondary: '#B8C4CA' } },
  { id: 'DEN', name: 'Denver Nuggets', abbreviation: 'DEN', conference: 'West', division: 'Northwest', colors: { primary: '#0E2240', secondary: '#FEC524' } },
  { id: 'DET', name: 'Detroit Pistons', abbreviation: 'DET', conference: 'East', division: 'Central', colors: { primary: '#006BB6', secondary: '#C8102E' } },
  { id: 'GSW', name: 'Golden State Warriors', abbreviation: 'GSW', conference: 'West', division: 'Pacific', colors: { primary: '#1D428A', secondary: '#FFC72C' } },
  { id: 'HOU', name: 'Houston Rockets', abbreviation: 'HOU', conference: 'West', division: 'Southwest', colors: { primary: '#CE1141', secondary: '#000000' } },
  { id: 'IND', name: 'Indiana Pacers', abbreviation: 'IND', conference: 'East', division: 'Central', colors: { primary: '#002D62', secondary: '#FFB81C' } },
  { id: 'LAC', name: 'LA Clippers', abbreviation: 'LAC', conference: 'West', division: 'Pacific', colors: { primary: '#C8102E', secondary: '#000000' } },
  { id: 'LAL', name: 'Los Angeles Lakers', abbreviation: 'LAL', conference: 'West', division: 'Pacific', colors: { primary: '#552583', secondary: '#FDB927' } },
  { id: 'MEM', name: 'Memphis Grizzlies', abbreviation: 'MEM', conference: 'West', division: 'Southwest', colors: { primary: '#5D76A9', secondary: '#12173F' } },
  { id: 'MIA', name: 'Miami Heat', abbreviation: 'MIA', conference: 'East', division: 'Southeast', colors: { primary: '#98002E', secondary: '#000000' } },
  { id: 'MIL', name: 'Milwaukee Bucks', abbreviation: 'MIL', conference: 'East', division: 'Central', colors: { primary: '#00471B', secondary: '#EEE1C6' } },
  { id: 'MIN', name: 'Minnesota Timberwolves', abbreviation: 'MIN', conference: 'West', division: 'Northwest', colors: { primary: '#005083', secondary: '#236192' } },
  { id: 'NOP', name: 'New Orleans Pelicans', abbreviation: 'NOP', conference: 'West', division: 'Southwest', colors: { primary: '#0C2340', secondary: '#C8102E' } },
  { id: 'NYK', name: 'New York Knicks', abbreviation: 'NYK', conference: 'East', division: 'Atlantic', colors: { primary: '#006BB6', secondary: '#F58426' } },
  { id: 'OKC', name: 'Oklahoma City Thunder', abbreviation: 'OKC', conference: 'West', division: 'Northwest', colors: { primary: '#007AC1', secondary: '#EF3B24' } },
  { id: 'ORL', name: 'Orlando Magic', abbreviation: 'ORL', conference: 'East', division: 'Southeast', colors: { primary: '#0077C0', secondary: '#C41E3A' } },
  { id: 'PHI', name: 'Philadelphia 76ers', abbreviation: 'PHI', conference: 'East', division: 'Atlantic', colors: { primary: '#006BB6', secondary: '#ED174C' } },
  { id: 'PHX', name: 'Phoenix Suns', abbreviation: 'PHX', conference: 'West', division: 'Pacific', colors: { primary: '#1D1160', secondary: '#E56020' } },
  { id: 'POR', name: 'Portland Trail Blazers', abbreviation: 'POR', conference: 'West', division: 'Northwest', colors: { primary: '#E03A3E', secondary: '#000000' } },
  { id: 'SAC', name: 'Sacramento Kings', abbreviation: 'SAC', conference: 'West', division: 'Pacific', colors: { primary: '#5A2D81', secondary: '#626567' } },
  { id: 'SAS', name: 'San Antonio Spurs', abbreviation: 'SAS', conference: 'West', division: 'Southwest', colors: { primary: '#000000', secondary: '#C4CED4' } },
  { id: 'TOR', name: 'Toronto Raptors', abbreviation: 'TOR', conference: 'East', division: 'Atlantic', colors: { primary: '#CE1141', secondary: '#000000' } },
  { id: 'UTA', name: 'Utah Jazz', abbreviation: 'UTA', conference: 'West', division: 'Northwest', colors: { primary: '#002B5C', secondary: '#F9A01B' } },
  { id: 'WAS', name: 'Washington Wizards', abbreviation: 'WAS', conference: 'East', division: 'Southeast', colors: { primary: '#002B5C', secondary: '#E31837' } },
]

export const legendTeams: Team[] = [
  { id: 'LEG1', name: '1996 Chicago Bulls', abbreviation: 'BULLS', conference: 'East', division: 'Legends', colors: { primary: '#CE1141', secondary: '#000000' } },
  { id: 'LEG2', name: '2001 Los Angeles Lakers', abbreviation: 'LAKERS', conference: 'West', division: 'Legends', colors: { primary: '#552583', secondary: '#FDB927' } },
  { id: 'LEG3', name: '1986 Boston Celtics', abbreviation: 'CELTICS', conference: 'East', division: 'Legends', colors: { primary: '#007A33', secondary: '#BA0C2F' } },
  { id: 'LEG4', name: '2016 Golden State Warriors', abbreviation: 'WARRIORS', conference: 'West', division: 'Legends', colors: { primary: '#1D428A', secondary: '#FFC72C' } },
]
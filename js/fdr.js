// Import utility functions from the main application file
import { showGeneralMessage } from './main.js';

// Function to get the opponent and home/away status for a fixture
const getFixtureDetails = (fixture, teamId) => {
    if (!fixture) return { opponent: 'TBD', isHome: true, fdr: 4 }; // Fallback for a blank fixture
    const isHome = fixture.team_h === teamId;
    const opponentTeamId = isHome ? fixture.team_a : fixture.team_h;
    const opponentTeam = window.globalState.teams.find(t => t.id === opponentTeamId);
    const opponentName = opponentTeam ? opponentTeam.shortName : '?';
    const fdr = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
    return {
        opponent: opponentName,
        isHome: isHome,
        fdr: fdr
    };
};

// Function to render the FDR grid based on the number of rounds to show
const renderFDRGrid = (roundsToShow) => {
    const fdrGrid = document.getElementById('fdrGrid');
    const fdrScaleDisplay = document.getElementById('fdrScaleDisplay');
    if (!fdrGrid || !fdrScaleDisplay) {
        showGeneralMessage('FDR content area not found.', true);
        return;
    }

    fdrGrid.innerHTML = '';
    const teams = window.globalState.teams;
    const globalSeasonSchedule = window.globalState.globalSeasonSchedule;
    const currentGW = window.globalState.activeGW;

    // Create GW headers
    const teamHeaderCell = document.createElement('div');
    teamHeaderCell.className = 'fdr-cell team-name';
    teamHeaderCell.textContent = 'Team';
    fdrGrid.appendChild(teamHeaderCell);

    for (let i = 0; i < roundsToShow; i++) {
        const gw = currentGW + i;
        const gwHeaderCell = document.createElement('div');
        gwHeaderCell.className = 'fdr-cell gw-header';
        gwHeaderCell.textContent = `GW ${gw}`;
        fdrGrid.appendChild(gwHeaderCell);
    }
    
    // Sort teams by FDR average
    const sortedTeams = teams.map(team => {
        let totalFdr = 0;
        let fixtureCount = 0;
        for (let i = 0; i < roundsToShow; i++) {
            const gw = currentGW + i;
            const fixture = globalSeasonSchedule.find(f => f.event === gw && (f.team_h === team.id || f.team_a === team.id));
            if (fixture) {
                const fdr = getFixtureDetails(fixture, team.id).fdr;
                totalFdr += fdr;
                fixtureCount++;
            }
        }
        return {
            ...team,
            averageFdr: fixtureCount > 0 ? (totalFdr / fixtureCount) : 0
        };
    }).sort((a, b) => a.averageFdr - b.averageFdr);

    // Create the grid rows for each team
    sortedTeams.forEach(team => {
        const teamNameCell = document.createElement('div');
        teamNameCell.className = 'fdr-cell team-name';
        teamNameCell.textContent = team.shortName;
        fdrGrid.appendChild(teamNameCell);

        for (let i = 0; i < roundsToShow; i++) {
            const gw = currentGW + i;
            const fixture = globalSeasonSchedule.find(f => f.event === gw && (f.team_h === team.id || f.team_a === team.id));
            const fixtureDetails = getFixtureDetails(fixture, team.id);

            const fixtureCell = document.createElement('div');
            fixtureCell.className = 'fdr-cell fixture';
            fixtureCell.setAttribute('data-fdr', fixtureDetails.fdr);
            fixtureCell.innerHTML = `
                <span class="opponent">${fixtureDetails.opponent}</span>
                <span class="home-away">${fixtureDetails.isHome ? '(H)' : '(A)'}</span>
            `;
            fdrGrid.appendChild(fixtureCell);
        }
    });

    // FDR Scale display (if not already rendered)
    if (fdrScaleDisplay.innerHTML === '') {
        const fdrScaleData = {
            1: 'Very Easy', 2: 'Easy', 3: 'Medium', 4: 'Hard',
            5: 'Very Hard', 6: 'Extremely Hard', 7: 'Impossible'
        };
        Object.entries(fdrScaleData).forEach(([fdr, label]) => {
            const item = document.createElement('div');
            item.className = `fdr-scale-item fdr-${fdr}`;
            item.textContent = `${fdr} (${label})`;
            fdrScaleDisplay.appendChild(item);
        });
    }
};

// Set up event listeners for the FDR UI
const setupFDRUI = () => {
    const roundsToShowSlider = document.getElementById('roundsToShowSlider');
    const roundsToShowValueSpan = document.getElementById('roundsToShowValueSpan');

    if (roundsToShowSlider && roundsToShowValueSpan) {
        roundsToShowValueSpan.textContent = roundsToShowSlider.value;
        renderFDRGrid(parseInt(roundsToShowSlider.value, 10));

        roundsToShowSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            roundsToShowValueSpan.textContent = value;
            renderFDRGrid(parseInt(value, 10));
        });
    } else {
        showGeneralMessage('FDR UI elements not found. Please check your HTML.', true);
    }
};

// Export the setup function for main.js to use
export { setupFDRUI };

// Import utility functions from the main application file
import { showGeneralMessage } from './main.js';

// Function to calculate the average FDR for a team over a specified number of gameweeks
const calculateTeamAverageFDR = (teamId, gameweeksToShow) => {
    let totalFdr = 0;
    let fixtureCount = 0;
    const globalSeasonSchedule = window.globalState.globalSeasonSchedule;
    const currentGW = window.globalState.activeGW;

    for (let i = 0; i < gameweeksToShow; i++) {
        const gw = currentGW + i;
        const fixture = globalSeasonSchedule.find(f => f.event === gw && (f.team_h === teamId || f.team_a === teamId));
        if (fixture) {
            const isHome = fixture.team_h === teamId;
            const fdr = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
            totalFdr += fdr;
            fixtureCount++;
        }
    }
    return fixtureCount > 0 ? (totalFdr / fixtureCount) : 0;
};

// Function to render the list of teams to target
const renderTeamsToTargetList = (gameweeksToShow) => {
    const teamsToTargetList = document.getElementById('teamsToTargetList');
    if (!teamsToTargetList) {
        showGeneralMessage('Teams to Target list container not found.', true);
        return;
    }

    const teams = window.globalState.teams;

    // Calculate average FDR for all teams and sort them in ascending order (lower FDR is better)
    const teamsWithFDR = teams.map(team => {
        const avgFdr = calculateTeamAverageFDR(team.id, gameweeksToShow);
        return { ...team, avgFdr: avgFdr };
    }).sort((a, b) => a.avgFdr - b.avgFdr);

    teamsToTargetList.innerHTML = '';
    
    // Create the list of teams with the best upcoming fixtures
    teamsWithFDR.forEach(team => {
        const listItem = document.createElement('div');
        listItem.className = 'team-to-target-item';
        listItem.innerHTML = `
            <div class="team-name">${team.name}</div>
            <div class="team-avg-fdr">Avg. FDR: ${team.avgFdr.toFixed(2)}</div>
        `;
        teamsToTargetList.appendChild(listItem);
    });
};

// Set up event listeners for the Teams to Target UI
const setupTeamsToTargetUI = () => {
    const roundsToShowSlider = document.getElementById('roundsToShowTeamsToTargetSlider');
    const roundsToShowValueSpan = document.getElementById('roundsToShowValueTeamsToTargetSpan');

    if (roundsToShowSlider && roundsToShowValueSpan) {
        roundsToShowValueSpan.textContent = roundsToShowSlider.value;
        renderTeamsToTargetList(parseInt(roundsToShowSlider.value, 10));

        roundsToShowSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            roundsToShowValueSpan.textContent = value;
            renderTeamsToTargetList(parseInt(value, 10));
        });
    } else {
        showGeneralMessage('Teams to Target UI elements not found. Please check your HTML.', true);
    }
};

// Export the setup function for main.js to use
export { setupTeamsToTargetUI };

// Import utility functions from the main application file
import { showGeneralMessage } from './main.js';

// Get a reference to the main pitch element
const pitch = document.getElementById('pitch');
let selectedPlayers = {}; // Keep track of players on the pitch

// Helper function to get position code from position ID
const getPositionCode = (positionId) => {
    switch (positionId) {
        case 1: return 'GK';
        case 2: return 'DEF';
        case 3: return 'MID';
        case 4: return 'FWD';
        default: return 'ALL';
    }
};

// Function to render the player list based on filters
const renderPlayers = (players) => {
    const playerList = document.getElementById('playerList');
    if (!playerList) {
        showGeneralMessage('Player list container not found.', true);
        return;
    }
    playerList.innerHTML = ''; // Clear previous players

    players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.draggable = true;
        playerCard.setAttribute('data-player-id', player.id);
        playerCard.setAttribute('data-position-id', player.element_type);
        playerCard.setAttribute('data-position', getPositionCode(player.element_type));

        playerCard.innerHTML = `
            <img src="${window.config.playerImagePath}${player.id}.png" alt="${player.web_name}" class="player-photo">
            <div class="player-info">
                <div class="player-name">${player.web_name}</div>
                <div class="player-team">${window.globalState.teams.find(t => t.id === player.team).shortName}</div>
                <div class="player-price">£${(player.now_cost / 10).toFixed(1)}</div>
            </div>
        `;
        playerList.appendChild(playerCard);

        // Add drag start listener
        playerCard.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', player.id);
        });
    });
};

// Filter and render players
const filterPlayers = () => {
    const searchInput = document.getElementById('filterSearch');
    const playerFilters = document.querySelectorAll('.player-filters .filter-btn');
    const playerList = window.globalState.playerData;
    let filteredPlayers = [...playerList];

    // Filter by position
    const activeFilter = document.querySelector('.player-filters .filter-btn.active');
    const position = activeFilter ? activeFilter.getAttribute('data-pos') : 'all';

    if (position !== 'all') {
        const positionId = Object.entries({
            GK: 1, DF: 2, MID: 3, FWD: 4
        }).find(([key, value]) => key === position)?.[1];
        filteredPlayers = filteredPlayers.filter(p => p.element_type === positionId);
    }

    // Filter by search term
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredPlayers = filteredPlayers.filter(p => p.web_name.toLowerCase().includes(searchTerm) || window.globalState.teams.find(t => t.id === p.team).name.toLowerCase().includes(searchTerm));
    }

    renderPlayers(filteredPlayers);
};

// Handle player drop on the pitch
const handleDrop = (e) => {
    e.preventDefault();
    const playerId = e.dataTransfer.getData('text/plain');
    const player = window.globalState.playerData.find(p => p.id == playerId);
    const dropTarget = e.currentTarget;
    
    if (!player) return;

    const playerPositionCode = getPositionCode(player.element_type);
    const targetPositionCode = dropTarget.id.split('-')[2].slice(0, -1); // e.g., 'pitch-pos-DF1' -> 'DF'

    if (playerPositionCode !== targetPositionCode) {
        showGeneralMessage('This player cannot be placed in that position.', true);
        return;
    }

    // Check if a player is already in that position
    if (dropTarget.querySelector('.player-pitch-card')) {
        // Remove the existing player first
        const existingPlayerId = dropTarget.querySelector('.player-pitch-card').getAttribute('data-player-id');
        delete selectedPlayers[existingPlayerId];
        dropTarget.innerHTML = dropTarget.id.split('-')[2]; // Reset the text
    }

    addPlayerToPitch(player, dropTarget);
};

// Add player card to the pitch
const addPlayerToPitch = (player, dropTarget) => {
    const playerCard = document.createElement('div');
    playerCard.className = 'player-pitch-card';
    playerCard.setAttribute('data-player-id', player.id);
    playerCard.innerHTML = `
        <img src="${window.config.playerImagePath}${player.id}.png" alt="${player.web_name}" class="player-photo-small">
        <div class="player-name-small">${player.web_name}</div>
        <div class="player-remove-btn">&times;</div>
    `;
    dropTarget.innerHTML = '';
    dropTarget.appendChild(playerCard);

    selectedPlayers[player.id] = player;

    // Add a listener to remove the player from the pitch
    const removeBtn = playerCard.querySelector('.player-remove-btn');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        delete selectedPlayers[player.id];
        dropTarget.innerHTML = dropTarget.id.split('-')[2].slice(0, -1);
    });
};

// Set up event listeners for the Transfer Planner UI
const setupTransferPlannerUI = () => {
    const playerFilters = document.querySelectorAll('.player-filters .filter-btn');
    const searchInput = document.getElementById('filterSearch');

    // Attach filter button listeners
    playerFilters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            playerFilters.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterPlayers();
        });
    });

    // Attach search input listener
    if (searchInput) {
        searchInput.addEventListener('input', filterPlayers);
    }

    // Initial render of all players
    filterPlayers();

    // Set up drag-and-drop for pitch positions
    if (pitch) {
        const pitchPositions = pitch.querySelectorAll('.pitch-position');
        pitchPositions.forEach(pos => {
            pos.addEventListener('dragover', (e) => e.preventDefault());
            pos.addEventListener('drop', handleDrop);
        });
    } else {
        showGeneralMessage('Pitch element not found for Transfer Planner.', true);
    }
};

// Export the setup function for main.js to use
export { setupTransferPlannerUI };

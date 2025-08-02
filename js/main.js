// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Import other component logic (these files will be created in the next steps)
import { handleAuthFormSubmit, setupAuthUI } from './auth.js';
import { setupFDRUI } from './fdr.js';
import { setupTeamsToTargetUI } from './teams-to-target.js';
import { setupTransferPlannerUI } from './transfer-planner.js';
import { setupAdminDashboardUI } from './admin.js';

// Global variables for Firebase configuration
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Global application state
window.globalState = {
    // These will be populated by data from the APIs
    globalSeasonSchedule: {},
    playerData: {},
    teamData: {},
    activeGW: 1,
    teams: [],
    // User-related state
    isLoggedIn: false,
    isAdmin: false,
    userCustomFDRRatings: {},
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get a reference to the main content area
const mainContent = document.getElementById('mainContent');

// Utility function to show and hide modals
const showModal = (modalId) => { document.getElementById(modalId).style.display = 'flex'; };
const hideModal = (modalId) => { document.getElementById(modalId).style.display = 'none'; };
const showGeneralMessage = (message, isError = false) => {
    const generalMessageModal = document.getElementById('generalMessageModal');
    const generalMessageEl = document.getElementById('generalMessage');
    if (generalMessageEl) {
        generalMessageEl.textContent = message;
        generalMessageEl.className = isError ? 'error' : 'success';
        showModal('generalMessageModal');
    }
};

// Function to dynamically load HTML content into the mainContent div
const loadView = async (viewName) => {
    const viewPath = `views/${viewName}.html`;
    try {
        const response = await fetch(viewPath);
        if (!response.ok) throw new Error(`Could not load view: ${viewPath}`);
        const html = await response.text();
        mainContent.innerHTML = html;
        // After loading a new view, we need to re-run the setup functions for that view
        switch(viewName) {
            case 'auth': setupAuthUI(); break;
            case 'fdr': setupFDRUI(); break;
            case 'teams-to-target': setupTeamsToTargetUI(); break;
            case 'transfer-planner': setupTransferPlannerUI(); break;
            case 'admin-dashboard': setupAdminDashboardUI(); break;
            // Add more cases for new features here
        }
    } catch (error) {
        console.error("Failed to load view:", error);
        mainContent.innerHTML = `<p class="error">Failed to load content. Please try again.</p>`;
    }
};

// Function to check if a user is an admin
const checkAdminStatus = async (user) => {
    if (!user) return false;
    const adminDoc = await getDoc(doc(db, "admin", user.uid));
    return adminDoc.exists();
};

// Function to handle fetching and processing initial data
const fetchInitialData = async () => {
    showModal('loadingModal');
    try {
        // Fetch bootstrap data
        const bootstrapStaticUrl = window.config.bootstrapStaticApiUrl;
        const bootstrapResponse = await fetch(bootstrapStaticUrl);
        const bootstrapData = await bootstrapResponse.json();

        window.globalState.playerData = bootstrapData.elements;
        window.globalState.teamData = bootstrapData.teams;
        window.globalState.teams = bootstrapData.teams.map(team => ({
            id: team.id,
            name: team.name,
            code: team.code,
            shortName: team.short_name,
            played: team.played,
            position: team.position,
        }));
        window.globalState.activeGW = bootstrapData.events.find(event => event.is_current).id;

        // Fetch fixtures data for the entire season
        const fixturesApiUrl = `${window.config.fixturesApiBaseUrl}1-34`; // Assuming 34 gameweeks
        const fixturesResponse = await fetch(fixturesApiUrl);
        window.globalSeasonSchedule = await fixturesResponse.json();
    } catch (error) {
        console.error('Failed to fetch initial data:', error);
        showGeneralMessage('Failed to load season data. Please refresh the page.', true);
    } finally {
        hideModal('loadingModal');
    }
};

// Authentication state listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in.
        window.globalState.isLoggedIn = true;
        await fetchInitialData();
        const isAdmin = await checkAdminStatus(user);
        window.globalState.isAdmin = isAdmin;

        // Load the default authenticated view (FDR)
        await loadView('fdr');
    } else {
        // User is signed out.
        window.globalState.isLoggedIn = false;
        window.globalState.isAdmin = false;
        await loadView('auth');
    }
});

// Initial authentication check with custom token
const initAuth = async () => {
    if (initialAuthToken) {
        try {
            await signInWithCustomToken(auth, initialAuthToken);
        } catch (error) {
            console.error("Error signing in with custom token:", error);
            // Fallback to anonymous sign-in if custom token fails
            await signInAnonymously(auth);
        }
    } else {
        // Fallback for local testing or when no token is provided
        await signInAnonymously(auth);
    }
};

// Theme toggle logic
const setTheme = (theme) => {
    const logoImg = document.getElementById('logo-img');
    document.body.className = theme === 'dark' ? 'dark-mode' : '';
    localStorage.setItem('theme', theme);
    if (logoImg) {
        // Set logo based on theme. Using placeholders here.
        logoImg.src = theme === 'dark' ? 'Pitch Background.png-7ac071ba-60b1-40e0-8e33-7ca69b15dddf' : 'Pitch Background.png-7ac071ba-60b1-40e0-8e33-7ca69b15dddf';
    }
};

// Sidebar logic
const setupSidebar = () => {
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('overlay');

    if (menuToggle && sidebarMenu && overlay) {
        menuToggle.addEventListener('click', () => { sidebarMenu.classList.toggle('open'); overlay.style.display = sidebarMenu.classList.contains('open') ? 'block' : 'none'; });
        closeSidebar.addEventListener('click', () => { sidebarMenu.classList.remove('open'); overlay.style.display = 'none'; });
        overlay.addEventListener('click', () => { sidebarMenu.classList.remove('open'); overlay.style.display = 'none'; });
    }

    // Navigation links
    const menuItems = {
        'menuFDR': 'fdr',
        'menuTeamsToTarget': 'teams-to-target',
        'menuTransferPlanner': 'transfer-planner',
        'menuAdminDashboard': 'admin-dashboard'
    };

    for (const [id, view] of Object.entries(menuItems)) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', async (e) => {
                e.preventDefault();
                await loadView(view);
                sidebarMenu.classList.remove('open');
                overlay.style.display = 'none';
            });
        }
    }

    const menuLogout = document.getElementById('menuLogout');
    if (menuLogout) {
        menuLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            await signOut(auth);
            sidebarMenu.classList.remove('open');
            overlay.style.display = 'none';
        });
    }

    // Hide admin dashboard link for non-admins
    onAuthStateChanged(auth, user => {
        const menuAdminDashboard = document.getElementById('menuAdminDashboard');
        if (menuAdminDashboard) {
            if (user) {
                checkAdminStatus(user).then(isAdmin => {
                    menuAdminDashboard.style.display = isAdmin ? 'block' : 'none';
                });
            } else {
                menuAdminDashboard.style.display = 'none';
            }
        }
    });
};

// Setup initial UI and event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial theme setup
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme || 'light');
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = savedTheme === 'dark';
        darkModeToggle.addEventListener('change', (e) => setTheme(e.target.checked ? 'dark' : 'light'));
    }

    // Modals event listeners
    document.getElementById('closeConfirmationModal')?.addEventListener('click', () => hideModal('confirmationModal'));
    document.getElementById('closeGeneralMessageModal')?.addEventListener('click', () => hideModal('generalMessageModal'));

    // Sidebar setup
    setupSidebar();
    
    // Initial authentication check and data fetch
    initAuth();
});

// Export utility functions to be used by other modules
export { db, auth, loadView, showModal, hideModal, showGeneralMessage };

// Import Firebase services and utility functions
import { db, showGeneralMessage } from './main.js';
import { collection, getDocs, doc, setDoc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Utility function to get user's display name or email
const getUserDisplay = (user) => user.displayName || user.email || user.uid;

// Render the user list for the admin dashboard
const renderAdminDashboard = async () => {
    const adminUserList = document.getElementById('adminUserList');
    if (!adminUserList) {
        showGeneralMessage('Admin user list container not found.', true);
        return;
    }
    adminUserList.innerHTML = ''; // Clear previous users

    try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        
        usersSnapshot.forEach(userDoc => {
            const userData = userDoc.data();
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            userCard.innerHTML = `
                <div class="user-info">
                    <div class="user-id">User ID: ${userDoc.id}</div>
                    <div class="user-email">Email: ${userData.email || 'N/A'}</div>
                </div>
                <div class="user-actions">
                    <button class="edit-fdr-btn" data-user-id="${userDoc.id}">Edit FDR</button>
                    <!-- Future action buttons can go here -->
                </div>
            `;
            adminUserList.appendChild(userCard);
        });

    } catch (error) {
        console.error("Error fetching users for admin dashboard:", error);
        showGeneralMessage('Failed to load user data.', true);
    }
};

// Function to handle saving custom FDR ratings
const saveCustomFDR = async (userId, fdrRatings) => {
    try {
        const userFdrRef = doc(db, "userFDR", userId);
        await setDoc(userFdrRef, { ratings: fdrRatings }, { merge: true });
        showGeneralMessage('Custom FDR ratings saved successfully!');
    } catch (error) {
        console.error("Error saving custom FDR ratings:", error);
        showGeneralMessage('Failed to save custom FDR ratings.', true);
    }
};

// Function to export the FDR table as a GIF
const exportFDRToGIF = async () => {
    const fdrSection = document.getElementById('fdrSection');
    if (!fdrSection) {
        showGeneralMessage('FDR section not found. Cannot export.', true);
        return;
    }

    try {
        // Use html2canvas to capture the element
        const canvas = await html2canvas(fdrSection);
        
        // This is a placeholder for GIF creation logic.
        // The actual gif.js library implementation would be more complex,
        // involving capturing frames over time. For now, we will
        // just show a message.
        showGeneralMessage('GIF export is a premium feature. Please contact support.', false);
    } catch (error) {
        console.error('Error exporting FDR to GIF:', error);
        showGeneralMessage('Failed to export FDR to GIF.', true);
    }
};

// Setup event listeners for the Admin Dashboard UI
const setupAdminDashboardUI = () => {
    const exportGifBtn = document.getElementById('exportGifBtn');
    
    if (exportGifBtn) {
        exportGifBtn.addEventListener('click', exportFDRToGIF);
    }

    // Check if the user is an admin before rendering the dashboard content
    if (window.globalState.isAdmin) {
        renderAdminDashboard();
    } else {
        const adminSection = document.getElementById('adminSection');
        if (adminSection) {
            adminSection.innerHTML = '<p class="error">You do not have permission to view this page.</p>';
        }
        showGeneralMessage('Access Denied: You are not an administrator.', true);
    }
};

// Export the setup function for main.js to use
export { setupAdminDashboardUI };

// Import Firebase auth service from the main application file
import { auth, showGeneralMessage, loadView } from './main.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Utility function to show and hide form elements
const toggleForm = () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleAuthLink = document.getElementById('toggleAuthForm');

    if (!loginForm || !signupForm || !toggleAuthLink) return;

    if (loginForm.style.display === 'flex') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        toggleAuthLink.textContent = 'Already have an account? Login here.';
    } else {
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        toggleAuthLink.textContent = 'Don\'t have an account? Sign up here.';
    }
};

// Handle form submissions for both login and signup
const handleAuthFormSubmit = async (e) => {
    e.preventDefault();
    const formId = e.target.id;
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!email || !password) {
        showGeneralMessage('Please enter both email and password.', true);
        return;
    }

    if (formId === 'loginForm') {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            showGeneralMessage('Login successful!');
            // After successful login, the main.js auth state listener will handle view change
        } catch (error) {
            console.error("Login failed:", error.code, error.message);
            showGeneralMessage('Login failed. Please check your credentials.', true);
        }
    } else if (formId === 'signupForm') {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            showGeneralMessage('Sign up successful! You are now logged in.');
            // After successful signup, the main.js auth state listener will handle view change
        } catch (error) {
            console.error("Sign up failed:", error.code, error.message);
            if (error.code === 'auth/email-already-in-use') {
                showGeneralMessage('This email is already in use.', true);
            } else if (error.code === 'auth/weak-password') {
                showGeneralMessage('Password should be at least 6 characters long.', true);
            } else {
                showGeneralMessage('Sign up failed. Please try again.', true);
            }
        }
    }
};

// Set up the event listeners for the authentication UI
const setupAuthUI = () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleAuthLink = document.getElementById('toggleAuthForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleAuthFormSubmit);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleAuthFormSubmit);
    }
    if (toggleAuthLink) {
        toggleAuthLink.addEventListener('click', toggleForm);
    }
};

// Export the setup function for the main.js file to use
export { setupAuthUI, handleAuthFormSubmit };

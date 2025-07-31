// --- DOM Element References ---
const themeSwitcher = document.getElementById('theme-switcher');
const videoUrlInput = document.getElementById('videoUrl');
const pasteBtn = document.getElementById('pasteBtn');
const verifyBtn = document.getElementById('verifyBtn');
const verifyBtnText = document.getElementById('verifyBtnText');
const loader = document.getElementById('loader');
const messageDiv = document.getElementById('message');
const videoInfoDiv = document.getElementById('videoInfo');
const thumbnailImg = document.getElementById('thumbnail');
const videoTitle = document.getElementById('videoTitle');
const downloadBtn = document.getElementById('downloadBtn');
const downloadIcon = document.getElementById('downloadIcon');
const downloadLoader = document.getElementById('downloadLoader');

// --- IMPORTANT: API Configuration ---
// Replace this with your actual API endpoint.
// It should accept a 'url' query parameter with the YouTube video URL.
// Example: https://your-api.com/getVideoInfo?url=ENCODED_YOUTUBE_URL
//
// Your API should return a JSON object with this structure on success:
// {
//   "success": true,
//   "title": "The Video Title",
//   "thumbnail": "https://image.url/thumbnail.jpg",
//   "downloadUrl": "https://your-api.com/download?id=VIDEO_ID"
// }
// And this structure on failure:
// {
//   "success": false,
//   "message": "Invalid YouTube URL"
// }
const API_BASE_URL = 'http://localhost:3000/api/videos';

// --- Theme Switcher Logic ---
themeSwitcher.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
});

// --- Event Listeners ---

// Paste button functionality
pasteBtn.addEventListener('click', async () => {
    try {
        // Use the modern clipboard API
        const text = await navigator.clipboard.readText();
        videoUrlInput.value = text;
        showMessage('Link pasted from clipboard!', 'green');
    } catch (err) {
        showMessage('Failed to read clipboard. Please paste manually.', 'red');
        console.error('Clipboard read failed: ', err);
    }
});

// Verify button functionality
verifyBtn.addEventListener('click', handleVerification);

// Allow pressing Enter to verify
videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission if it's in a form
        handleVerification();
    }
});

// --- Core Functions ---

/**
 * Handles the entire video link verification process.
 */
async function handleVerification() {
    const url = videoUrlInput.value.trim();

    // Basic validation
    if (!url || !isValidHttpUrl(url)) {
        showMessage('Please enter a valid URL.', 'red');
        return;
    }

    // Hide previous info and show loader
    setLoading(true);
    videoInfoDiv.classList.add('hidden');
    messageDiv.textContent = '';

    try {
        // Construct the full API URL
        const apiUrl = `${API_BASE_URL}/info?v=${encodeURIComponent(url)}`;

        // Fetch data from your API
        const response = await fetch(apiUrl, { method: 'GET' });

        if (!response.ok) {
            // Handle HTTP errors like 404, 500
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            // API call was successful and returned valid data
            displayVideoInfo(data.data);
        } else {
            // API returned a success:false flag
            throw new Error(data.message || 'The provided link is not valid.');
        }
    } catch (error) {
        console.error('Verification failed:', error);
        showMessage(error.message, 'red');
        videoInfoDiv.classList.add('hidden');
    } finally {
        // Always hide loader and re-enable button
        setLoading(false);
    }
}

/**
 * Displays the video information card.
 * @param {object} data - The data from the API.
 */
function displayVideoInfo(data) {
    videoTitle.textContent = data.title;
    thumbnailImg.src = data.thumbnails[1].url;

    // Show the info card with an animation
    videoInfoDiv.classList.remove('hidden');
    videoInfoDiv.classList.add('animate-fade-in');
}

const handleDownload = async () => {
    //loading true
    downloadBtn.disabled = true;
    downloadIcon.classList.add('hidden');
    downloadLoader.classList.remove('hidden');
    const url = videoUrlInput.value.trim();

    downloadBtn.href = `${API_BASE_URL}/download?v=${encodeURIComponent(url)}`;

    setTimeout(() => {
        downloadBtn.disabled = false;
        downloadIcon.classList.remove('hidden');
        downloadLoader.classList.add('hidden');
    }, 5000);
};

downloadBtn.addEventListener('click', handleDownload);

/**
 * Sets the loading state for the verify button.
 * @param {boolean} isLoading - Whether to show the loader.
 */
function setLoading(isLoading) {
    if (isLoading) {
        verifyBtn.disabled = true;
        verifyBtnText.classList.add('hidden');
        loader.classList.remove('hidden');
    } else {
        verifyBtn.disabled = false;
        verifyBtnText.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}

/**
 * Displays a message to the user for a few seconds.
 * @param {string} text - The message to display.
 * @param {'green' | 'red'} color - The color of the message.
 */
function showMessage(text, color = 'red') {
    messageDiv.textContent = text;
    messageDiv.className = `text-center h-5 my-4 transition-all duration-300 ${color === 'green' ? 'text-green-500' : 'text-red-500'}`;

    // Clear the message after 4 seconds
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 4000);
}

/**
 * Basic URL validation.
 * @param {string} string - The URL string to validate.
 * @returns {boolean}
 */
function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
}

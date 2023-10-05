// api helper js

import axios from 'axios';

/**
 * Fetches bullet comments for a specific video and updates the state.
 * 
 * @param {string} videoId - The ID of the video for which to fetch bullet comments.
 * @param {string} storedAccessToken - The JWT token for authorization.
 * @param {Function} setAllDanmus - The setter function for updating the bullet comments state.
 */
export const fetchBulletCommentsHelper = async (videoId, storedAccessToken, setAllDanmus) => {
    try {
        const response = await fetch(`/api/get_bullet_comments?video_id=${videoId}`, {
            headers: {
                'Authorization': `Bearer ${storedAccessToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            setAllDanmus(data.bullet_comments);
            console.log("fetch success")
        } else {
            console.log("Failed to fetch bullet comments:", await response.text());
        }
    } catch (error) {
        console.log("An error occurred:", error);
    }
};

/**
 * Fetches the list of available videos and updates the state.
 * 
 * @param {Function} setVideos - The setter function for updating the videos state.
 * @param {Function} setCurrentVideo - The setter function for updating the current video state.
 */
export const fetchVideoListHelper = async (setVideos, setCurrentVideo) => {
    try {
        const response = await fetch('/api/get_video_list');
        if (response.ok) {
            const data = await response.json();
            setVideos(data);
            setCurrentVideo(data[0]);
        } else {
            console.log("Failed to fetch video list:", await response.text());
        }
    } catch (error) {
        console.log("An error occurred:", error);
    }
};

/**
 * Uploads a video and updates the upload progress.
 * 
 * @param {FormData} formData - The form data containing the video and metadata.
 * @param {Function} setUploadProgress - The setter function for updating the upload progress state.
 * @returns {Object} - The result of the upload, containing success status and optional error message.
 */
export const uploadVideo = async (formData, setUploadProgress) => {
    try {
        const storedAccessToken = sessionStorage.getItem('access_token');

        const response = await axios.post('/api/upload_video', formData, {
            headers: {
                'Authorization': `Bearer ${storedAccessToken}`
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            }
        });

        if (response.status === 201) {
            console.log(response.data.message);
            return {
                success: true,
                status: response.status
            };
        }
    } catch (error) {
        let errorMessage = "Uploading failed, please try again";
        if (error.response && error.response.status === 401) {
            errorMessage = "Login credential expired! Please relogin in!";
        }
        console.error("An error occurred during the upload:", error);
        return {
            success: false,
            errorMessage
        };
    }
};

/**
 * Sends a new bullet comment.
 * 
 * @param {Object} newBulletComment - The new bullet comment to be sent.
 * @returns {Object} - The result of the send action, containing success status and optional error message.
 */
export const sendBulletComment = async (newBulletComment) => {
    try {
        const storedAccessToken = sessionStorage.getItem('access_token');
        const response = await axios.post('/api/send_bullet_comment', newBulletComment, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${storedAccessToken}`
            }
        });

        if (response.status === 201) {
            console.log("Successfully sent bullet comment:", response.data);
            return {
                success: true
            };
        } else {
            console.log("Failed to send bullet comment:", response.data);
            return {
                success: false,
                errorMessage: 'Failed to send bullet comment!'
            };
        }
    } catch (error) {
        console.log("An error occurred:", error);
        let errorMessage = "An error occurred while sending the bullet comment.";
        if (error.response && (error.response.status === 401 || error.response.status === 422)) {
            errorMessage = "Invalid credentials! Please login in first!";
        }
        return {
            success: false,
            errorMessage
        };
    }
};

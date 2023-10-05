// VideoPage.jsx
import React, { useState, useEffect } from 'react';
import "./videos.css"
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchBulletCommentsHelper, fetchVideoListHelper, sendBulletComment, uploadVideo } from '../helpers/api';
import { attachAndDetachVideoEventListeners } from '../helpers/videoplayer';
import VideoCard from '../components/videocards';
import Uploading from '../components/uploading';
import Danmu from '../components/danmu';

/**
 * VideoPage Component
 *
 * This component is the main page for handling video-related functionalities.
 * It allows users to:
 * 1. View a list of available videos.
 * 2. Play a selected video.
 * 3. Send bullet comments (danmus) while watching a video.
 * 4. Upload a new video.
 * 5. Logout.
 *
 * State variables are used to manage video lists, bullet comments, and UI states.
 * Several effect hooks are used to fetch data and set up or clean up side effects.
 */
const VideoPage = () => {

  // State Variables
  const [videos, setVideos] = useState([]); // State to hold video list
  const [currentVideo, setCurrentVideo] = useState(null); // State to hold current playing video
  const [bullet, setBullet] = useState(''); // State to hold bullet user input
  const [danmus, setDanmus] = useState(Array(15).fill(null)); // State to hold bullets showing
  const [allDanmus, setAllDanmus] = useState([]); // State to hold all bullets of the current video
  const [isPaused, setIsPaused] = useState(false); // State to hold whether the current video is paused
  const [isUploading, setIsUploading] = useState(false); // State to hold whether the file is uploading
  const [uploadProgress, setUploadProgress] = useState(0); // state to hold the uploading progress


  const navigate = useNavigate();

  /**
  * Logout Function
  * Clears session storage and redirects user to the login page.
  */
  const logout = () => {
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem('access_token');
    navigate('/login');
  };

  /**
  * Effect Hook: Fetch bullet comments from backend
  * This hook gets executed whenever currentVideo state changes.
  */
  useEffect(() => {

    if (!currentVideo) return;
    // console.log("damus fetch and retrived!")
    fetchBulletCommentsHelper(currentVideo._id, sessionStorage.getItem('access_token'), setAllDanmus)

    setDanmus(Array(15).fill(null));
  }, [currentVideo]);

  /**
   * Effect Hook: Attach and Detach Video Event Listeners
   * This effect sets up event listeners for the current video for handling time updates, pause and play events.
   * Event listeners will be detached when the component is unmounted or when the current video changes.
   */
  useEffect(() => {
    const detachListeners = attachAndDetachVideoEventListeners(setDanmus, setIsPaused);
    return () => {
      detachListeners();
    };
  }, [currentVideo]);

  /**
   * Effect Hook: Fetch Video List
   * This effect fetches the list of available videos when the component is mounted.
   */
  useEffect(() => {
    fetchVideoListHelper(setVideos, setCurrentVideo);
  }, []);

  /**
   * Effect Hook: Danmu Animation
   * This effect sets the animation for danmu elements based on whether the video is paused or playing.
   * It also ensures the animation adapts to the dimensions of the video player and the danmu elements.
   */
  useEffect(() => {
    const videoPlayerElement = document.querySelector('.video-player');
    if (videoPlayerElement) {
      const videoPlayerWidth = videoPlayerElement.offsetWidth;
      const danmuElements = document.querySelectorAll('.danmu');

      danmuElements.forEach((danmuElement, index) => {
        const danmuWidth = danmuElement.offsetWidth;
        const moveDistance = videoPlayerWidth - danmuWidth;
        danmuElement.style.animation = `danmu-animation-${moveDistance}px linear forwards 10s`;
        danmuElement.style.animationPlayState = isPaused ? 'paused' : 'running';

        const styleSheet = document.styleSheets[0];
        const keyframes =
          `@keyframes danmu-animation-${moveDistance}px {` +
          '  0% { transform: translateX(0); }' +
          `  100% { transform: translateX(-${moveDistance}px); }` +
          '}';
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

      });
    }
  }, [isPaused, danmus]);

  /**
    * Effect Hook: Update Danmus
    * This effect updates the danmus based on the current time of the video.
    * It sets an interval that checks for new danmus that should be displayed.
    * The interval will be cleared when the video is seeked or when the component is unmounted.
    */
  useEffect(() => {
    let interval;

    if (!isPaused) {
      interval = setInterval(() => {
        const videoElement = document.querySelector('.video-player');
        const currentTime = videoElement ? videoElement.currentTime : 0;
        // console.log("danmu checking at", currentTime, allDanmus);

        const newDanmus = [...danmus];
        allDanmus.forEach(danmu => {
          if (danmu) {
            let time_diff = currentTime - danmu.video_time_stamp
            if (0 <= time_diff && time_diff < 0.5) {
              const emptyRow = newDanmus.findIndex(row => !row);
              if (emptyRow !== -1) {
                newDanmus[emptyRow] = danmu;
                // console.log("updating..", currentTime - danmu.video_time_stamp)
              }
            }
          }

        });
        setDanmus(newDanmus);
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [allDanmus, danmus, isPaused]);

  /**
   * Handle Video Click
   * Sets the clicked video as the current video and reloads the video player.
   * @param {Object} video - The video object that was clicked.
   */
  const handleVideoClick = (video) => {
    // console.log("video click!" + video.title)
    setCurrentVideo(video);
    const videoElement = document.querySelector('.video-player');
    if (videoElement) {
      videoElement.load();
    }
  };

  /**
   * Handle Bullet Change
   * Sets the input value for the bullet comment.
   * @param {Event} event - The onChange event.
   */
  const handleChange = ({ target: { value } }) => {
    setBullet(value);
  };

  /**
   * Handle Animation End and prevent race condition
   * Removes the danmu that has completed its animation.
   * @param {Number} index - The index of the danmu in the array.
   */
  const handleAnimationEnd = (index) => {
    // console.log("remove!", index)
    setDanmus(prevDanmus => {
      const updatedDanmus = [...prevDanmus];
      updatedDanmus[index] = null;
      return updatedDanmus;
    });
    // console.log("newDanmus!", danmus)
  };

  /**
   * Handle Send Bullet Comment
   * Sends the bullet comment to backend and updates the local state.
   */
  const handleSend = async () => {
    const videoElement = document.querySelector('.video-player');
    if (!videoElement) {
      alert("no video is playing!");
      return;
    }
    const currentTime = videoElement ? videoElement.currentTime : 0;
    const newBulletComment = {
      text: bullet,
      video_time_stamp: currentTime + 0.5,
      video_id: currentVideo._id
    };

    setAllDanmus([...allDanmus, newBulletComment]);
    const result = await sendBulletComment(newBulletComment);

    if (result.success) {
      setAllDanmus([...allDanmus, newBulletComment]);
    } else {
      alert(result.errorMessage);
      if (result.errorMessage === 'Invalid credentials! Please login in first!') {
        navigate('/login');
      }
    }
    setBullet('');
  };

  /**
   * Handle File Upload
   * Handles the video file upload event.
   * @param {Event} event - The onChange event for the file input.
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    const userName = sessionStorage.getItem('user_name');
    const fileName = file.name;

    if (userName === null) {
      alert("Please login in first!");
      navigate("/login");
      return;
    }

    formData.append('username', userName);
    formData.append('title', fileName);
    const result = await uploadVideo(formData, setUploadProgress);
    // console.log("result", result);
    if (result.success) {
      setIsUploading(false);
      fetchVideoListHelper(setVideos, setCurrentVideo);
    } else {
      alert(result.errorMessage);
      setIsUploading(false);
      if (result.errorMessage === "Login credential expired! Please relogin in!") {
        navigate("/login");
      }
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Section for showing an empty message if no videos are present */}
      <div>
        {videos.length === 0 && !isUploading &&
          <div className="empty-message">Upload the first video!</div>
        }
      </div>
      {/* Video playback section */}
      <div className="video-container" style={{ flex: 7 }}>
        {currentVideo && (
          <div className="video-wrapper">
            <video controls className="video-player">
              <source src={currentVideo.url} type="video/mp4" />
            </video>
            <Danmu danmus={danmus} isPaused={isPaused} handleAnimationEnd={handleAnimationEnd} />
          </div>
        )}

        {currentVideo && (
          <div className="input-group mb-3" id="inputWrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Send danmu..."
              value={bullet}
              onChange={handleChange}
            />
            <div className="input-group-append" >
              <button type="button" onClick={handleSend}>Send</button>
            </div>
          </div>
        )}
      </div>
      {/* Sidebar for the list of videos */}
      <div style={{ flex: 3, maxHeight: '600px', overflowY: 'auto', minWidth: '300px' }}>
        {/* Conditional rendering for video list or uploading progress */}
        {isUploading ? (
          <Uploading id="upload1" uploadProgress={uploadProgress} />
        ) : (
          videos.length != 0 &&
          <>
            <h2>Video Lists</h2>
            <div className="row">
              {videos.map((video, index) => (
                <div className="col-12 mb-2 video-card" key={index}>
                  <VideoCard video={video} onClick={handleVideoClick} />
                </div>
              ))}
            </div>
          </>
        )}
        {/* File input button for uploading videos */}
        <input id="fileinputbar" type="file" className="form-control" onChange={handleFileUpload} aria-describedby="inputGroupFileAddon04" aria-label="Upload" />

      </div>
      {/* Logout Button */}
      <button className="logout-button" onClick={logout}>Sign out</button> {/* Logout button */}
    </div>
  );
};

export default VideoPage;

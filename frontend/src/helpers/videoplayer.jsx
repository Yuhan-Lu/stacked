
/**
 * Attach Event Listeners to Video Player
 * Adds and removes event listeners for the video player.
 * @param {Function} setDanmus - The setter function for danmus state.
 * @param {Function} setIsPaused - The setter function for isPaused state.
 */

export const attachAndDetachVideoEventListeners = (setDanmus, setIsPaused) => {
    const videoElement = document.querySelector('.video-player');
    if (!videoElement) return () => {};
  
    const handleTimeUpdate = () => {
      setDanmus(Array(15).fill(null));
    };
  
    const handlePause = () => {
      setIsPaused(true);
    };
  
    const handlePlay = () => {
      setIsPaused(false);
    };
  
    videoElement.addEventListener('seeked', handleTimeUpdate);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('play', handlePlay);
  
    const detachListeners = () => {
      videoElement.removeEventListener('seeked', handleTimeUpdate);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('play', handlePlay);
    };
  
    return detachListeners;
  };
  

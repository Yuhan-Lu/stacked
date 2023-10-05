import React from 'react';

const Danmu = ({ danmus, isPaused, handleAnimationEnd }) => {
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

  return (
    <>
      {danmus.map((danmu, index) => (
        danmu && (
          <div key={index}
            className="danmu"
            style={{
              top: `${index * 30}px`,
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
            onAnimationEnd={() => handleAnimationEnd(index)}
          >
            {danmu.text}
          </div>
        )
      ))}
    </>
  );
};

export default Danmu;

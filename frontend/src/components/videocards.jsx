
import React from 'react';
import { Card } from 'react-bootstrap';
import "./videocards.css"

/**
 * VideoCard Component
 * 
 * This component renders a single video card with video information.
 * 
 * @param {Object} video - The video object containing information like title and username.
 * @param {Function} onClick - The function to be executed when the card is clicked.
 * 
 * @returns {JSX.Element} - A JSX element representing a single video card.
 */
const VideoCard = ({ video, onClick }) => {
  return (
    <Card className='customedvideocard' style={{padding:"15px", width: "90%", height: "80%", margin: '5px'}} onClick={() => onClick(video)}>
      <Card.Body>
        <Card.Title>{video.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Uploaded by: {video.user_name}</Card.Subtitle>
      </Card.Body>
    </Card>
  );
};

export default VideoCard;

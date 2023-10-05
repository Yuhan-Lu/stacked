# Video Sharing Platform with Bullet Comments

## Overview

This project is a full-stack application designed to demonstrate a video sharing platform with real-time bullet comments, also known as "danmus". The focus is on clean code structure, a functional and responsive user interface, and a secure backend.

The project aims to serve as a proof-of-concept for integrating real-time features such as bullet comments in a video-sharing platform. It showcases various aspects of full-stack development, including frontend, backend, and database management.

## Tech Stack

- **Frontend**: ReactJS
- **Backend**: Flask, Python
- **Database**: MongoDB
- **File Storage**: AWS S3
- **Authentication**: JSON Web Tokens (JWT)

## Features

### User Authentication
- Secure signup and login features are implemented using JWT for authentication.
- Passwords are hashed before storage for added security.

### Video Upload and Playback
- Users can upload videos that are stored in AWS S3.
- A list of available videos is displayed on the side panel.
- Videos can be played back with standard controls.

### Bullet Comments (Danmus)
- During video playback, users can send real-time bullet comments that overlay on the video.
- These comments are stored in MongoDB and fetched in real-time as the video plays.

### Logout
- A logout feature is also implemented, allowing users to end their session securely.

## Code Structure and Implementation

### Frontend

- The frontend is built using ReactJS and employs state and effect hooks for managing the application state and side-effects.
- The `VideoPage` component serves as the main interface for video-related functionalities. It maintains state variables for videos, current video, bullet comments, and UI states.
- The `Danmu` component handles the rendering and animation of bullet comments on the video.
- Utility functions and API calls are abstracted into helper files for better code organization.

### Backend

- The backend is built using Flask and Python.
- JWT is used for secure user authentication.
- Bullet comments and video metadata are stored in MongoDB.
- AWS S3 is used for storing the uploaded videos.
- Different routes are provided for signup, login, sending bullet comments, fetching comments, uploading videos, and fetching the video list.

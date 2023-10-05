import React from 'react';

/**
 * Uploading Component
 *
 * This component is responsible for displaying the upload progress.
 * It shows a progress bar that fills up as the upload progresses.
 *
 * @param {Number} uploadProgress - The current upload progress as a percentage (0-100).
 *
 * @returns {JSX.Element} - A JSX element that represents the upload progress UI.
 */
const Uploading = ({ uploadProgress }) => {
  return (
    <div className="card text-white bg-info mb-3" style={{ maxWidth: "18rem" }}>
      <div className="card-header">Uploading...</div>
      <div className="card-body">
        <h5 className="card-title">Please Wait</h5>
        {uploadProgress < 100 ? (
      <div className="progress">
        <div className="progress-bar progress-bar-striped progress-bar-animated"
             style={{ width: `${uploadProgress}%` }}>
          {uploadProgress}%
        </div>
      </div>
    ) : (
      <div>Uploading to S3...</div>
    )}
      </div>
    </div>
  );
};

export default Uploading;

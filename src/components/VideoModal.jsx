import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getDirectVideoUrl, getEmbedVideoUrl } from '../utils/videoUtils';
import './VideoModal.css';

const VideoModal = ({ isOpen, onClose, videoUrl, title }) => {
  const modalRef = useRef(null);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close when clicking outside of the modal content
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const embedUrl = getEmbedVideoUrl(videoUrl);
  const isYouTube = embedUrl.includes('youtube.com/embed/');

  // Enhance YouTube URLs to autoplay if appropriate
  let finalUrl = getDirectVideoUrl(embedUrl);
  if (isYouTube) {
    const separator = embedUrl.includes('?') ? '&' : '?';
    finalUrl = `${embedUrl}${separator}autoplay=1&rel=0`;
  }

  return (
    <div className="modal-overlay animate-fade-in" onClick={handleOverlayClick}>
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        
        <div className="video-container">
          {isYouTube ? (
            <iframe
              src={finalUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-iframe"
            ></iframe>
          ) : (
            <video
              src={finalUrl}
              title={title}
              controls
              autoPlay
              className="video-element"
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;

import { useContext } from 'react';
import { VideoContext } from '../context/VideoContext';
import VideoCard from './VideoCard';
import './VideoGrid.css';

const VideoGrid = () => {
  const { videos } = useContext(VideoContext);

  if (!videos || videos.length === 0) {
    return (
      <div className="empty-state">
        <p>No videos available. Head to the Admin panel to add some!</p>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {videos.map((video, index) => (
        <VideoCard 
          key={video.id} 
          video={video} 
          index={index} 
        />
      ))}
    </div>
  );
};

export default VideoGrid;

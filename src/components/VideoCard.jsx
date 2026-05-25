import './VideoCard.css';

const VideoCard = ({ video, index }) => {
  const isEmbeddable = video.videoUrl.includes('drive.google.com') || video.videoUrl.includes('youtube.com/embed');
  
  const handleClick = () => {
    if (isEmbeddable) {
      const watchUrl = video.videoUrl.includes('youtube.com/embed')
        ? video.videoUrl.replace('/embed/', '/watch?v=')
        : video.videoUrl.replace('/preview', '/view');
      window.open(watchUrl, '_blank');
    } else {
      window.open(video.videoUrl, '_blank');
    }
  };

  return (
    <div className={`work-card card-${(index % 5) + 1} reveal`}>
      <div className="card-thumb" onClick={handleClick}>
        <img 
          src={video.thumbnailUrl} 
          alt={video.title} 
          className="card-thumb-img" 
        />
        {isEmbeddable && (
          <iframe 
            className="card-thumb-iframe"
            src={video.videoUrl}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        )}
        <div className="card-grid-lines"></div>
        <div className="card-play"><div className="play-tri"></div></div>
        <div className="card-overlay"></div>
        <div className="card-info">
          <div className="card-cat">{video.category || 'Video Edit'}</div>
          <div className="card-title">{video.title}</div>
          <div className="card-desc">{video.description}</div>
        </div>
        <div className="card-badge">{video.year || '2024'}</div>
      </div>
    </div>
  );
};

export default VideoCard;

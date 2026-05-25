import { createContext, useContext, useEffect, useState } from 'react';
import { getYouTubeThumbnailUrl } from '../utils/videoUtils';

export const VideoContext = createContext();

export const useVideos = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideos must be used within a VideoProvider');
  }
  return context;
};

const fallbackVideos = [
  {
    id: 'youtube-short-test',
    title: 'YouTube Short Test',
    description: 'Unlisted YouTube Short test video playing inside the portfolio modal.',
    youtubeUrl: 'https://youtube.com/shorts/KDaJBzEjbZs?si=uIMrhV4nBUr60WMo',
    thumbnailUrl: 'https://img.youtube.com/vi/KDaJBzEjbZs/hqdefault.jpg',
    previewUrl: '',
    year: '2026',
  },
];

const normalizeVideo = (video, index) => {
  const youtubeUrl = video.youtubeUrl || video.embedUrl || video.videoUrl || '';

  return {
    id: video.id || `video-${index + 1}`,
    title: video.title || `Video ${index + 1}`,
    description: video.description || '',
    youtubeUrl,
    thumbnailUrl: video.thumbnailUrl || getYouTubeThumbnailUrl(youtubeUrl),
    previewUrl: video.previewUrl || '',
    year: video.year || '',
  };
};

export const VideoProvider = ({ children }) => {
  const [videos, setVideos] = useState(fallbackVideos.map(normalizeVideo));

  useEffect(() => {
    let isMounted = true;

    fetch(`${import.meta.env.BASE_URL}videos.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load videos.json');
        return response.json();
      })
      .then((items) => {
        if (isMounted && Array.isArray(items)) {
          setVideos(items.map(normalizeVideo));
        }
      })
      .catch(() => {
        if (isMounted) {
          setVideos(fallbackVideos.map(normalizeVideo));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <VideoContext.Provider value={{ videos }}>
      {children}
    </VideoContext.Provider>
  );
};

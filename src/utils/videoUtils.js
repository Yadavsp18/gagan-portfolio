/**
 * Utility to handle various video URL types and convert them 
 * to direct streamable formats where possible.
 */

export const getDirectVideoUrl = (url) => {
  if (!url) return '';
  
  // If it's already a local path or blob, return as is
  if (url.startsWith('/') || url.startsWith('blob:') || url.startsWith('./')) {
    return url;
  }

  // Handle Google Drive Links
  if (url.includes('drive.google.com')) {
    let fileId = '';
    
    try {
      // Handle /file/d/FILE_ID/... format
      const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (dMatch && dMatch[1]) {
        fileId = dMatch[1];
      } else {
        // Handle ?id=FILE_ID format
        const urlParams = new URLSearchParams(url.split('?')[1]);
        fileId = urlParams.get('id');
      }
    } catch (e) {
      console.error('Error parsing Google Drive URL:', e);
    }
    
    if (fileId) {
      // Returning the direct download link which works as a source for <video> tags
      // Note: Large files (>100MB) might be blocked by Google's virus scan warning page
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }

  // YouTube doesn't easily allow direct video streaming in <video> elements
  // We should continue using iframes for full YouTube playback
  
  return url;
};

export const getEmbedVideoUrl = (url) => {
  if (!url) return '';

  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes('youtube.com')) {
      const shortsMatch = parsedUrl.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch?.[1]) {
        return `https://www.youtube.com/embed/${shortsMatch[1]}`;
      }

      const videoId = parsedUrl.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (parsedUrl.hostname.includes('youtu.be')) {
      const videoId = parsedUrl.pathname.replace('/', '');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
  } catch (e) {
    return url;
  }

  return url;
};

export const getYouTubeVideoId = (url) => {
  if (!url) return '';

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes('youtube.com')) {
      const shortsMatch = parsedUrl.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch?.[1]) return shortsMatch[1];

      const embedMatch = parsedUrl.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch?.[1]) return embedMatch[1];

      return parsedUrl.searchParams.get('v') || '';
    }

    if (parsedUrl.hostname.includes('youtu.be')) {
      return parsedUrl.pathname.replace('/', '');
    }
  } catch (e) {
    return '';
  }

  return '';
};

export const getYouTubeThumbnailUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
};

/**
 * Checks if a URL is a Google Drive link
 */
export const isGoogleDriveUrl = (url) => {
  return url && url.includes('drive.google.com');
};

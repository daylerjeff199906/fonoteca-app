export const getDriveThumbnailUrl = (url: string) => {
  if (!url) return null;
  const match = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|open\?id%3D)|docs\.google\.com\/.*?srcid=)([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
  }
  return null;
};

export const getDriveEmbedUrl = (url: string) => {
  if (!url) return null;
  const match = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|open\?id%3D)|docs\.google\.com\/.*?srcid=)([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return null;
};

export const getOptimizedMediaUrl = (url: string, isAudio: boolean = false): string => {
  if (!url) return "";
  const driveThumb = getDriveThumbnailUrl(url);
  if (driveThumb && !isAudio) return driveThumb;

  if (url.includes('/original/')) {
    if (isAudio) {
      const ext = url.split('.').pop();
      if (ext && ['wav', 'flac', 'm4a', 'mp3'].includes(ext.toLowerCase())) {
        return url.replace('/original/', '/variants/').replace(new RegExp(`\\.${ext}$`, 'i'), '_processed.ogg');
      }
    } else {
      return url.replace('/original/', '/variants/original_q80.webp');
    }
  }

  return url;
};

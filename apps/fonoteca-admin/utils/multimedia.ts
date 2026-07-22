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

  // Las URLs de Files API pueden estar prefirmadas. Alterar el path, el
  // nombre o los parámetros invalida la firma; la variante debe venir ya
  // resuelta desde la respuesta de carga o desde la API de multimedia.
  void isAudio;
  return url;
};

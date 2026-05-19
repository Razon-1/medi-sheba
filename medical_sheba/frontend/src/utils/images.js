const API_ORIGIN = 'http://localhost:8000';

export function resolveImageUrl(imageUrl, fallbackUrl) {
  if (!imageUrl) return fallbackUrl;

  if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return `${API_ORIGIN}${imageUrl}`;
  }

  return imageUrl;
}

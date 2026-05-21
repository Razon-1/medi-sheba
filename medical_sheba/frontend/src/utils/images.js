const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || (
  /^https?:\/\//i.test(API_BASE_URL) ? new URL(API_BASE_URL).origin : ''
);

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

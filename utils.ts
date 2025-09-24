import { MediaItem } from './types';

export const API_BASE_URL = 'http://127.0.0.1:5000';

// A simple SVG placeholder for missing images, matching the app's slate color scheme.
const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=';

/**
 * Constructs a URL to fetch an image through the local backend proxy.
 * This is necessary to bypass Instagram's CORS policy which prevents hotlinking.
 * @param imageUrl The original Instagram image URL.
 * @returns The proxied image URL, or a placeholder if the original URL is invalid.
 */
export const getProxyImageUrl = (imageUrl: string | undefined): string => {
    // Validate that the imageUrl is a non-empty string.
    if (!imageUrl || typeof imageUrl !== 'string') {
        return placeholderImage;
    }
    
    // Decode HTML entities (like &amp;) which can break URLs with query params.
    const decodedUrl = imageUrl.replace(/&amp;/g, '&');

    // If after decoding, the URL is empty, return placeholder.
    if (!decodedUrl) {
        return placeholderImage;
    }
    
    // Construct the URL for the local backend image proxy endpoint.
    return `${API_BASE_URL}/api/proxy-image?url=${encodeURIComponent(decodedUrl)}`;
};

/**
 * Extracts an image URL from a MediaItem based on desired quality.
 * @param item The media item from the post.
 * @param quality The desired quality: 'thumbnail' for a medium-sized image, 'full' for the highest resolution.
 * @returns The best available image URL for the requested quality.
 */
export const getBestImageUrl = (item: MediaItem | undefined, quality: 'thumbnail' | 'full' = 'full'): string | undefined => {
    if (!item) {
        return undefined;
    }

    if (item.resources && item.resources.length > 0) {
        if (quality === 'thumbnail') {
            // For thumbnails, find a medium-sized image to balance quality and load speed.
            // We target an image with at least 480px width.
            const idealThumbnail = item.resources.find(res => res.width >= 480);
            if (idealThumbnail) {
                return idealThumbnail.src;
            }
        }

        // For 'full' quality, or as a fallback for 'thumbnail' if no medium image is found,
        // return the last resource, which is assumed to be the highest resolution.
        const lastResource = item.resources[item.resources.length - 1];
        if (lastResource && lastResource.src) {
            return lastResource.src;
        }
    }
    
    // Fallback to the display_url if resources array is empty or missing.
    return item.display_url;
};

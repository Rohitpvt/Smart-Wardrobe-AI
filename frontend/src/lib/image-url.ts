const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in the environment variables.");
}

/**
 * Constructs a fully qualified image URL for the backend API.
 * The backend handles authentication via HttpOnly cookies.
 */
export function getImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;

  // Handle absolute URLs (e.g., S3, Cloudinary)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Handle frontend-bundled static demo images
  if (path.startsWith("/test/") || path.startsWith("test/")) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return cleanPath; // Frontend will resolve this relative to its origin
  }

  // Ensure consistent slash handling for backend uploads
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${apiUrl}/${cleanPath}`;
}

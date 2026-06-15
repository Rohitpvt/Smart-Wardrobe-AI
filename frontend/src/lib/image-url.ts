const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in the environment variables.");
}

/**
 * Constructs a fully qualified image URL for the backend API.
 * The backend handles authentication via HttpOnly cookies.
 */
export function getImageUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;

  // Ensure consistent slash handling
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${apiUrl}/${cleanPath}`;
}

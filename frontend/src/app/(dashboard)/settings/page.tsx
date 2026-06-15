import SettingsClient from "./settings-client";
import { fetchUserProfileServer } from "@/lib/server-api";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings | Wardrobe AI",
};

export default async function SettingsPage() {
  let profileData;
  try {
    profileData = await fetchUserProfileServer();
  } catch (error) {
    // If fetching the profile fails (e.g., unauthenticated), redirect to login
    redirect("/login");
  }

  // Sanitize data
  const initialProfile = {
    first_name: profileData?.first_name || "",
    last_name: profileData?.last_name || "",
    email: profileData?.email || "",
    city: profileData?.city || "",
    country_code: profileData?.country_code || "",
  };

  return <SettingsClient initialProfile={initialProfile} />;
}

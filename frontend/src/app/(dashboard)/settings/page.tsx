"use client"

import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/components/settings/profile-form"
import { PasswordForm } from "@/components/settings/password-form"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"

export default function SettingsProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await api.get("/users/me")
      return res.data
    }
  })

  if (isLoading) {
    return <div>Loading profile...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1 lg:max-w-2xl">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Profile</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This is how others will see you on the site.
              </p>
              {data && <ProfileForm defaultValues={data} />}
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-medium">Security</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Update your password to keep your account secure.
              </p>
              <PasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

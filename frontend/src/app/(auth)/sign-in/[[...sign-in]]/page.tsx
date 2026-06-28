import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto w-full",
            card: "bg-surface shadow-none w-full max-w-md",
            headerTitle: "text-text-primary font-bold text-2xl",
            headerSubtitle: "text-text-secondary",
            formButtonPrimary: "bg-brand-blue hover:bg-brand-blue/90 text-white",
            formFieldInput: "bg-surface-2 border-surface-2 text-text-primary focus:border-brand-blue",
            formFieldLabel: "text-text-secondary",
            dividerLine: "bg-border",
            dividerText: "text-text-secondary",
            socialButtonsBlockButton: "border-border text-text-primary hover:bg-surface-2",
            socialButtonsBlockButtonText: "font-semibold",
            footerActionText: "text-text-secondary",
            footerActionLink: "text-brand-blue hover:text-brand-blue/80"
          }
        }}
      />
    </div>
  );
}

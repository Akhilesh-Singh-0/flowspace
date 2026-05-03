import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-primary text-primary-foreground hover:bg-primary/90",
            card: "bg-card text-card-foreground border border-border shadow-sm",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: 
              "bg-background border-border text-foreground hover:bg-muted",
            socialButtonsBlockButtonText: "text-foreground font-medium",
            formFieldLabel: "text-foreground",
            formFieldInput: 
              "bg-background border-border text-foreground focus:ring-ring",
            footerActionLink: "text-primary hover:text-primary/90",
            identityPreviewText: "text-foreground",
            identityPreviewEditButton: "text-primary hover:text-primary/90",
          },
        }}
      />
    </div>
  );
}

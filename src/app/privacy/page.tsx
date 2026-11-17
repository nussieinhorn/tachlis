import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Motive collects, how it is used, who handles it and the choices you have over your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 sm:px-6 py-14">
        <h1 className="type-title">Privacy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}. Plain-language draft.</p>
        <section className="flex flex-col gap-2">
          <h2 className="type-subsection">What we collect</h2>
          <p className="text-foreground/80 leading-relaxed">
            Your name and email when you sign in, optional phone number, the location you give for issues, and the
            issues, solutions, votes, comments and support you add. If you offer to help on an issue, the contact details
            you enter are shared with that issue&apos;s organizers.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="type-subsection">How we use it</h2>
          <p className="text-foreground/80 leading-relaxed">
            To run the site, sign you in with a one-time code, show public issues, and send notifications and emails you
            ask for. We do not sell your information.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="type-subsection">Who handles it</h2>
          <p className="text-foreground/80 leading-relaxed">
            We use trusted services to run Motive, including Supabase for data and sign-in, Vercel for hosting and Resend
            for email. Your approximate location is used in your browser to show nearby issues if you allow it.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="type-subsection">Your choices</h2>
          <p className="text-foreground/80 leading-relaxed">
            You can edit your details or delete your account from your profile. Private issues are visible only to people
            you approve.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="type-subsection">Contact</h2>
          <p className="text-foreground/80 leading-relaxed">
            Privacy questions? Email <a className="font-semibold underline decoration-primary underline-offset-4" href="mailto:admin@tachlis.org">admin@tachlis.org</a>.
          </p>
        </section>
      </main>
    </>
  );
}

import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Terms of use · MOTIVE" };

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-14">
        <h1 className="text-4xl font-black sm:text-5xl">Terms of use</h1>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}. Plain-language draft.</p>
        <section className="flex flex-col gap-2">
          <h2 className="text-xl">Using MOTIVE</h2>
          <p className="text-foreground/80 leading-relaxed">
            MOTIVE is a place to raise community problems, propose solutions, vote and track action. By using it you
            agree to use it honestly and respectfully.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-xl">What you post</h2>
          <p className="text-foreground/80 leading-relaxed">
            You are responsible for what you post. Do not post anything unlawful, threatening, harassing, or that shares
            another person&apos;s private information. Public posts can be seen by anyone. We may remove content that
            breaks these rules.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-xl">Accounts</h2>
          <p className="text-foreground/80 leading-relaxed">
            You sign in with your email. Keep access to your email secure, and tell us if you think someone else is
            using your account.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-xl">No guarantees</h2>
          <p className="text-foreground/80 leading-relaxed">
            MOTIVE is provided as is. Issues and solutions are posted by community members and are not verified or
            endorsed by us. We are not liable for decisions made based on content here.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-xl">Contact</h2>
          <p className="text-foreground/80 leading-relaxed">
            Questions about these terms? Email <a className="font-semibold underline decoration-primary underline-offset-4" href="mailto:admin@tachlis.org">admin@tachlis.org</a>.
          </p>
        </section>
      </main>
    </>
  );
}

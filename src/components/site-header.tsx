"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconHome,
  IconLogin,
  IconLogout,
  IconMenu2,
  IconPlus,
  IconSearch,
  IconSettings,
  IconUserCircle,
  IconUserCog,
  IconUsersGroup,
  IconList,
  IconFileText,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { MotiveLogo } from "@/components/motive-logo";
import { SearchDialog } from "@/components/search-dialog";
import { Icon } from "@/components/ui/icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreateIssueDialog } from "@/components/issue/create-issue-dialog";
import { InboxDropdown } from "@/components/inbox-dropdown";
import { AuthGate } from "@/components/auth-gate";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

/** Small round icon chip used in the account menu rows. */
function MenuIcon({ icon }: { icon: typeof IconHome }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
      <Icon icon={icon} size={15} />
    </span>
  );
}

function SignInDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>
        <Button variant="outline" size="sm">
          Sign in
        </Button>
      </span>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">Sign in</DialogTitle>
        </DialogHeader>
        <AuthGate
          onSignedIn={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

/** Phone menu: a bottom drawer with every place you can go, plus sign in / sign out. */
function MobileMenu({
  signedIn,
  name,
  isSuperAdmin,
  onSignOut,
}: {
  signedIn: boolean;
  name?: string;
  isSuperAdmin: boolean;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "auth">("menu");
  const router = useRouter();

  const row = (href: string, label: string, icon: typeof IconHome) => (
    <Link
      key={href}
      href={href}
      onClick={() => setOpen(false)}
      className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-base font-semibold text-foreground active:bg-muted"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-muted">
        <Icon icon={icon} size={18} />
      </span>
      {label}
    </Link>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setView("menu");
      }}
    >
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {signedIn ? (
          <Avatar>
            <AvatarFallback>
              <Icon icon={IconUserCircle} size={22} />
            </AvatarFallback>
          </Avatar>
        ) : (
          <span className="flex size-9 items-center justify-center rounded-full border border-border bg-card shadow-sm">
            <Icon icon={IconMenu2} size={18} />
          </span>
        )}
      </button>
      <DialogContent className="gap-2 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className={view === "auth" ? "sr-only" : undefined}>{signedIn ? name || "Menu" : "Menu"}</DialogTitle>
        </DialogHeader>
        {view === "auth" ? (
          <AuthGate
            onSignedIn={() => {
              setOpen(false);
              setView("menu");
              router.refresh();
            }}
          />
        ) : (
          <nav className="flex flex-col">
            {row("/", signedIn ? "Dashboard" : "Home", IconHome)}
            {row("/issues", "Issues", IconFileText)}
            {row("/communities", "Communities", IconUsersGroup)}
            {signedIn && (
              <>
                <div className="my-1 h-px bg-border" />
                {row("/my-issues", "My issues", IconList)}
                {row("/my-communities", "My communities", IconUsersGroup)}
                {row("/profile", "Profile", IconUserCog)}
                {isSuperAdmin && row("/settings", "Settings", IconSettings)}
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSignOut();
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-left text-base font-semibold text-foreground active:bg-muted"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-muted">
                    <Icon icon={IconLogout} size={18} />
                  </span>
                  Sign out
                </button>
              </>
            )}
            {!signedIn && (
              <Button size="lg" className="mt-3 h-12 w-full text-base" onClick={() => setView("auth")}>
                <Icon icon={IconLogin} size={18} />
                Sign in
              </Button>
            )}
          </nav>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SiteHeader() {
  const { isSignedIn, profile, signOut } = useAuth();
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    const supabase = createClient();
    supabase.rpc("is_super_admin").then(({ data }) => setIsSuperAdmin(Boolean(data)));
  }, [isSignedIn]);

  async function handleSignOut() {
    await signOut();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link href="/" aria-label="motive home" className="justify-self-start">
            <MotiveLogo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            <Link
              href="/issues"
              className="rounded-lg px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"
            >
              Issues
            </Link>
            <Link
              href="/communities"
              className="rounded-lg px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"
            >
              Communities
            </Link>
            <SearchDialog
              trigger={
                <button
                  type="button"
                  aria-label="Search everything"
                  title="Search (Ctrl/Cmd+K)"
                  className="flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                >
                  <Icon icon={IconSearch} size={18} />
                </button>
              }
            />
          </nav>

          <div className="col-start-3 flex items-center justify-self-end gap-1.5 sm:gap-2">
            <span className="md:hidden">
              <SearchDialog
                trigger={
                  <button
                    type="button"
                    aria-label="Search everything"
                    className="flex size-9 items-center justify-center rounded-lg text-foreground active:bg-muted"
                  >
                    <Icon icon={IconSearch} size={20} />
                  </button>
                }
              />
            </span>

            <CreateIssueDialog
              trigger={
                <Button size="sm" aria-label="Create issue" className="max-md:size-9 max-md:px-0">
                  <Icon icon={IconPlus} />
                  <span className="hidden md:inline">Create Issue</span>
                </Button>
              }
            />

            {!isSignedIn ? (
              <>
                <span className="hidden md:block">
                  <SignInDialog />
                </span>
                <span className="md:hidden">
                  <MobileMenu signedIn={false} isSuperAdmin={false} onSignOut={handleSignOut} />
                </span>
              </>
            ) : (
              <>
                <InboxDropdown />
                <span className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                        <Avatar>
                          <AvatarFallback>
                            <Icon icon={IconUserCircle} size={22} />
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <Avatar>
                          <AvatarFallback>
                            <Icon icon={IconUserCircle} size={22} />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-extrabold">{profile?.name || "Your account"}</span>
                          {profile?.email && <span className="truncate text-xs text-muted-foreground">{profile.email}</span>}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/my-issues">
                          <MenuIcon icon={IconList} />
                          My issues
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-communities">
                          <MenuIcon icon={IconUsersGroup} />
                          My communities
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <MenuIcon icon={IconUserCog} />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      {isSuperAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/settings">
                            <MenuIcon icon={IconSettings} />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <MenuIcon icon={IconLogout} />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
                <span className="md:hidden">
                  <MobileMenu
                    signedIn
                    name={profile?.name || profile?.email}
                    isSuperAdmin={isSuperAdmin}
                    onSignOut={handleSignOut}
                  />
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

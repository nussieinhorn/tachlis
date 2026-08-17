"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconPlus, IconUserCircle, IconLogout, IconCircleCheck, IconList, IconUsersGroup, IconSettings, IconUserCog } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchCombobox } from "@/components/search-combobox";
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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-heading text-xl font-bold text-foreground">
            Tachlis
          </Link>

          <div className="hidden sm:block">
            <SearchCombobox />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <CreateIssueDialog
              trigger={
                <Button size="sm">
                  <Icon icon={IconPlus} />
                  Create Issue
                </Button>
              }
            />

            {!isSignedIn ? (
              <SignInDialog />
            ) : (
              <>
              <InboxDropdown />
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
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="truncate">{profile?.name || profile?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-issues">
                      <Icon icon={IconList} size={16} />
                      My issues
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-communities">
                      <Icon icon={IconUsersGroup} size={16} />
                      My Communities
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/solved">
                      <Icon icon={IconCircleCheck} size={16} />
                      Solved
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Icon icon={IconUserCog} size={16} />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {isSuperAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Icon icon={IconSettings} size={16} />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <Icon icon={IconLogout} size={16} />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

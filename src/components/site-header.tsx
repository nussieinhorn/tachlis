"use client";

import Link from "next/link";
import { IconPlus, IconUserCircle, IconShieldCog, IconUser, IconCircleCheck, IconList, IconUsersGroup } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchCombobox } from "@/components/search-combobox";
import { CreateIssueDialog } from "@/components/issue/create-issue-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminMode } from "@/lib/admin-mode";

export function SiteHeader() {
  const { isAdmin, setIsAdmin } = useAdminMode();

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
            {isAdmin && (
              <span className="hidden rounded-full bg-status-action/15 px-2.5 py-1 text-xs font-medium text-status-action sm:inline">
                Admin mode
              </span>
            )}
            <CreateIssueDialog
              trigger={
                <Button size="sm">
                  <Icon icon={IconPlus} />
                  Create Issue
                </Button>
              }
            />

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
                <DropdownMenuLabel>Prototype account</DropdownMenuLabel>
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
                <DropdownMenuItem onClick={() => setIsAdmin(false)}>
                  <Icon icon={IconUser} size={16} />
                  View as user
                  {!isAdmin && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAdmin(true)}>
                  <Icon icon={IconShieldCog} size={16} />
                  Log in as admin
                  {isAdmin && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

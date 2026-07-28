"use client";

import Link from "next/link";
import { IconSearch, IconPlus, IconUserCircle, IconShieldCog, IconUser } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

          <div className="mx-auto hidden w-full max-w-md sm:block">
            <div className="relative">
              <Icon
                icon={IconSearch}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              />
              <Input placeholder="Search issues..." className="pl-9 text-center" />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {isAdmin && (
              <span className="hidden rounded-full bg-status-action/15 px-2.5 py-1 text-xs font-medium text-status-action sm:inline">
                Admin mode
              </span>
            )}
            <Button asChild variant="ghost" size="sm">
              <Link href="/solved">View Solved</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/issues/new">
                <Icon icon={IconPlus} />
                Create Issue
              </Link>
            </Button>

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

"use client";

import { ChevronsLeftRight, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { federatedLogout } from "@/app/actions";

export const UserItem = () => {
  const router = useRouter();
  const session = useSession();

  if (session.status !== "authenticated") {
    return <Skeleton className="h-4 w-7" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          className="flex items-center text-sm p-3 w-full hover:bg-primary/5"
        >
          <div className="gap-x-2 flex items-center max-w-[150px]">
            <Avatar className="h-5 w-5 rounded-sm">
              <AvatarImage
                className="rounded-sm"
                src={session.data.user.image || undefined}
                alt="@shadcn"
              />
              <AvatarFallback className="rounded-sm">
                <User className="text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <span className="text-start font-medium line-clamp-1">
              {session.data.user.name}&apos;s NoteXpress
            </span>
          </div>
          <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80"
        align="start"
        alignOffset={11}
        forceMount
      >
        <div className="flex flex-col space-y-4 p-2">
          <p className="text-xs font-medium leading-none text-muted-foreground">
            {session.data.user.email}
          </p>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-secondary p-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={session.data.user.image || undefined} alt="@shadcn" />
                <AvatarFallback>
                  <User className="text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-1">
              <p className="text-sm line-clamp-1">
                {session.data.user.name}&apos;s NoteXpress
              </p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="w-full cursor-pointer text-muted-foreground"
        >
          <Button
            onClick={async () => {
              const logoutUrl = await federatedLogout(session.data);
              await signOut({ callbackUrl: "/", redirect: false });
              router.push(logoutUrl || "/");
            }}
            variant="ghost"
            size="sm"
            className="justify-start h-7"
          >
            <p className="text-xs">Log out</p>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

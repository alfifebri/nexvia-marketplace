"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types";

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const mounted = useMounted();
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (mounted && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, user, pathname, router]);

  if (!mounted) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-4 w-72" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <ShieldAlert className="size-6" />
        </span>
        <h1 className="mt-5 text-xl font-semibold">Sign in required</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Taking you to the sign-in page so you can continue where you left off.
        </p>
        <Button asChild className="mt-5">
          <Link href={`/login?next=${encodeURIComponent(pathname)}`}>Go to sign in</Link>
        </Button>
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <ShieldAlert className="size-6" />
        </span>
        <h1 className="mt-5 text-xl font-semibold">This workspace isn&apos;t yours</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          You&apos;re signed in as a {user.role}. This area is reserved for {roles.join(" and ")} accounts.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href={user.role === "vendor" ? "/vendor" : user.role === "admin" ? "/admin" : "/account"}>
              Go to my workspace
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to store</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

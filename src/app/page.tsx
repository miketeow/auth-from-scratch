import Link from "next/link";

import { getCurrentUser } from "@/auth/current-user";
import LogOutButton from "@/auth/nextjs/log-out-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const fullUser = await getCurrentUser({ withFullUser: true });
  return (
    <div className="container mx-auto px-4">
      {fullUser == null ? (
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      ) : (
        <Card className="mt-4 max-w-[500px]">
          <CardHeader>
            <CardTitle>User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Username: {fullUser.name}</div>
            <div>Role: {fullUser.role}</div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/private-page">Private Page</Link>
            </Button>
            {fullUser.role == "admin" && (
              <Button asChild variant="outline">
                <Link href="/private-page">Admin Page</Link>
              </Button>
            )}
            <LogOutButton />
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

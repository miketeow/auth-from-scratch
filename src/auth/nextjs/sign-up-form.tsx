"use client";

import Link from "next/link";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { oAuthSignIn, signUp } from "../actions";
import { signUpSchema } from "../schema";

export function SignUpForm() {
  const [error, setError] = useState<string>();
  const form = useForm<z.infer<typeof signUpSchema>>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    const error = await signUp(data);
    setError(error);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && <p className="text-destructive">{error}</p>}
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={async () => await oAuthSignIn("discord")}
          >
            Discord
          </Button>
          <Button
            type="button"
            onClick={async () => await oAuthSignIn("github")}
          >
            GitHub
          </Button>
        </div>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button asChild variant="link">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button type="submit">Sign Up</Button>
        </div>
      </form>
    </Form>
  );
}

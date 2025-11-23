"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: "read:user user:email read:org repo",
      },
    });
  };

  return (
    <Button className="w-full" onClick={handleLogin}>
      <Github className="mr-2 h-4 w-4" />
      Sign in with GitHub
    </Button>
  );
}

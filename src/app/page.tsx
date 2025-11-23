import { createClient } from "@/lib/supabase/server";
import { RepoList } from "@/components/repo-list";
import { RepoSelector } from "@/components/repo-selector";
import { UserNav } from "@/components/user-nav";
import { LoginButton } from "@/components/login-button";

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              GitHub Actions Monitor
            </h1>
            <p className="text-sm text-muted-foreground">
              Login to monitor your repository workflows
            </p>
          </div>
          <LoginButton />
        </div>
      </div>
    );
  }

  const user = {
    name: session.user.user_metadata.full_name || session.user.user_metadata.name,
    email: session.user.email,
    image: session.user.user_metadata.avatar_url,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center px-4 container mx-auto">
          <h2 className="text-lg font-semibold">Actions Monitor</h2>
          <div className="ml-auto flex items-center space-x-4">
            <RepoSelector />
            <UserNav user={user} />
          </div>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6 container mx-auto">
        <RepoList />
      </main>
    </div>
  );
}

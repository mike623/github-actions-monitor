import { getMonitoredRepos } from "@/lib/actions";
import { RepoCard } from "./repo-card";

export async function RepoList() {
  const repos = await getMonitoredRepos();

  if (repos.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No repositories monitored yet. Add one to get started!
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {repos.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  );
}

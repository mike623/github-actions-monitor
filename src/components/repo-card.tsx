"use client";

import * as React from "react";
import { Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { removeRepo, getWorkflowRuns } from "@/lib/actions";

interface RepoCardProps {
  repo: {
    id: string;
    owner: string;
    name: string;
    fullName: string;
  };
}

export function RepoCard({ repo }: RepoCardProps) {
  const [runs, setRuns] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const fetchRuns = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWorkflowRuns(repo.owner, repo.name);
      setRuns(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [repo.owner, repo.name]);

  React.useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 60000); // Poll every 1 minute
    return () => clearInterval(interval);
  }, [fetchRuns]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to stop monitoring this repo?")) return;
    setDeleting(true);
    try {
      await removeRepo(repo.id);
    } catch (error) {
      console.error(error);
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium truncate pr-2">
          {repo.fullName}
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={fetchRuns} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {runs.length === 0 && !loading && (
            <p className="text-xs text-muted-foreground">No workflow runs found.</p>
          )}
          {runs.map((run) => (
            <div key={run.id} className="flex items-center justify-between text-sm py-1">
              <div className="flex flex-col gap-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <StatusBadge status={run.conclusion || run.status} />
                  <span className="truncate font-medium">{run.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
                  <span className="truncate max-w-[150px] bg-muted px-1.5 py-0.5 rounded">
                    {run.head_branch}
                  </span>
                  <span>•</span>
                  <span>{new Date(run.created_at).toLocaleString()}</span>
                </div>
              </div>
              <a
                href={run.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground ml-2"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color = "bg-slate-500";
  if (status === "success") color = "bg-green-500";
  if (status === "failure") color = "bg-red-500";
  if (status === "in_progress" || status === "queued") color = "bg-yellow-500";

  return (
    <span className={`h-2 w-2 rounded-full ${color} shrink-0`} title={status} />
  );
}

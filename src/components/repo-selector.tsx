"use client";

import * as React from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchRepos, saveRepo } from "@/lib/actions";
// Actually I should install toast. I'll use simple alert or console for now to avoid context switching, or just handle errors gracefully.

export function RepoSelector() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const items = await searchRepos(query);
      setResults(items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (repo: any) => {
    setSaving(repo.full_name);
    try {
      await saveRepo(repo.owner.login, repo.name);
      setOpen(false);
      setQuery("");
      setResults([]);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Repository
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Repository</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search repositories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {results.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium truncate">{repo.full_name}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {repo.description}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={saving === repo.full_name}
                  onClick={() => handleSave(repo)}
                >
                  {saving === repo.full_name ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
            ))}
            {results.length === 0 && !loading && query && (
              <p className="text-center text-sm text-muted-foreground">
                No repositories found.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

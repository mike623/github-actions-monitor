"use client";

import * as React from "react";
import { Search, Plus, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchRepos, saveRepo, getUserRepos, getUserOrgs, getOrgRepos } from "@/lib/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RepoSelector() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [orgs, setOrgs] = React.useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = React.useState<string>("personal");

  // Fetch user repos and orgs on open
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([getUserRepos(), getUserOrgs()])
        .then(([repos, organizations]) => {
          if (!query && selectedOrg === "personal") {
            setResults(repos);
          }
          setOrgs(organizations);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Handle Org change
  React.useEffect(() => {
    if (!open) return;

    setQuery(""); // Clear search when switching context
    setLoading(true);

    const fetcher = selectedOrg === "personal"
      ? getUserRepos()
      : getOrgRepos(selectedOrg);

    fetcher
      .then((items) => setResults(items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedOrg, open]);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 3) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
      setSelectedOrg("personal");
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
          <div className="flex gap-2">
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                {orgs.map((org) => (
                  <SelectItem key={org.id} value={org.login}>
                    {org.login}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button type="submit" disabled={loading} size="icon">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {results.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium truncate flex items-center gap-2">
                    {repo.full_name}
                    {repo.private && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </span>
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
            {results.length === 0 && !loading && (
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

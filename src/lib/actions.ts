"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { monitoredRepos, profiles } from "@/lib/db/schema";
import { getGithubClient } from "@/lib/github";
import { and, eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

async function ensureProfile(user: any) {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!existing) {
    await db.insert(profiles).values({
      id: user.id,
      email: user.email,
      name: user.user_metadata.full_name || user.user_metadata.name,
      avatarUrl: user.user_metadata.avatar_url,
    });
  }
}

export async function saveRepo(owner: string, name: string) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await ensureProfile(session.user);

  const fullName = `${owner}/${name}`;

  // Check if already exists
  const existing = await db.query.monitoredRepos.findFirst({
    where: and(
      eq(monitoredRepos.userId, session.user.id),
      eq(monitoredRepos.fullName, fullName)
    ),
  });

  if (existing) {
    return { success: true, message: "Repo already monitored" };
  }

  await db.insert(monitoredRepos).values({
    userId: session.user.id,
    owner,
    name,
    fullName,
  });

  revalidatePath("/");
  return { success: true };
}

export async function removeRepo(repoId: string) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db.delete(monitoredRepos).where(
    and(
      eq(monitoredRepos.id, repoId),
      eq(monitoredRepos.userId, session.user.id)
    )
  );

  revalidatePath("/");
  return { success: true };
}

export async function getMonitoredRepos() {
  const session = await getSession();
  if (!session?.user) return [];

  return db.query.monitoredRepos.findMany({
    where: eq(monitoredRepos.userId, session.user.id),
    orderBy: desc(monitoredRepos.createdAt),
  });
}

export async function getWorkflowRuns(owner: string, name: string) {
  const session = await getSession();
  if (!session?.user) return [];

  const token = session.provider_token;
  if (!token) return [];

  const fullName = `${owner}/${name}`;
  
  // 1. Check DB cache
  const repo = await db.query.monitoredRepos.findFirst({
    where: and(
      eq(monitoredRepos.userId, session.user.id),
      eq(monitoredRepos.fullName, fullName)
    ),
  });

  if (!repo) return [];

  const now = new Date();
  const lastChecked = repo.lastCheckedAt;
  const isFresh = lastChecked && (now.getTime() - lastChecked.getTime() < 60000); // 1 minute cache

  // 2. Return cache if fresh
  if (isFresh && repo.workflowRunsCache) {
    return JSON.parse(repo.workflowRunsCache);
  }

  const octokit = getGithubClient(token);

  try {
    // 3. Conditional Request
    const headers: any = {};
    if (repo.etag) {
      headers["If-None-Match"] = repo.etag;
    }

    const response = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo: name,
      per_page: 5,
      headers,
    });

    // 4. Update Cache on 200 OK
    const runs = response.data.workflow_runs;
    await db.update(monitoredRepos)
      .set({
        lastCheckedAt: now,
        etag: response.headers.etag,
        workflowRunsCache: JSON.stringify(runs),
      })
      .where(eq(monitoredRepos.id, repo.id));

    return runs;

  } catch (error: any) {
    // 5. Handle 304 Not Modified
    if (error.status === 304) {
      // Update last checked to reset the timer
      await db.update(monitoredRepos)
        .set({ lastCheckedAt: now })
        .where(eq(monitoredRepos.id, repo.id));
      
      return repo.workflowRunsCache ? JSON.parse(repo.workflowRunsCache) : [];
    }
    
    console.error(`Error fetching workflows for ${owner}/${name}:`, error);
    return [];
  }
}

export async function searchRepos(query: string) {
  const session = await getSession();
  if (!session?.user) return [];

  const token = session.provider_token;
  if (!token) return [];

  const octokit = getGithubClient(token);

  try {
    const { data } = await octokit.search.repos({
      q: query,
      per_page: 10,
    });
    return data.items;
  } catch (error) {
    console.error("Error searching repos:", error);
    return [];
  }
}

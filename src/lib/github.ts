import { Octokit } from "@octokit/rest";

export const getGithubClient = (accessToken: string) => {
  return new Octokit({
    auth: accessToken,
  });
};

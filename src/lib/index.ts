/**
 * Retrieves a custom Github profile of the account
 * @param id - Username of the account
 */
export async function GetDevProfile(id: string) {
  const headers = {
    Authorization: `Bearer ${process.env.GH_API_KEY}`,
  };

  const ossContribQuery = `
{
  user(login: "${id}") {
    repositoriesContributedTo(first: 100, privacy: PUBLIC) {
      edges {
        node {
          nameWithOwner
          url
          stargazerCount
          forkCount
        }
      }
    }
  }
}
`;

  const [userResponse, ossContribRes] = await Promise.all([
    fetch(`https://api.github.com/users/${id}`, { headers }),
    fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({ query: ossContribQuery }),
    }),
  ]);

  if (userResponse.status === 404) return null;

  const ghUserInfo = (await userResponse.json()) as GhUserInfo;

  const ossContrib = (await ossContribRes.json()) as OssContribRes;

  const firstYearOnGh = new Date(ghUserInfo.created_at).getFullYear();

  const currentYear = new Date().getFullYear();

  return {
    ghUserInfo,
    ossContrib: ossContrib.data.user.repositoriesContributedTo.edges.map(
      (repo) => repo,
    ),
    yearsOnGithub: new Array<number>(currentYear - firstYearOnGh + 1) // Include first year in count
      .fill(firstYearOnGh - 1) // Start all indexes with one year before the first year
      .map((year, index) => year + index + 1) // Account for 0 index
      .reverse(),
  };
}

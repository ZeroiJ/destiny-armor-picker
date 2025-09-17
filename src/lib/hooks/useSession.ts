import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export type MeResponse = {
  loggedIn: boolean;
  bungieNetUser: any | null;
  membershipId: string | null;
  membershipType: number | null;
  expiresAt: number | null;
};

export function useSession() {
  const { data, error, isLoading, mutate } = useSWR<MeResponse>("/api/me", fetcher);
  return { session: data, error, isLoading, mutate };
}
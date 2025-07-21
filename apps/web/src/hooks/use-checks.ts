"use client";

import { client } from "@/lib/rpc";
import type { CheckListItem } from "@/lib/check-utils";
import { useQuery } from "@tanstack/react-query";

export const useChecks = () => {
  return useQuery({
    queryKey: ["checks"],
    queryFn: async (): Promise<CheckListItem[]> => {
      const response = await client.api.agent.checks.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch checks");
      }

      const data = await response.json();

      return data.checks.map((check) => ({
        ...check,
        createdAt: new Date(check.createdAt),
        updatedAt: new Date(check.updatedAt),
        completedAt: check.completedAt ? new Date(check.completedAt) : null,
        textPreview: check.textPreview || null,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

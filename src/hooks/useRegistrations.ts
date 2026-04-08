"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Registration, RegistrationFilters, SortConfig } from "@/types";

interface UseRegistrationsOptions {
  formationId?: string;
  filters?: RegistrationFilters;
  sortConfig?: SortConfig;
}

export function useRegistrations(options: UseRegistrationsOptions = {}) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { formationId, filters, sortConfig } = options;

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from("registrations")
        .select("*, formation:formations(*)");

      // Filter by formation if specified
      if (formationId) {
        query = query.eq("formation_id", formationId);
      }

      // Apply filters
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.mode && filters.mode !== "all") {
        query = query.eq("mode_choisi", filters.mode);
      }
      if (filters?.isPreregistration !== undefined && filters.isPreregistration !== "all") {
        query = query.eq("is_preregistration", filters.isPreregistration);
      }

      // Apply sorting
      const sortKey = sortConfig?.key || "created_at";
      const sortDir = sortConfig?.direction || "desc";
      query = query.order(sortKey, { ascending: sortDir === "asc" });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Apply text search filter on client side
      let filteredData = data || [];
      if (filters?.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        filteredData = filteredData.filter(
          (r) =>
            r.nom.toLowerCase().includes(search) ||
            r.prenom.toLowerCase().includes(search) ||
            r.email.toLowerCase().includes(search) ||
            r.telephone.includes(search) ||
            (r.entreprise && r.entreprise.toLowerCase().includes(search))
        );
      }

      setRegistrations(filteredData as Registration[]);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError("Erreur lors du chargement des inscriptions");
    } finally {
      setIsLoading(false);
    }
  }, [formationId, filters, sortConfig]);

  // Initial fetch
  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Real-time subscription
  useEffect(() => {
    const channelName = formationId
      ? `registrations-${formationId}`
      : "registrations-all";

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "registrations",
          ...(formationId && { filter: `formation_id=eq.${formationId}` }),
        },
        () => {
          // Refetch to get updated data with joins
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [formationId, fetchRegistrations]);

  return {
    registrations,
    isLoading,
    error,
    refetch: fetchRegistrations,
  };
}

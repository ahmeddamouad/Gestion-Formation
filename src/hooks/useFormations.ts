"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Formation } from "@/types";

export function useFormations() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch formations
  const fetchFormations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("formations")
        .select("*")
        .eq("is_active", true)
        .order("slug");

      if (fetchError) throw fetchError;

      setFormations(data || []);
    } catch (err) {
      console.error("Error fetching formations:", err);
      setError("Erreur lors du chargement des formations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchFormations();
  }, [fetchFormations]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("formations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "formations",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setFormations((prev) =>
              prev.map((f) =>
                f.id === payload.new.id ? (payload.new as Formation) : f
              )
            );
          } else if (payload.eventType === "INSERT") {
            const newFormation = payload.new as Formation;
            if (newFormation.is_active) {
              setFormations((prev) => [...prev, newFormation]);
            }
          } else if (payload.eventType === "DELETE") {
            setFormations((prev) =>
              prev.filter((f) => f.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Get available spots for a formation
  const getAvailableSpots = (formation: Formation): number => {
    return Math.max(0, formation.max_attendees - formation.current_attendees);
  };

  // Check if formation is full
  const isFull = (formation: Formation): boolean => {
    return formation.current_attendees >= formation.max_attendees;
  };

  return {
    formations,
    isLoading,
    error,
    refetch: fetchFormations,
    getAvailableSpots,
    isFull,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Notification, NotificationStatus, NotificationType } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatShortDate } from "@/lib/utils/formatters";

interface NotificationHistoryPanelProps {
  formationId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const statusLabels: Record<NotificationStatus, string> = {
  pending: "En attente",
  sent: "Envoye",
  delivered: "Livre",
  read: "Lu",
  failed: "Echec",
  undelivered: "Non livre",
};

const statusVariants: Record<NotificationStatus, "success" | "warning" | "danger" | "neutral" | "info"> = {
  pending: "warning",
  sent: "info",
  delivered: "success",
  read: "success",
  failed: "danger",
  undelivered: "danger",
};

const typeLabels: Record<NotificationType, string> = {
  payment_confirmation: "Confirmation paiement",
  reminder_24h: "Rappel J-1",
  manual: "Manuel",
};

export default function NotificationHistoryPanel({
  formationId,
  isOpen,
  onClose,
}: NotificationHistoryPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    status: NotificationStatus | "all";
    type: NotificationType | "all";
  }>({
    status: "all",
    type: "all",
  });

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (formationId) params.set("formation_id", formationId);
      if (filter.status !== "all") params.set("status", filter.status);
      if (filter.type !== "all") params.set("type", filter.type);

      const response = await fetch(`/api/admin/notifications?${params}`);
      const result = await response.json();

      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [formationId, filter]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleRetry = async (notificationId: string) => {
    setRetryingId(notificationId);
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notification_id: notificationId,
          action: "retry",
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh the list
        await fetchNotifications();
      } else {
        alert(result.message || "Echec du renvoi");
      }
    } catch (error) {
      console.error("Retry error:", error);
      alert("Erreur lors du renvoi");
    } finally {
      setRetryingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-4xl bg-navy-800 border-l border-border animate-slide-in overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-navy-800 border-b border-border p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-text-primary font-display">
                Historique des notifications
              </h2>
              <p className="text-sm text-text-muted">
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-navy-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={filter.status}
                onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value as NotificationStatus | "all" }))}
                className="appearance-none px-4 py-2 pr-8 rounded-lg bg-navy-600 border border-border-light text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="sent">Envoye</option>
                <option value="delivered">Livre</option>
                <option value="read">Lu</option>
                <option value="failed">Echec</option>
                <option value="undelivered">Non livre</option>
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <div className="relative">
              <select
                value={filter.type}
                onChange={(e) => setFilter((prev) => ({ ...prev, type: e.target.value as NotificationType | "all" }))}
                className="appearance-none px-4 py-2 pr-8 rounded-lg bg-navy-600 border border-border-light text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              >
                <option value="all">Tous les types</option>
                <option value="payment_confirmation">Confirmation paiement</option>
                <option value="reminder_24h">Rappel J-1</option>
                <option value="manual">Manuel</option>
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <Button variant="secondary" onClick={fetchNotifications} size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rafraichir
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-navy-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-text-muted mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-text-muted">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-navy-700 rounded-lg border border-border-light p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant={statusVariants[notif.status]} size="sm">
                          {statusLabels[notif.status]}
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          {typeLabels[notif.notification_type]}
                        </Badge>
                        <span className="text-xs text-text-muted">
                          {formatShortDate(notif.created_at)}
                        </span>
                      </div>

                      <p className="text-sm text-text-primary font-medium">
                        {notif.recipient_name || "Inconnu"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {notif.recipient_phone}
                      </p>

                      {notif.formation && (
                        <p className="text-xs text-text-muted mt-1">
                          Formation: {notif.formation.titre}
                        </p>
                      )}

                      {notif.error_message && (
                        <p className="text-xs text-red-400 mt-2">
                          Erreur: {notif.error_message}
                        </p>
                      )}

                      {notif.delivered_at && (
                        <p className="text-xs text-green-400 mt-1">
                          Livre le {formatShortDate(notif.delivered_at)}
                        </p>
                      )}
                    </div>

                    {/* Retry button for failed/undelivered */}
                    {(notif.status === "failed" || notif.status === "undelivered") && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRetry(notif.id)}
                        isLoading={retryingId === notif.id}
                      >
                        Renvoyer
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

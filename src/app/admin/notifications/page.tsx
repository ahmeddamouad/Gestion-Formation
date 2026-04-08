"use client";

import { useState, useEffect, useCallback } from "react";
import { Notification, Formation, Registration, NotificationStatus, NotificationType } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatShortDate, formatPhoneNumber } from "@/lib/utils/formatters";

interface NotificationStats {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  failed: number;
  read: number;
}

interface PendingPayment {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  formation_titre: string;
  created_at: string;
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
  payment_confirmation: "Confirmation",
  reminder_24h: "Rappel J-1",
  manual: "Manuel",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0, pending: 0, sent: 0, delivered: 0, failed: 0, read: 0
  });
  const [formations, setFormations] = useState<Formation[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Filters
  const [filter, setFilter] = useState<{
    status: NotificationStatus | "all";
    type: NotificationType | "all";
    formation_id: string;
  }>({
    status: "all",
    type: "all",
    formation_id: "",
  });

  // Manual send modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [sendType, setSendType] = useState<NotificationType>("reminder_24h");
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Bulk reminder modal
  const [showBulkReminderModal, setShowBulkReminderModal] = useState(false);
  const [selectedFormationForReminder, setSelectedFormationForReminder] = useState<string>("");
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch notifications
      const params = new URLSearchParams();
      if (filter.status !== "all") params.set("status", filter.status);
      if (filter.type !== "all") params.set("type", filter.type);
      if (filter.formation_id) params.set("formation_id", filter.formation_id);
      params.set("limit", "100");

      const [notifRes, formationsRes, registrationsRes] = await Promise.all([
        fetch(`/api/admin/notifications?${params}`),
        fetch("/api/admin/formations"),
        fetch("/api/admin/registrations"),
      ]);

      const [notifData, formationsData, registrationsData] = await Promise.all([
        notifRes.json(),
        formationsRes.json(),
        registrationsRes.json(),
      ]);

      if (notifData.success) {
        setNotifications(notifData.data || []);

        // Calculate stats
        const allNotifs = notifData.data || [];
        setStats({
          total: allNotifs.length,
          pending: allNotifs.filter((n: Notification) => n.status === "pending").length,
          sent: allNotifs.filter((n: Notification) => n.status === "sent").length,
          delivered: allNotifs.filter((n: Notification) => n.status === "delivered").length,
          read: allNotifs.filter((n: Notification) => n.status === "read").length,
          failed: allNotifs.filter((n: Notification) => n.status === "failed" || n.status === "undelivered").length,
        });
      }

      if (formationsData.success) {
        setFormations(formationsData.data || []);
      }

      // Find registrations with pending payment
      if (registrationsData.success) {
        const pending = (registrationsData.data || [])
          .filter((r: Registration) => r.payment_status === "pending" && r.status === "confirmed")
          .map((r: Registration) => ({
            id: r.id,
            prenom: r.prenom,
            nom: r.nom,
            telephone: r.telephone,
            formation_titre: r.formation?.titre || "N/A",
            created_at: r.created_at,
          }));
        setPendingPayments(pending);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Retry failed notification
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
        await fetchData();
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

  // Send bulk reminders for a formation
  const handleSendBulkReminders = async () => {
    if (!selectedFormationForReminder) return;

    setIsSendingBulk(true);
    try {
      // Get all paid registrations for this formation
      const response = await fetch(`/api/admin/registrations?formation_id=${selectedFormationForReminder}`);
      const result = await response.json();

      if (!result.success) {
        alert("Erreur lors du chargement des inscriptions");
        return;
      }

      const paidRegistrations = (result.data || []).filter(
        (r: Registration) => r.payment_status === "paid" && r.status === "confirmed"
      );

      if (paidRegistrations.length === 0) {
        alert("Aucune inscription payee pour cette formation");
        return;
      }

      // Send reminders to all
      let successCount = 0;
      let failCount = 0;

      for (const reg of paidRegistrations) {
        try {
          const sendRes = await fetch("/api/admin/notifications/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              registration_id: reg.id,
              notification_type: "reminder_24h",
            }),
          });
          const sendResult = await sendRes.json();
          if (sendResult.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      alert(`Rappels envoyes: ${successCount} succes, ${failCount} echecs`);
      setShowBulkReminderModal(false);
      setSelectedFormationForReminder("");
      await fetchData();
    } catch (error) {
      console.error("Error sending bulk reminders:", error);
      alert("Erreur lors de l'envoi des rappels");
    } finally {
      setIsSendingBulk(false);
    }
  };

  // Retry all failed
  const handleRetryAllFailed = async () => {
    const failedNotifs = notifications.filter(n => n.status === "failed" || n.status === "undelivered");
    if (failedNotifs.length === 0) {
      alert("Aucune notification en echec");
      return;
    }

    if (!confirm(`Renvoyer ${failedNotifs.length} notification(s) en echec ?`)) return;

    let successCount = 0;
    let failCount = 0;

    for (const notif of failedNotifs) {
      try {
        const res = await fetch("/api/admin/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notification_id: notif.id,
            action: "retry",
          }),
        });
        const result = await res.json();
        if (result.success) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    alert(`Renvois: ${successCount} succes, ${failCount} echecs`);
    await fetchData();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-display">
            Automatisation WhatsApp
          </h1>
          <p className="text-text-muted mt-1">
            Gerez les notifications et rappels WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setShowBulkReminderModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Envoyer rappels
          </Button>
          <Button onClick={fetchData}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Rafraichir
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-navy-700 rounded-xl border border-border-light p-4">
          <p className="text-text-muted text-sm">Total</p>
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
        </div>
        <div className="bg-navy-700 rounded-xl border border-amber-500/30 p-4">
          <p className="text-amber-400 text-sm">En attente</p>
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
        </div>
        <div className="bg-navy-700 rounded-xl border border-blue-500/30 p-4">
          <p className="text-blue-400 text-sm">Envoyes</p>
          <p className="text-2xl font-bold text-blue-400">{stats.sent}</p>
        </div>
        <div className="bg-navy-700 rounded-xl border border-green-500/30 p-4">
          <p className="text-green-400 text-sm">Livres</p>
          <p className="text-2xl font-bold text-green-400">{stats.delivered}</p>
        </div>
        <div className="bg-navy-700 rounded-xl border border-teal-500/30 p-4">
          <p className="text-teal-400 text-sm">Lus</p>
          <p className="text-2xl font-bold text-teal-400">{stats.read}</p>
        </div>
        <div className="bg-navy-700 rounded-xl border border-red-500/30 p-4">
          <p className="text-red-400 text-sm">Echecs</p>
          <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-amber-400 font-medium">
                  {pendingPayments.length} inscription(s) en attente de paiement
                </p>
                <p className="text-sm text-text-muted">
                  Ces inscriptions n&apos;ont pas encore recu de confirmation WhatsApp
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => window.location.href = "/admin/registrations"}>
              Voir les inscriptions
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-navy-700 rounded-xl border border-border-light p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as NotificationStatus | "all" }))}
              className="appearance-none px-4 py-2 pr-10 rounded-lg bg-navy-600 border border-border-light text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="sent">Envoye</option>
              <option value="delivered">Livre</option>
              <option value="read">Lu</option>
              <option value="failed">Echec</option>
              <option value="undelivered">Non livre</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="relative">
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as NotificationType | "all" }))}
              className="appearance-none px-4 py-2 pr-10 rounded-lg bg-navy-600 border border-border-light text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              <option value="all">Tous les types</option>
              <option value="payment_confirmation">Confirmation</option>
              <option value="reminder_24h">Rappel J-1</option>
              <option value="manual">Manuel</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="relative">
            <select
              value={filter.formation_id}
              onChange={(e) => setFilter(prev => ({ ...prev, formation_id: e.target.value }))}
              className="appearance-none px-4 py-2 pr-10 rounded-lg bg-navy-600 border border-border-light text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500/50 min-w-[200px]"
            >
              <option value="">Toutes les formations</option>
              {formations.map(f => (
                <option key={f.id} value={f.id}>{f.titre}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="flex-1" />

          {stats.failed > 0 && (
            <Button variant="danger" size="sm" onClick={handleRetryAllFailed}>
              Renvoyer echecs ({stats.failed})
            </Button>
          )}
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-navy-700 rounded-xl border border-border-light overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-navy-600 rounded-lg mb-3 animate-pulse" />
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Destinataire</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Formation</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Statut</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => (
                  <tr key={notif.id} className="border-b border-border last:border-0 hover:bg-navy-600/50">
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {formatShortDate(notif.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-primary">
                        {notif.recipient_name || "Inconnu"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatPhoneNumber(notif.recipient_phone)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {notif.formation?.titre || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="neutral" size="sm">
                        {typeLabels[notif.notification_type]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <Badge variant={statusVariants[notif.status]} size="sm">
                          {statusLabels[notif.status]}
                        </Badge>
                        {notif.error_message && (
                          <p className="text-xs text-red-400 mt-1 max-w-[200px] truncate" title={notif.error_message}>
                            {notif.error_message}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Reminder Modal */}
      <Modal
        isOpen={showBulkReminderModal}
        onClose={() => {
          setShowBulkReminderModal(false);
          setSelectedFormationForReminder("");
        }}
        title="Envoyer des rappels"
        size="md"
      >
        <div className="p-6">
          <p className="text-text-muted mb-4">
            Envoyez un rappel WhatsApp a tous les participants payes d&apos;une formation.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Formation
            </label>
            <div className="relative">
              <select
                value={selectedFormationForReminder}
                onChange={(e) => setSelectedFormationForReminder(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg bg-navy-600 border border-border-light text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              >
                <option value="">Selectionnez une formation</option>
                {formations.map(f => (
                  <option key={f.id} value={f.id}>{f.titre} - {f.session_date}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6">
            <p className="text-sm text-amber-400">
              Seuls les participants avec un paiement confirme recevront le rappel.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowBulkReminderModal(false);
                setSelectedFormationForReminder("");
              }}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              onClick={handleSendBulkReminders}
              isLoading={isSendingBulk}
              disabled={!selectedFormationForReminder}
              fullWidth
            >
              Envoyer les rappels
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Registration, Formation } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { formatShortDate, formatPhoneNumber } from "@/lib/utils/formatters";

interface RegistrationsPanelProps {
  registrations: Registration[];
  formation: Formation | null;
  isLoading: boolean;
  onClose: () => void;
  onCancel: (id: string) => Promise<void>;
  onExport: () => void;
  onPaymentUpdate?: (id: string, status: "paid" | "pending", sendConfirmation: boolean) => Promise<void>;
  onSendReminder?: (id: string) => Promise<void>;
}

export default function RegistrationsPanel({
  registrations,
  formation,
  isLoading,
  onClose,
  onCancel,
  onExport,
  onPaymentUpdate,
  onSendReminder,
}: RegistrationsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [paymentModalId, setPaymentModalId] = useState<string | null>(null);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  // Filter registrations by search query
  const filteredRegistrations = registrations.filter((reg) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      reg.nom.toLowerCase().includes(search) ||
      reg.prenom.toLowerCase().includes(search) ||
      reg.email.toLowerCase().includes(search) ||
      reg.telephone.includes(search) ||
      (reg.entreprise && reg.entreprise.toLowerCase().includes(search))
    );
  });

  const handleCancelRegistration = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    await onCancel(confirmDeleteId);
    setIsDeleting(false);
    setConfirmDeleteId(null);
  };

  const handlePaymentConfirm = async () => {
    if (!paymentModalId || !onPaymentUpdate) return;
    setIsUpdatingPayment(true);
    await onPaymentUpdate(paymentModalId, "paid", sendWhatsApp);
    setIsUpdatingPayment(false);
    setPaymentModalId(null);
    setSendWhatsApp(true);
  };

  const handleTogglePayment = async (reg: Registration) => {
    if (!onPaymentUpdate) return;

    if (reg.payment_status === "paid") {
      // Un-pay directly without confirmation
      setIsUpdatingPayment(true);
      await onPaymentUpdate(reg.id, "pending", false);
      setIsUpdatingPayment(false);
    } else {
      // Show confirmation modal for new payment
      setPaymentModalId(reg.id);
    }
  };

  const handleSendReminder = async (regId: string) => {
    if (!onSendReminder) return;
    setSendingReminderId(regId);
    await onSendReminder(regId);
    setSendingReminderId(null);
  };

  if (!formation) return null;

  const paymentReg = registrations.find((r) => r.id === paymentModalId);

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-3xl bg-navy-800 border-l border-border animate-slide-in overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-navy-800 border-b border-border p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-text-primary font-display">
                {formation.titre}
              </h2>
              <p className="text-sm text-text-muted">
                {registrations.length} inscription{registrations.length !== 1 ? "s" : ""}
                {onPaymentUpdate && (
                  <span className="ml-2">
                    • {registrations.filter((r) => r.payment_status === "paid").length} payée(s)
                  </span>
                )}
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

          {/* Search and Export */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="secondary" onClick={onExport}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-navy-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted">
                {searchQuery ? "Aucun resultat trouve" : "Aucune inscription"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className={`bg-navy-700 rounded-lg border p-4 ${
                    reg.status === "cancelled"
                      ? "border-red-500/30 opacity-60"
                      : reg.payment_status === "paid"
                      ? "border-green-500/30"
                      : "border-border-light"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-text-primary">
                          {reg.prenom} {reg.nom}
                        </p>
                        {reg.is_preregistration && (
                          <Badge variant="warning" size="sm">
                            Pre-inscription
                          </Badge>
                        )}
                        {reg.status === "cancelled" && (
                          <Badge variant="danger" size="sm">
                            Annule
                          </Badge>
                        )}
                        {reg.status !== "cancelled" && onPaymentUpdate && (
                          <Badge
                            variant={reg.payment_status === "paid" ? "success" : "neutral"}
                            size="sm"
                          >
                            {reg.payment_status === "paid" ? "Paye" : "En attente"}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-text-muted mt-2">
                        <p>
                          <span className="text-text-secondary">Email:</span>{" "}
                          <a href={`mailto:${reg.email}`} className="hover:text-teal-500">
                            {reg.email}
                          </a>
                        </p>
                        <p>
                          <span className="text-text-secondary">Telephone:</span>{" "}
                          <a href={`tel:${reg.telephone}`} className="hover:text-teal-500">
                            {formatPhoneNumber(reg.telephone)}
                          </a>
                        </p>
                        {reg.entreprise && (
                          <p>
                            <span className="text-text-secondary">Entreprise:</span>{" "}
                            {reg.entreprise}
                          </p>
                        )}
                        <p>
                          <span className="text-text-secondary">Mode:</span>{" "}
                          {reg.mode_choisi === "presentiel" ? "Presentiel" : "Visio"}
                        </p>
                        <p>
                          <span className="text-text-secondary">Date:</span>{" "}
                          {formatShortDate(reg.created_at)}
                        </p>
                        {reg.payment_status === "paid" && reg.payment_date && (
                          <p>
                            <span className="text-text-secondary">Paye le:</span>{" "}
                            {formatShortDate(reg.payment_date)}
                          </p>
                        )}
                      </div>
                    </div>
                    {reg.status !== "cancelled" && (
                      <div className="flex items-center gap-2">
                        {/* Payment Toggle */}
                        {onPaymentUpdate && (
                          <button
                            onClick={() => handleTogglePayment(reg)}
                            disabled={isUpdatingPayment}
                            className={`p-2 rounded-lg transition-colors ${
                              reg.payment_status === "paid"
                                ? "text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                : "text-text-muted hover:text-green-400 hover:bg-green-500/10"
                            } disabled:opacity-50`}
                            title={reg.payment_status === "paid" ? "Annuler le paiement" : "Marquer comme paye"}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}

                        {/* Send Reminder */}
                        {onSendReminder && reg.payment_status === "paid" && (
                          <button
                            onClick={() => handleSendReminder(reg.id)}
                            disabled={sendingReminderId === reg.id}
                            className="p-2 rounded-lg text-text-muted hover:text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                            title="Envoyer rappel WhatsApp"
                          >
                            {sendingReminderId === reg.id ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            )}
                          </button>
                        )}

                        {/* Cancel Registration */}
                        <button
                          onClick={() => setConfirmDeleteId(reg.id)}
                          className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Annuler l'inscription"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm delete modal */}
      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Confirmer l'annulation"
        size="sm"
      >
        <div className="p-6">
          <p className="text-text-muted mb-6">
            Etes-vous sur de vouloir annuler cette inscription ? Cette action
            liberera une place dans la formation.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfirmDeleteId(null)}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelRegistration}
              isLoading={isDeleting}
              fullWidth
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment confirmation modal */}
      <Modal
        isOpen={!!paymentModalId}
        onClose={() => {
          setPaymentModalId(null);
          setSendWhatsApp(true);
        }}
        title="Confirmer le paiement"
        size="sm"
      >
        <div className="p-6">
          {paymentReg && (
            <>
              <p className="text-text-muted mb-4">
                Confirmer le paiement pour{" "}
                <span className="text-text-primary font-medium">
                  {paymentReg.prenom} {paymentReg.nom}
                </span>
                ?
              </p>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-navy-700 border border-border cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded border-border-light bg-navy-600 text-teal-500 focus:ring-teal-500/50"
                />
                <div>
                  <p className="text-sm text-text-primary">Envoyer confirmation WhatsApp</p>
                  <p className="text-xs text-text-muted">
                    Un message avec le programme sera envoye au {formatPhoneNumber(paymentReg.telephone)}
                  </p>
                </div>
              </label>
            </>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setPaymentModalId(null);
                setSendWhatsApp(true);
              }}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              onClick={handlePaymentConfirm}
              isLoading={isUpdatingPayment}
              fullWidth
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

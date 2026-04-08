"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAdminAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(password);

    if (!result.success) {
      setError(result.message || "Mot de passe incorrect");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image
              src="/logo.png"
              alt="WWP Academy"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-bold text-text-primary font-display">
              WWP <span className="text-teal-500">Academy</span>
            </h1>
          </div>
          <p className="text-text-muted mt-2">Administration</p>
        </div>

        {/* Login Card */}
        <div className="bg-navy-700 rounded-xl border border-border-light p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
            Connexion
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="password"
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              placeholder="Entrez le mot de passe administrateur"
              disabled={isSubmitting}
              autoFocus
            />

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Se connecter
            </Button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-text-muted hover:text-teal-500 transition-colors"
          >
            &larr; Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}

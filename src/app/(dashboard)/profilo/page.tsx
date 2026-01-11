"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Upload,
  Camera,
  Save,
  Lock,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogOut,
  CreditCard,
  Receipt,
  Euro,
  Calendar,
  FileCheck,
  Clock,
  X,
  Eye,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

interface AgentProfile {
  id: string;
  nome: string | null;
  cognome: string | null;
  telefono: string | null;
  email_personale: string | null;
  foto_profilo: string | null;
  // Campi aggiuntivi per l'agente (salvati in informazioni_aggiuntive)
  residenza?: string;
  partita_iva?: string;
  codice_fiscale?: string;
  // Documenti (accorpati: carta identità + codice fiscale)
  documenti_identita?: { url: string; name: string; uploadedAt: string }[];
  // Mandato/Contratto
  mandato_url?: string;
  mandato_name?: string;
  mandato_uploadedAt?: string;
}

interface AgentInvoice {
  id: string;
  internal_reference: string;
  invoice_number: string | null;
  reference_month: number;
  reference_year: number;
  gross_amount: number;
  net_amount: number;
  status: "to_emit" | "emitted" | "paid" | "cancelled";
  emission_date: string | null;
  due_date: string | null;
  payment_date: string | null;
  pdf_url: string | null;
  is_paid: boolean;
  notes: string | null;
  agent_notes: string | null;
  created_at: string;
}

// ==========================================
// COMPONENT
// ==========================================

export default function ProfiloPage() {
  const supabase = createClient();
  const router = useRouter();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadingInvoicePdf, setUploadingInvoicePdf] = useState<string | null>(null);
  
  // Message state
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Profile data
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  // Invoices data
  const [invoices, setInvoices] = useState<AgentInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    telefono: "",
    email_personale: "",
    residenza: "",
    partita_iva: "",
    codice_fiscale: "",
  });

  // Password reset state
  const [resettingPassword, setResettingPassword] = useState(false);

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error);
      }

      if (profileData) {
        const additionalInfo =
          (profileData.informazioni_aggiuntive as Record<string, unknown>) || {};
        const fullProfile: AgentProfile = {
          id: profileData.id,
          nome: profileData.nome,
          cognome: profileData.cognome,
          telefono: profileData.telefono,
          email_personale: profileData.email_personale,
          foto_profilo: profileData.foto_profilo,
          residenza: (additionalInfo.residenza as string) || "",
          partita_iva: (additionalInfo.partita_iva as string) || "",
          codice_fiscale: (additionalInfo.codice_fiscale as string) || "",
          // Documenti identità (array per supportare 1-2 PDF)
          documenti_identita: (additionalInfo.documenti_identita as AgentProfile["documenti_identita"]) || [],
          // Mandato/Contratto
          mandato_url: (additionalInfo.mandato_url as string) || "",
          mandato_name: (additionalInfo.mandato_name as string) || "",
          mandato_uploadedAt: (additionalInfo.mandato_uploadedAt as string) || "",
        };

        setProfile(fullProfile);
        setFormData({
          nome: fullProfile.nome || "",
          cognome: fullProfile.cognome || "",
          telefono: fullProfile.telefono || "",
          email_personale: fullProfile.email_personale || "",
          residenza: fullProfile.residenza || "",
          partita_iva: fullProfile.partita_iva || "",
          codice_fiscale: fullProfile.codice_fiscale || "",
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  // ==========================================
  // LOAD INVOICES
  // ==========================================

  const loadInvoices = useCallback(async () => {
    setLoadingInvoices(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Type cast per evitare errore "Type instantiation is excessively deep"
      // La tabella agent_invoices esiste nel DB ma non nei tipi generati
      const supabaseAny = supabase as unknown as { from: (table: string) => { select: (columns: string) => { eq: (column: string, value: string) => { order: (column: string, options: { ascending: boolean }) => { order: (column: string, options: { ascending: boolean }) => Promise<{ data: AgentInvoice[] | null; error: Error | null }> } } } } };
      const { data, error } = await supabaseAny
        .from("agent_invoices")
        .select("*")
        .eq("agent_id", user.id)
        .order("reference_year", { ascending: false })
        .order("reference_month", { ascending: false });

      if (error) {
        console.error("Error loading invoices:", error);
      } else {
        setInvoices(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingInvoices(false);
    }
  }, [supabase]);

  // ==========================================
  // EFFECTS
  // ==========================================

  useEffect(() => {
    loadProfile();
    loadInvoices();
  }, [loadProfile, loadInvoices]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get current additional info to preserve documents
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("informazioni_aggiuntive")
        .eq("id", user.id)
        .single();

      const currentInfo = (currentProfile?.informazioni_aggiuntive as Record<string, unknown>) || {};

      const updateData = {
        nome: formData.nome,
        cognome: formData.cognome,
        telefono: formData.telefono,
        email_personale: formData.email_personale,
        informazioni_aggiuntive: {
          ...currentInfo,
          residenza: formData.residenza,
          partita_iva: formData.partita_iva,
          codice_fiscale: formData.codice_fiscale,
        },
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...updateData });

      if (error) throw error;

      setMessage({ type: "success", text: "Profilo salvato con successo!" });
      loadProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({
        type: "error",
        text: "Errore durante il salvataggio del profilo",
      });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // PHOTO UPLOAD
  // ==========================================

  const handlePhotoUpload = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploadingPhoto(true);
      setMessage(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ foto_profilo: publicUrl, updated_at: new Date().toISOString() })
          .eq("id", user.id);

        if (updateError) throw updateError;

        setMessage({ type: "success", text: "Foto profilo aggiornata!" });
        loadProfile();
      } catch (error) {
        console.error("Error uploading photo:", error);
        setMessage({
          type: "error",
          text: "Errore durante il caricamento della foto",
        });
      } finally {
        setUploadingPhoto(false);
      }
    },
    [supabase, loadProfile]
  );

  // ==========================================
  // IDENTITY DOCUMENTS UPLOAD (Carta Identità + CF accorpati)
  // ==========================================

  const handleIdentityDocsUpload = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploadingDoc("identita");
      setMessage(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get current documents
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("informazioni_aggiuntive")
          .eq("id", user.id)
          .single();

        const currentInfo = (currentProfile?.informazioni_aggiuntive as Record<string, unknown>) || {};
        const existingDocs = (currentInfo.documenti_identita as AgentProfile["documenti_identita"]) || [];

        // Check limit (max 2 documents)
        if (existingDocs.length + acceptedFiles.length > 2) {
          setMessage({
            type: "error",
            text: "Puoi caricare massimo 2 documenti (Carta d'Identità e/o Codice Fiscale)",
          });
          setUploadingDoc(null);
          return;
        }

        const newDocs: NonNullable<AgentProfile["documenti_identita"]> = [];

        for (const file of acceptedFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${user.id}/identita_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("agent-documents")
            .upload(fileName, file, { upsert: false });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("agent-documents").getPublicUrl(fileName);

          newDocs.push({
            url: publicUrl,
            name: file.name,
            uploadedAt: new Date().toISOString(),
          });
        }

        // Update profile with new documents
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            informazioni_aggiuntive: {
              ...currentInfo,
              documenti_identita: [...existingDocs, ...newDocs],
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) throw updateError;

        setMessage({
          type: "success",
          text: `${acceptedFiles.length > 1 ? "Documenti caricati" : "Documento caricato"} con successo!`,
        });
        loadProfile();
      } catch (error) {
        console.error("Error uploading documents:", error);
        setMessage({
          type: "error",
          text: "Errore durante il caricamento dei documenti",
        });
      } finally {
        setUploadingDoc(null);
      }
    },
    [supabase, loadProfile]
  );

  const handleRemoveIdentityDoc = useCallback(
    async (index: number) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("informazioni_aggiuntive")
          .eq("id", user.id)
          .single();

        const currentInfo = (currentProfile?.informazioni_aggiuntive as Record<string, unknown>) || {};
        const docs = (currentInfo.documenti_identita as AgentProfile["documenti_identita"]) || [];

        // Remove the document at index
        const updatedDocs = docs.filter((_, i) => i !== index);

        const { error } = await supabase
          .from("profiles")
          .update({
            informazioni_aggiuntive: {
              ...currentInfo,
              documenti_identita: updatedDocs,
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) throw error;

        setMessage({ type: "success", text: "Documento rimosso!" });
        loadProfile();
      } catch (error) {
        console.error("Error removing document:", error);
        setMessage({ type: "error", text: "Errore durante la rimozione del documento" });
      }
    },
    [supabase, loadProfile]
  );

  // ==========================================
  // MANDATO (CONTRATTO) UPLOAD
  // ==========================================

  const handleMandatoUpload = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploadingDoc("mandato");
      setMessage(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/mandato_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("agent-documents")
          .upload(fileName, file, { upsert: false });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("agent-documents").getPublicUrl(fileName);

        // Get current additional info
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("informazioni_aggiuntive")
          .eq("id", user.id)
          .single();

        const currentInfo = (currentProfile?.informazioni_aggiuntive as Record<string, unknown>) || {};

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            informazioni_aggiuntive: {
              ...currentInfo,
              mandato_url: publicUrl,
              mandato_name: file.name,
              mandato_uploadedAt: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) throw updateError;

        setMessage({ type: "success", text: "Mandato caricato con successo!" });
        loadProfile();
      } catch (error) {
        console.error("Error uploading mandato:", error);
        setMessage({
          type: "error",
          text: "Errore durante il caricamento del mandato",
        });
      } finally {
        setUploadingDoc(null);
      }
    },
    [supabase, loadProfile]
  );

  // ==========================================
  // INVOICE PDF UPLOAD
  // ==========================================

  const handleInvoicePdfUpload = useCallback(
    async (invoiceId: string, file: File) => {
      setUploadingInvoicePdf(invoiceId);
      setMessage(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/fatture/${invoiceId}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("agent-documents")
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("agent-documents").getPublicUrl(fileName);

        // Update invoice with PDF URL
        // Type cast: agent_invoices non è nei tipi generati
        const supabaseUpdate = supabase as unknown as { from: (table: string) => { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => { eq: (col2: string, val2: string) => Promise<{ error: Error | null }> } } } };
        const { error: updateError } = await supabaseUpdate
          .from("agent_invoices")
          .update({
            pdf_url: publicUrl,
            pdf_uploaded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", invoiceId)
          .eq("agent_id", user.id);

        if (updateError) throw updateError;

        setMessage({ type: "success", text: "PDF fattura caricato!" });
        loadInvoices();
      } catch (error) {
        console.error("Error uploading invoice PDF:", error);
        setMessage({
          type: "error",
          text: "Errore durante il caricamento del PDF",
        });
      } finally {
        setUploadingInvoicePdf(null);
      }
    },
    [supabase, loadInvoices]
  );

  // ==========================================
  // CONFIRM INVOICE EMISSION
  // ==========================================

  const handleConfirmEmission = useCallback(
    async (invoiceId: string, invoiceNumber: string) => {
      if (!invoiceNumber.trim()) {
        setMessage({ type: "error", text: "Inserisci il numero fattura" });
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Type cast: agent_invoices non è nei tipi generati
        const supabaseUpdateEmission = supabase as unknown as { from: (table: string) => { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => { eq: (col2: string, val2: string) => Promise<{ error: Error | null }> } } } };
        const { error } = await supabaseUpdateEmission
          .from("agent_invoices")
          .update({
            invoice_number: invoiceNumber,
            status: "emitted",
            emission_date: new Date().toISOString().split("T")[0],
            updated_at: new Date().toISOString(),
          })
          .eq("id", invoiceId)
          .eq("agent_id", user.id);

        if (error) throw error;

        setMessage({ type: "success", text: "Fattura confermata come emessa!" });
        loadInvoices();
      } catch (error) {
        console.error("Error confirming emission:", error);
        setMessage({ type: "error", text: "Errore durante la conferma" });
      }
    },
    [supabase, loadInvoices]
  );

  // ==========================================
  // PASSWORD RESET
  // ==========================================

  const handlePasswordReset = async () => {
    setResettingPassword(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Email per il reset della password inviata! Controlla la tua casella di posta.",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage({
        type: "error",
        text: "Errore durante l'invio dell'email di reset",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  // ==========================================
  // DROPZONE CONFIGS
  // ==========================================

  const { getRootProps: getPhotoRootProps, getInputProps: getPhotoInputProps } =
    useDropzone({
      onDrop: handlePhotoUpload,
      accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
      maxFiles: 1,
      maxSize: 5 * 1024 * 1024,
    });

  const {
    getRootProps: getIdentityDocsRootProps,
    getInputProps: getIdentityDocsInputProps,
  } = useDropzone({
    onDrop: handleIdentityDocsUpload,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 2,
    maxSize: 10 * 1024 * 1024,
  });

  const {
    getRootProps: getMandatoRootProps,
    getInputProps: getMandatoInputProps,
  } = useDropzone({
    onDrop: handleMandatoUpload,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // ==========================================
  // HELPERS
  // ==========================================

  const getMonthName = (month: number) => {
    const months = [
      "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
      "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];
    return months[month - 1];
  };

  const getStatusBadge = (status: AgentInvoice["status"], isPaid: boolean) => {
    if (isPaid) {
      return <Badge className="bg-green-600 text-white">Pagata</Badge>;
    }
    switch (status) {
      case "to_emit":
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Da emettere</Badge>;
      case "emitted":
        return <Badge className="bg-blue-600 text-white">Emessa</Badge>;
      case "paid":
        return <Badge className="bg-green-600 text-white">Pagata</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annullata</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Split invoices into "to emit" and "emitted"
  const invoicesToEmit = invoices.filter((inv) => inv.status === "to_emit");
  const invoicesEmitted = invoices.filter((inv) => inv.status !== "to_emit");

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Caricamento profilo...</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
          <User className="h-5 w-5 md:h-7 md:w-7 text-foreground" />
          Il Mio Profilo
        </h1>
        <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm md:text-base">
          Gestisci le tue informazioni personali, documenti e fatturazione
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
              : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonna sinistra - Foto Profilo */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Foto Profilo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div
                {...getPhotoRootProps()}
                className="relative cursor-pointer group"
              >
                <input {...getPhotoInputProps()} />
                {profile?.foto_profilo ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-muted">
                    <Image
                      src={profile.foto_profilo}
                      alt="Foto profilo"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-border group-hover:bg-accent transition-colors">
                    {uploadingPhoto ? (
                      <Loader2 className="h-8 w-8 text-foreground animate-spin" />
                    ) : (
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Clicca o trascina per caricare
                <br />
                (max 5MB, JPG/PNG/GIF)
              </p>
              {profile?.nome && profile?.cognome && (
                <div className="mt-4 text-center">
                  <p className="font-semibold text-lg">
                    {profile.nome} {profile.cognome}
                  </p>
                  <Badge className="mt-1 bg-muted text-foreground">
                    Agente Commerciale
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonna destra - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dati Personali */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-foreground" />
                Dati Personali
              </CardTitle>
              <CardDescription>
                Le tue informazioni anagrafiche
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Mario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cognome">Cognome</Label>
                  <Input
                    id="cognome"
                    name="cognome"
                    value={formData.cognome}
                    onChange={handleInputChange}
                    placeholder="Rossi"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="residenza">Residenza</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="residenza"
                    name="residenza"
                    value={formData.residenza}
                    onChange={handleInputChange}
                    placeholder="Via Roma 1, 00100 Roma (RM)"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contatti */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-foreground" />
                Contatti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Account (non modificabile)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={userEmail}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_personale">Email Personale</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email_personale"
                    name="email_personale"
                    type="email"
                    value={formData.email_personale}
                    onChange={handleInputChange}
                    placeholder="mario.rossi@gmail.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+39 333 1234567"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dati Fiscali */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-foreground" />
                Dati Fiscali
              </CardTitle>
              <CardDescription>
                Informazioni per la fatturazione
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="partita_iva">Partita IVA</Label>
                  <Input
                    id="partita_iva"
                    name="partita_iva"
                    value={formData.partita_iva}
                    onChange={handleInputChange}
                    placeholder="IT12345678901"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codice_fiscale">Codice Fiscale</Label>
                  <Input
                    id="codice_fiscale"
                    name="codice_fiscale"
                    value={formData.codice_fiscale}
                    onChange={handleInputChange}
                    placeholder="RSSMRA80A01H501U"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documenti - CARD ACCORPATA: Carta Identità + Codice Fiscale */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-foreground" />
                Documenti d&apos;Identità
              </CardTitle>
              <CardDescription>
                Carica Carta d&apos;Identità e/o Tessera Codice Fiscale (max 2 PDF)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista documenti caricati */}
              {profile?.documenti_identita && profile.documenti_identita.length > 0 && (
                <div className="space-y-2">
                  {profile.documenti_identita.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm flex-1 truncate">{doc.name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.url, "_blank")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizza
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveIdentityDoc(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Dropzone per upload (mostra solo se meno di 2 documenti) */}
              {(!profile?.documenti_identita || profile.documenti_identita.length < 2) && (
                <div
                  {...getIdentityDocsRootProps()}
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-foreground hover:bg-muted/50 transition-colors"
                >
                  <input {...getIdentityDocsInputProps()} />
                  {uploadingDoc === "identita" ? (
                    <Loader2 className="h-8 w-8 mx-auto text-foreground animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Trascina qui o clicca per caricare
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Solo PDF (max 10MB per file)
                  </p>
                  {profile?.documenti_identita && profile.documenti_identita.length === 1 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Puoi caricare ancora 1 documento
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mandato / Contratto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-foreground" />
                Mandato
              </CardTitle>
              <CardDescription>
                Carica il contratto di mandato firmato (PDF)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.mandato_url ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm flex-1 truncate">
                    {profile.mandato_name || "Mandato caricato"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(profile.mandato_url, "_blank")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Visualizza
                  </Button>
                  <div {...getMandatoRootProps()}>
                    <input {...getMandatoInputProps()} />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-1" />
                      Sostituisci
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  {...getMandatoRootProps()}
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-foreground hover:bg-muted/50 transition-colors"
                >
                  <input {...getMandatoInputProps()} />
                  {uploadingDoc === "mandato" ? (
                    <Loader2 className="h-8 w-8 mx-auto text-foreground animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Trascina qui o clicca per caricare
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Solo PDF (max 10MB)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sicurezza */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-foreground" />
                Sicurezza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Riceverai un&apos;email per reimpostare la password
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handlePasswordReset}
                  disabled={resettingPassword}
                >
                  {resettingPassword ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Reimposta Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salva Modifiche
            </Button>
          </div>
        </div>
      </div>

      {/* ==========================================
          SEZIONE FATTURAZIONE E PAGAMENTI
          ========================================== */}
      <Separator className="my-8" />

      <div>
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-6">
          <CreditCard className="h-6 w-6 text-foreground" />
          Fatturazione e Pagamenti
        </h2>

        <div className="grid gap-6">
          {/* Fatture da Emettere */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Fatture da Emettere
              </CardTitle>
              <CardDescription>
                Commissioni maturate in attesa di fatturazione. Carica il PDF della fattura e conferma l&apos;emissione.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInvoices ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : invoicesToEmit.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nessuna fattura da emettere al momento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoicesToEmit.map((invoice) => (
                    <InvoiceToEmitCard
                      key={invoice.id}
                      invoice={invoice}
                      onUploadPdf={handleInvoicePdfUpload}
                      onConfirmEmission={handleConfirmEmission}
                      uploadingPdf={uploadingInvoicePdf === invoice.id}
                      formatCurrency={formatCurrency}
                      getMonthName={getMonthName}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fatture Emesse */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                Fatture Emesse
              </CardTitle>
              <CardDescription>
                Storico delle fatture emesse e stato dei pagamenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInvoices ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : invoicesEmitted.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nessuna fattura emessa</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Periodo</TableHead>
                        <TableHead>N. Fattura</TableHead>
                        <TableHead className="text-right">Importo</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Data Emissione</TableHead>
                        <TableHead>PDF</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoicesEmitted.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {getMonthName(invoice.reference_month)} {invoice.reference_year}
                          </TableCell>
                          <TableCell>{invoice.invoice_number || "-"}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(invoice.gross_amount)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(invoice.status, invoice.is_paid)}
                          </TableCell>
                          <TableCell>
                            {invoice.emission_date
                              ? new Date(invoice.emission_date).toLocaleDateString("it-IT")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {invoice.pdf_url ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(invoice.pdf_url!, "_blank")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logout Section */}
      <Separator className="my-6" />
      <Card className="border-destructive/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Esci dall&apos;account</p>
              <p className="text-sm text-muted-foreground">
                Verrai disconnesso da questo dispositivo
              </p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
                router.refresh();
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Esci
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==========================================
// INVOICE TO EMIT CARD COMPONENT
// ==========================================

interface InvoiceToEmitCardProps {
  invoice: AgentInvoice;
  onUploadPdf: (invoiceId: string, file: File) => void;
  onConfirmEmission: (invoiceId: string, invoiceNumber: string) => void;
  uploadingPdf: boolean;
  formatCurrency: (amount: number) => string;
  getMonthName: (month: number) => string;
}

function InvoiceToEmitCard({
  invoice,
  onUploadPdf,
  onConfirmEmission,
  uploadingPdf,
  formatCurrency,
  getMonthName,
}: InvoiceToEmitCardProps) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      if (files[0]) onUploadPdf(invoice.id, files[0]);
    },
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="border rounded-lg p-4 bg-amber-50/50 dark:bg-amber-950/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">
              {getMonthName(invoice.reference_month)} {invoice.reference_year}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(invoice.gross_amount)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Rif: {invoice.internal_reference}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* Upload PDF */}
          {!invoice.pdf_url ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/30 hover:border-primary"
              }`}
            >
              <input {...getInputProps()} />
              {uploadingPdf ? (
                <Loader2 className="h-5 w-5 mx-auto animate-spin" />
              ) : (
                <>
                  <Upload className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Carica PDF fattura
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">PDF caricato</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(invoice.pdf_url!, "_blank")}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Conferma emissione */}
          {invoice.pdf_url && !showConfirm && (
            <Button
              size="sm"
              onClick={() => setShowConfirm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileCheck className="h-4 w-4 mr-1" />
              Conferma Emissione
            </Button>
          )}

          {showConfirm && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="N. Fattura"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-32"
              />
              <Button
                size="sm"
                onClick={() => onConfirmEmission(invoice.id, invoiceNumber)}
                disabled={!invoiceNumber.trim()}
              >
                Conferma
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowConfirm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Switch } from "@/components/ui";
import { Icon } from "@/components/common";
import { useAuth } from "@/hooks/auth";
import { useUpdateEmail, useUpdatePassword, useUpdateProfile } from "@/hooks";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { cn } from "@/lib/utils";

type SectionKey = "profile" | "appearance" | "security" | "notifications" | "reports";

const professionalAvatars = [
  { label: "Coordenador", url: getProfessionalAvatarUrl("Coordenador", "personas", "f2d3b1", "2c1b18", "formal") },
  { label: "Analista", url: getProfessionalAvatarUrl("Analista", "personas", "8d5524", "1c1b1a", "glasses") },
  { label: "Revisor", url: getProfessionalAvatarUrl("Revisor", "personas", "c68642", "4a312c", "formal") },
  { label: "Linguista", url: getProfessionalAvatarUrl("Linguista", "personas", "e0ac69", "2f1f1c", "glasses") },
  { label: "Gestora", url: getProfessionalAvatarUrl("Gestora", "micah", "f1c27d", "3b241f", "formal") },
  { label: "Curador", url: getProfessionalAvatarUrl("Curador", "micah", "ffdbac", "241c18", "glasses") },
  { label: "Supervisora", url: getProfessionalAvatarUrl("Supervisora", "micah", "a87552", "2b1b16", "formal") },
  { label: "Editor", url: getProfessionalAvatarUrl("Editor", "micah", "d08b5b", "3a2924", "glasses") },
  { label: "Investigadora", url: getProfessionalAvatarUrl("Investigadora", "lorelei", "f2d3b1", "3c2a24", "formal") },
  { label: "Arquivista", url: getProfessionalAvatarUrl("Arquivista", "lorelei", "8d5524", "1f1a17", "glasses") },
  { label: "Consultor", url: getProfessionalAvatarUrl("Consultor", "lorelei", "e0ac69", "2b211e", "formal") },
  { label: "Operadora", url: getProfessionalAvatarUrl("Operadora", "lorelei", "c68642", "4b332d", "glasses") },
  { label: "Admin", url: getProfessionalAvatarUrl("Admin", "avataaars", "f8d25c", "2c1b18", "formal") },
  { label: "Especialista", url: getProfessionalAvatarUrl("Especialista", "avataaars", "ae5d29", "1f1b18", "glasses") },
  { label: "Técnica", url: getProfessionalAvatarUrl("Tecnica", "avataaars", "d08b5b", "3b2b27", "formal") },
  { label: "Supervisor", url: getProfessionalAvatarUrl("Supervisor", "avataaars", "edb98a", "2a201c", "glasses") },
];

const sections: Array<{ key: SectionKey; label: string; icon: React.ComponentProps<typeof Icon>["name"] }> = [
  { key: "profile", label: "Perfil", icon: "User" },
  { key: "appearance", label: "Aparência", icon: "Pencil" },
  { key: "security", label: "Segurança", icon: "Shield" },
  { key: "notifications", label: "Notificações", icon: "Bell" },
  { key: "reports", label: "Relatórios", icon: "FileText" },
];

export function SettingsPageContent() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePhotoUrl || getDicebearUrl(user?.name || "user"));
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notificationPrefs, setNotificationPrefs] = useLocalPrefs("medproject.notification-preferences", {
    pendingApprovals: true,
    correctionRequests: true,
    emailNotifications: false,
  });
  const [reportPrefs, setReportPrefs] = useLocalPrefs("medproject.report-preferences", {
    defaultPdf: false,
    includeMetadata: true,
  });
  const [compactDensity, setCompactDensity] = useLocalPrefs("medproject.appearance-preferences", {
    compactDensity: false,
  });

  const updateProfile = useUpdateProfile();
  const updateEmail = useUpdateEmail();
  const updatePassword = useUpdatePassword();

  useEffect(() => {
    setName(user?.name || "");
    setNewEmail(user?.email || "");
    setAvatarUrl(user?.profilePhotoUrl || getDicebearUrl(user?.name || "user"));
  }, [user]);

  const roleLabel = translateRole(user?.role);
  const initials = useMemo(() => getInitials(user?.name || "U"), [user?.name]);

  const saveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ name, profilePhotoUrl: avatarUrl });
      SucessMessage("Perfil actualizado com sucesso");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Não foi possível actualizar o perfil");
    }
  };

  const saveEmail = async () => {
    try {
      await updateEmail.mutateAsync({ email: newEmail });
      setEmailModalOpen(false);
      SucessMessage("Email actualizado com sucesso");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Não foi possível alterar o email");
    }
  };

  const savePassword = async () => {
    if (newPassword !== confirmPassword) {
      ErrorMessage("A confirmação da palavra-passe não coincide");
      return;
    }

    try {
      await updatePassword.mutateAsync({ currentPassword, newPassword });
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      SucessMessage("Palavra-passe actualizada com sucesso");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Não foi possível alterar a palavra-passe");
    }
  };

  const chooseAvatar = async (url: string) => {
    setAvatarUrl(url);
    setAvatarModalOpen(false);
    try {
      await updateProfile.mutateAsync({ name, profilePhotoUrl: url });
      SucessMessage("Avatar actualizado com sucesso");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Não foi possível actualizar o avatar");
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Definições da Conta</h1>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-lg border bg-card p-4 lg:min-h-[620px]">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gerais</p>
          <nav className="mt-4 space-y-1">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveSection(section.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors",
                  activeSection === section.key
                    ? "border-primary bg-primary/15 text-primary"
                    : "text-foreground hover:bg-muted/60 hover:text-primary",
                )}
              >
                <Icon name={section.icon} className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="rounded-lg border bg-background p-4 md:p-6">
          {activeSection === "profile" && (
            <SettingsPanel title="Meu Perfil" description="Faça a gestão das suas informações pessoais e do avatar.">
              <section className="rounded-lg border bg-card p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-4 border-primary/25">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{user?.name || "Utilizador"}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email || "-"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{roleLabel}</Badge>
                    <Button type="button" variant="outline" onClick={() => setAvatarModalOpen(true)}>
                      <Icon name="Camera" className="h-4 w-4" />
                      Alterar avatar
                    </Button>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border bg-card p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Informação Pessoal</h3>
                    <p className="text-sm text-muted-foreground">Actualize o nome apresentado na aplicação.</p>
                  </div>
                  <Button type="button" onClick={saveProfile} loading={updateProfile.isPending}>
                    <Icon name="Save" className="h-4 w-4" />
                    Guardar perfil
                  </Button>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Input label="Nome" value={name} onChange={(event) => setName(event.target.value)} />
                  <Input label="Função" value={roleLabel} disabled />
                </div>
              </section>
            </SettingsPanel>
          )}

          {activeSection === "appearance" && (
            <SettingsPanel title="Aparência" description="Ajuste a identidade visual da sua experiência.">
              <section className="rounded-lg border bg-card">
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15">
                      <Icon name="Palette" className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Cor Primária</p>
                      <p className="text-sm text-muted-foreground">Cor de destaque da interface</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">primary</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15">
                      <Icon name="Type" className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Densidade compacta</p>
                      <p className="text-sm text-muted-foreground">Reduz espaçamentos para maior leitura de dados</p>
                    </div>
                  </div>
                  <Switch
                    checked={compactDensity.compactDensity}
                    onCheckedChange={(checked) => setCompactDensity({ compactDensity: checked })}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tema sugerido</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <ThemeCard label="Light" icon="Sun" active={theme === "light"} onClick={() => setTheme("light")} />
                  <ThemeCard label="Dark" icon="Moon" active={theme === "dark"} onClick={() => setTheme("dark")} />
                  <ThemeCard label="System" icon="Monitor" active={theme === "system"} onClick={() => setTheme("system")} />
                </div>
              </section>
            </SettingsPanel>
          )}

          {activeSection === "security" && (
            <SettingsPanel title="Segurança" description="Faça a gestão das credenciais de acesso e segurança da sua conta.">
              <section className="rounded-lg border bg-card p-4">
                <h3 className="text-lg font-semibold">Segurança da Conta</h3>
                <p className="text-sm text-muted-foreground">Altere as suas definições de segurança.</p>
                <div className="mt-5 space-y-4">
                  <ActionRow label="Email" value={user?.email || "-"} icon="AtSign" buttonLabel="Alterar Email" onClick={() => setEmailModalOpen(true)} />
                  <ActionRow label="Palavra-passe" value="••••••••••••" icon="KeyRound" buttonLabel="Alterar palavra-passe" onClick={() => setPasswordModalOpen(true)} />
                </div>
              </section>
            </SettingsPanel>
          )}

          {activeSection === "notifications" && (
            <SettingsPanel title="Notificações" description="Defina os avisos que quer acompanhar na aplicação.">
              <PreferenceRow title="Aprovações pendentes" description="Receber avisos quando houver conteúdos à espera de revisão." checked={notificationPrefs.pendingApprovals} onChange={(pendingApprovals) => setNotificationPrefs({ ...notificationPrefs, pendingApprovals })} />
              <PreferenceRow title="Correções solicitadas" description="Receber avisos quando um conteúdo precisar de correção." checked={notificationPrefs.correctionRequests} onChange={(correctionRequests) => setNotificationPrefs({ ...notificationPrefs, correctionRequests })} />
              <PreferenceRow title="Notificações por email" description="Receber resumo por email quando o serviço estiver activo." checked={notificationPrefs.emailNotifications} onChange={(emailNotifications) => setNotificationPrefs({ ...notificationPrefs, emailNotifications })} />
            </SettingsPanel>
          )}

          {activeSection === "reports" && (
            <SettingsPanel title="Relatórios" description="Preferências padrão para exportações.">
              <PreferenceRow title="Formato PDF como padrão" description="Usar PDF como primeira opção ao gerar relatórios." checked={reportPrefs.defaultPdf} onChange={(defaultPdf) => setReportPrefs({ ...reportPrefs, defaultPdf })} />
              <PreferenceRow title="Incluir metadados técnicos" description="Adicionar parâmetros, data e total de registos nos ficheiros." checked={reportPrefs.includeMetadata} onChange={(includeMetadata) => setReportPrefs({ ...reportPrefs, includeMetadata })} />
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-semibold">Nome padrão dos ficheiros</p>
                <p className="mt-1 text-sm text-muted-foreground">{"{tipo}_report_{data}.{formato}"}</p>
              </div>
            </SettingsPanel>
          )}
        </main>
      </div>

      <EmailModal open={emailModalOpen} email={newEmail} isLoading={updateEmail.isPending} onOpenChange={setEmailModalOpen} onEmailChange={setNewEmail} onSave={saveEmail} />
      <PasswordModal open={passwordModalOpen} isLoading={updatePassword.isPending} currentPassword={currentPassword} newPassword={newPassword} confirmPassword={confirmPassword} onOpenChange={setPasswordModalOpen} onCurrentPasswordChange={setCurrentPassword} onNewPasswordChange={setNewPassword} onConfirmPasswordChange={setConfirmPassword} onSave={savePassword} />
      <AvatarModal open={avatarModalOpen} selectedUrl={avatarUrl} onOpenChange={setAvatarModalOpen} onChoose={chooseAvatar} />
    </div>
  );
}

function SettingsPanel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <header className="border-b pb-5">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </header>
      {children}
    </div>
  );
}

function ThemeCard({ label, icon, active, onClick }: { label: string; icon: React.ComponentProps<typeof Icon>["name"]; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/60",
        active && "border-primary ring-1 ring-primary",
      )}
    >
      <div className="flex aspect-video items-center justify-center rounded-md border bg-muted/40">
        <Icon name={icon} className="h-8 w-8 text-primary" />
      </div>
      {active && (
        <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Icon name="Check" className="h-4 w-4" />
        </span>
      )}
      <p className="mt-3 text-center text-sm font-semibold uppercase text-primary">{label}</p>
    </button>
  );
}

function ActionRow({ label, value, icon, buttonLabel, onClick }: { label: string; value: string; icon: React.ComponentProps<typeof Icon>["name"]; buttonLabel: string; onClick: () => void }) {
  return (
    <div className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_auto] md:items-end">
      <Input label={label} startIcon={icon} value={value} disabled />
      <Button type="button" onClick={onClick}>
        {buttonLabel}
      </Button>
    </div>
  );
}

function PreferenceRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function EmailModal({ open, email, isLoading, onOpenChange, onEmailChange, onSave }: { open: boolean; email: string; isLoading: boolean; onOpenChange: (open: boolean) => void; onEmailChange: (email: string) => void; onSave: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar email</DialogTitle>
        </DialogHeader>
        <Input label="Novo email" type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button loading={isLoading} onClick={onSave}>Guardar email</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PasswordModal({ open, isLoading, currentPassword, newPassword, confirmPassword, onOpenChange, onCurrentPasswordChange, onNewPasswordChange, onConfirmPasswordChange, onSave }: { open: boolean; isLoading: boolean; currentPassword: string; newPassword: string; confirmPassword: string; onOpenChange: (open: boolean) => void; onCurrentPasswordChange: (value: string) => void; onNewPasswordChange: (value: string) => void; onConfirmPasswordChange: (value: string) => void; onSave: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar palavra-passe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input label="Palavra-passe actual" type="password" value={currentPassword} onChange={(event) => onCurrentPasswordChange(event.target.value)} />
          <Input label="Nova palavra-passe" type="password" value={newPassword} onChange={(event) => onNewPasswordChange(event.target.value)} />
          <Input label="Confirmar nova palavra-passe" type="password" value={confirmPassword} onChange={(event) => onConfirmPasswordChange(event.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button loading={isLoading} onClick={onSave}>Guardar palavra-passe</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AvatarModal({ open, selectedUrl, onOpenChange, onChoose }: { open: boolean; selectedUrl: string; onOpenChange: (open: boolean) => void; onChoose: (url: string) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Escolher avatar</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Seleccione uma opção profissional para o seu perfil. A escolha é guardada automaticamente.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {professionalAvatars.map((avatar) => {
            const url = avatar.url;
            const selected = selectedUrl === url;
            return (
              <button
                key={avatar.label}
                type="button"
                onClick={() => onChoose(url)}
                className={cn(
                  "group relative min-h-[128px] rounded-lg border bg-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/70 hover:bg-primary/5 hover:shadow-sm",
                  selected && "border-primary bg-primary/10 ring-1 ring-primary",
                )}
                aria-pressed={selected}
              >
                {selected && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <Icon name="Check" className="h-3.5 w-3.5" />
                  </span>
                )}
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/40">
                  <img src={url} alt={avatar.label} className="h-20 w-20 rounded-full" />
                </span>
                <p className={cn("mt-2 truncate text-xs font-medium text-muted-foreground", selected && "text-primary")}>
                  {avatar.label}
                </p>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useLocalPrefs<T extends Record<string, any>>(key: string, defaults: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaults);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (stored) setValue({ ...defaults, ...JSON.parse(stored) });
  }, [key]);

  const update = (nextValue: T) => {
    setValue(nextValue);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(nextValue));
    }
  };

  return [value, update];
}

function getDicebearUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function getProfessionalAvatarUrl(seed: string, style: "avataaars" | "micah" | "personas" | "lorelei", skinColor: string, hairColor: string, variant: "formal" | "glasses") {
  const params = new URLSearchParams({
    seed,
    backgroundType: "solid",
    backgroundColor: "f8fafc",
    radius: "50",
    skinColor,
    hairColor,
  });

  if (style === "avataaars") {
    params.set("eyes", "default,happy");
    params.set("mouth", "smile,default");
    params.set("clothing", "blazerAndShirt,blazerAndSweater,shirtCrewNeck");
    params.set("accessories", variant === "glasses" ? "prescription01,prescription02" : "blank");
  }

  if (style === "micah") {
    params.set("eyes", "eyes");
    params.set("mouth", "smile,laughing");
    params.set("shirt", "collared");
    params.set("glasses", variant === "glasses" ? "round,square" : "none");
  }

  if (style === "personas") {
    params.set("mouth", "smile");
    params.set("eyes", "open,happy");
    params.set("accessories", variant === "glasses" ? "glasses" : "none");
  }

  if (style === "lorelei") {
    params.set("eyes", "variant01,variant02");
    params.set("mouth", "happy01,happy02");
    params.set("glasses", variant === "glasses" ? "variant01,variant02" : "none");
  }

  return `https://api.dicebear.com/9.x/${style}/svg?${params.toString()}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function translateRole(role?: string) {
  return { ADMIN: "Administrador", SUPERVISOR: "Supervisor", OPERATOR: "Operador" }[role || ""] || "-";
}

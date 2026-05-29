"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  BookOpen,
  FileText,
  Users,
  Calendar,
  Download,
  Home,
  Plus,
  LoaderCircle,
  LayoutDashboard,
  MapPin,
  UserSquare,
  Globe,
  Image as ImageIcon,
  Newspaper,
  ChevronRight,
} from "lucide-react";
import { DictionaryManager } from "@/components/admin/dictionary-manager";
import { GrammarManager } from "@/components/admin/grammar-manager";
import { VonaManager } from "@/components/admin/vona-manager";
import { ToponymManager } from "@/components/admin/toponym-manager";
import { AnthroponymManager } from "@/components/admin/anthroponym-manager";
import { EventsManager } from "@/components/admin/events-manager";
import { ArticlesManager } from "@/components/admin/articles-manager";
import { DocumentsManager } from "@/components/admin/documents-manager";
import { MediaManager } from "@/components/admin/media-manager";
import Image from "next/image";
import Link from "next/link";

type Section =
  | "overview"
  | "dictionary"
  | "grammar"
  | "vona"
  | "toponyms"
  | "anthroponyms"
  | "events"
  | "articles"
  | "documents"
  | "media";

const navItems: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "dictionary", label: "Dicionário", icon: BookOpen },
  { id: "grammar", label: "Gramática", icon: FileText },
  { id: "vona", label: "VONA", icon: Globe },
  { id: "toponyms", label: "Topônimos", icon: MapPin },
  { id: "anthroponyms", label: "Antropônimos", icon: UserSquare },
  { id: "events", label: "Eventos", icon: Calendar },
  { id: "articles", label: "Artigos", icon: Newspaper },
  { id: "documents", label: "Documentos", icon: Download },
  { id: "media", label: "Multimídia", icon: ImageIcon },
];

const sectionTitles: Record<Section, string> = {
  overview: "Visão Geral",
  dictionary: "Dicionário",
  grammar: "Gramática",
  vona: "VONA",
  toponyms: "Topônimos",
  anthroponyms: "Antropônimos",
  events: "Eventos",
  articles: "Artigos",
  documents: "Documentos",
  media: "Multimídia",
};

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (!session) {
      router.push("/admin-login");
      return;
    }
    try {
      const sessionData = JSON.parse(session);
      if (Date.now() > sessionData.expires) {
        localStorage.removeItem("admin_session");
        router.push("/admin-login");
        return;
      }
      setUser(sessionData);
    } catch {
      localStorage.removeItem("admin_session");
      router.push("/admin-login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    router.push("/admin-login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="animate-spin h-10 w-10 text-blue-600" />
          <p className="text-slate-500 text-sm">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { title: "Entradas do Dicionário", value: "15,420", icon: BookOpen, color: "bg-blue-500" },
    { title: "Regras Gramaticais", value: "156", icon: FileText, color: "bg-green-500" },
    { title: "Termos VONA", value: "8,934", icon: Globe, color: "bg-purple-500" },
    { title: "Topônimos", value: "2,341", icon: MapPin, color: "bg-orange-500" },
    { title: "Antropônimos", value: "1,876", icon: UserSquare, color: "bg-red-500" },
    { title: "Eventos", value: "45", icon: Calendar, color: "bg-indigo-500" },
    { title: "Artigos", value: "128", icon: Newspaper, color: "bg-teal-500" },
    { title: "Documentos", value: "89", icon: Download, color: "bg-pink-500" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <Image src="/cn_illp.png" alt="CN-IILP" width={36} height={36} className="object-contain" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 leading-tight">CN-IILP</p>
            <p className="text-[10px] text-slate-400 leading-tight truncate">Painel Administrativo</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <p className="px-6 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Conteúdo</p>
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors text-left ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-100 p-4 space-y-2">
          <Link href="/" className="flex items-center gap-2 px-2 py-2 text-sm text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Home className="h-4 w-4" />
            Portal Público
          </Link>
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white uppercase">{user.user?.[0]}</span>
              </div>
              <span className="text-sm font-medium text-slate-700 truncate">{user.user}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-14 flex items-center px-8 gap-2">
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <span>Admin</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-slate-800">{sectionTitles[activeSection]}</span>
          </div>
          <div className="ml-auto">
            <Badge className="bg-green-100 text-green-700 border-0 px-3 py-1 text-xs font-semibold">
              {user.user}
            </Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="border border-slate-200 shadow-none bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">{stat.title}</p>
                          <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                        <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-slate-200 shadow-none bg-white">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-slate-800">Atividade Recente</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                        <Plus className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Nova entrada adicionada</p>
                          <p className="text-xs text-slate-500">Palavra "quilombo" — há 2 horas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                        <FileText className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Artigo publicado</p>
                          <p className="text-xs text-slate-500">"História da Língua Portuguesa em Angola" — há 4 horas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Evento criado</p>
                          <p className="text-xs text-slate-500">Seminário de Linguística — há 6 horas</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-none bg-white">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-slate-800">Acesso Rápido</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "dictionary" as Section, label: "Dicionário", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100" },
                        { id: "events" as Section, label: "Eventos", icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100" },
                        { id: "articles" as Section, label: "Artigos", icon: Newspaper, color: "text-teal-600", bg: "bg-teal-50 hover:bg-teal-100" },
                        { id: "documents" as Section, label: "Documentos", icon: Download, color: "text-pink-600", bg: "bg-pink-50 hover:bg-pink-100" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`h-20 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${item.bg}`}
                        >
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                          <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === "dictionary" && <DictionaryManager />}
          {activeSection === "grammar" && <GrammarManager />}
          {activeSection === "vona" && <VonaManager />}
          {activeSection === "toponyms" && <ToponymManager />}
          {activeSection === "anthroponyms" && <AnthroponymManager />}
          {activeSection === "events" && <EventsManager />}
          {activeSection === "articles" && <ArticlesManager />}
          {activeSection === "documents" && <DocumentsManager />}
          {activeSection === "media" && <MediaManager />}
        </main>
      </div>
    </div>
  );
}

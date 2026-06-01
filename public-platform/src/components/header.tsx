"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Award,
  Book,
  BookOpen,
  Calendar,
  ChevronDown,
  FileText,
  Globe,
  Info,
  Library,
  Menu,
  Phone,
  Sparkles,
  Users,
  X,
} from "lucide-react"

const navGroups = [
  {
    label: "Recursos",
    items: [
      { name: "Dicionário", href: "/dictionary", icon: Book, desc: "Definições, etimologias e exemplos de uso" },
      { name: "Léxico", href: "/lexico", icon: Globe, desc: "Neologismos, estrangeirismos, topónimos e vocabulários ortográficos" },
      { name: "Neologismos", href: "/lexico", icon: Sparkles, desc: "Novas palavras aprovadas no acervo público" },
      { name: "Estrangeirismos", href: "/lexico", icon: Globe, desc: "Termos de origem estrangeira e respetivas adaptações" },
      { name: "Topónimos", href: "/toponimos", icon: Globe, desc: "Nomes de lugares e história toponímica" },
      { name: "Antropónimos", href: "/antroponimos", icon: Users, desc: "Nomes próprios, etimologia e identidade" },
      { name: "VONALP", href: "/vonalp", icon: Library, desc: "Vocabulário Ortográfico Nacional de Angola para a Língua Portuguesa" },
      { name: "VONALP EP", href: "/vonalp-ep", icon: FileText, desc: "Vocabulário Ortográfico Nacional de Angola para a Língua Portuguesa — para o Ensino Primário" },
    ],
  },
  {
    label: "Conteúdos",
    items: [
      { name: "Artigos", href: "/articles", icon: BookOpen, desc: "Pesquisas e reflexões sobre a língua" },
      { name: "Eventos", href: "/events", icon: Calendar, desc: "Conferências e eventos da comissão" },
    ],
  },
  {
    label: "Sobre",
    items: [
      { name: "A Comissão", href: "/about", icon: Info, desc: "Missão, visão e estrutura da CNLP" },
      { name: "Angola", href: "/about#angola", icon: Award, desc: "O papel da língua portuguesa em Angola" },
      { name: "Contacto", href: "/about#contacts", icon: Phone, desc: "Fale connosco" },
    ],
  },
]

function DropdownPanel({ items }: { items: typeof navGroups[0]["items"] }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+0.75rem)] w-80 z-50 pointer-events-none opacity-0 invisible -translate-y-1 transition-all duration-150 ease-out group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto">
      <div className="rounded-lg border border-border/60 bg-background shadow-lg shadow-black/8 overflow-hidden">
        <div className="p-1">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-colors duration-100"
              >
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="min-w-0">
                  <span className="block font-medium">{item.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.desc}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] w-full border-b border-border/50 bg-background/94 backdrop-blur-md no-screenshot">
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center shrink-0">
          <img src="/cn_illp.png" className="h-9 w-auto" alt="CNLP Angola" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <Link href="/" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-150">
            Início
          </Link>

          {navGroups.map((group) => (
            <div key={group.label} className="relative group/nav">
              <div className="absolute left-0 top-full h-4 w-full" />
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-150">
                {group.label}
                <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-hover/nav:rotate-180" />
              </button>
              <DropdownPanel items={group.items} />
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/dictionary" className="hidden lg:block">
            <Button className="rounded-md px-7 h-11 text-sm font-semibold shadow-none">
              Consultar Dicionário
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10 rounded-md"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 py-4 space-y-0.5">
            <Link
              href="/"
              className="block px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-primary/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Início
            </Link>

            {navGroups.map((group) => (
              <div key={group.label}>
                <button
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setMobileExpanded(mobileExpanded === group.label ? null : group.label)}
                >
                  {group.label}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileExpanded === group.label ? "rotate-180" : ""}`} />
                </button>
                {mobileExpanded === group.label && (
                  <div className="ml-3 mt-0.5 border-l-2 border-border/50 pl-3 space-y-0.5 mb-1">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-3 px-2 py-2 rounded-md text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-3 pb-1 border-t border-border/60 mt-2">
              <Link href="/dictionary" onClick={() => setIsOpen(false)}>
                <Button className="w-full rounded-md font-semibold h-11">Consultar Dicionário</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

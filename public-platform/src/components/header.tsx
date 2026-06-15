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
  Languages,
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
      { name: "Neologismos", href: "/neologismos", icon: Sparkles, desc: "Novas palavras aprovadas no acervo público" },
      { name: "Estrangeirismos", href: "/estrangeirismos", icon: Globe, desc: "Vocábulos de origem estrangeira e respetivas adaptações" },
      { name: "Topónimos", href: "/toponimos", icon: Globe, desc: "Nomes de lugares e história toponímica" },
      { name: "Antropónimos", href: "/antroponimos", icon: Users, desc: "Nomes próprios, etimologia e identidade" },
      { name: "VONALP", href: "/vonalp", icon: Library, desc: "Vocabulário Ortográfico Nacional de Angola da Língua Portuguesa" },
      { name: "VONALP-EP", href: "/vonalp-ep", icon: FileText, desc: "Vocabulário Ortográfico Nacional de Angola da Língua Portuguesa para o Ensino Primário" },
      { name: "VOLNA", href: "/volna", icon: Languages, desc: "Vocabulário das Línguas Nacionais de Angola" },
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
    <div className="pointer-events-none invisible absolute left-1/2 top-[calc(100%+0.75rem)] z-50 w-80 -translate-x-1/2 -translate-y-1 opacity-0 transition-all duration-150 ease-out group-hover/nav:pointer-events-auto group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
      <div className="overflow-hidden rounded-md border border-border/60 bg-background/96 shadow-lg shadow-black/8 backdrop-blur">
        <div className="p-1">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground/80 transition-colors duration-100 hover:bg-primary/10 hover:text-foreground"
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
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
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <header className="texture-header fixed left-0 right-0 top-0 z-[9999] w-full border-b border-border/50 bg-background/94 backdrop-blur-md no-screenshot">
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        <Link href="/" className="flex shrink-0 items-center">
          <img src="/med.gov.png" className="h-12 w-auto" alt="CNLP Angola" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/" className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-primary">
            Início
          </Link>

          {navGroups.map((group) => (
            <div key={group.label} className="group/nav relative">
              <div className="absolute left-0 top-full h-4 w-full" />
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-primary">
                {group.label}
                <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-hover/nav:rotate-180" />
              </button>
              <DropdownPanel items={group.items} />
            </div>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Link href="/vonalp" className="hidden lg:block">
            <Button className="h-11 rounded-md px-7 text-sm font-semibold shadow-none">
              Consultar Vocabulário
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-md lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="mx-auto max-w-7xl space-y-0.5 px-6 py-4 sm:px-8">
            <Link
              href="/"
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/10"
              onClick={() => setIsOpen(false)}
            >
              Início
            </Link>

            {navGroups.map((group) => (
              <div key={group.label}>
                <button
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  onClick={() => setMobileExpanded(mobileExpanded === group.label ? null : group.label)}
                >
                  {group.label}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileExpanded === group.label ? "rotate-180" : ""}`} />
                </button>
                {mobileExpanded === group.label && (
                  <div className="mb-1 ml-3 mt-0.5 space-y-0.5 border-l-2 border-border/50 pl-3">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
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

            <div className="mt-2 border-t border-border/60 pb-1 pt-3">
              <Link href="/vonalp" onClick={() => setIsOpen(false)}>
                <Button className="h-11 w-full rounded-md font-semibold">Consultar Vocabulário</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

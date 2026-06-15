import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

const socials = [
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "LinkedIn", href: "#", Icon: LinkedInIcon },
  { label: "YouTube", href: "#", Icon: YouTubeIcon },
]

const cols = [
  {
    heading: "Recursos",
    links: [
      { label: "Dicionário", href: "/dictionary" },
      { label: "Neologismos", href: "/neologismos" },
      { label: "Estrangeirismos", href: "/estrangeirismos" },
      { label: "Topónimos", href: "/toponimos" },
      { label: "Antropónimos", href: "/antroponimos" },
      { label: "VONALP", href: "/vonalp" },
      { label: "VONALP-EP", href: "/vonalp-ep" },
      { label: "VOLNA", href: "/volna" },
    ],
  },
  {
    heading: "Conteúdos",
    links: [
      { label: "Artigos", href: "/articles" },
      { label: "Eventos", href: "/events" },
    ],
  },
  {
    heading: "Instituição",
    links: [
      { label: "Sobre a Comissão", href: "/about" },
      { label: "Política de Privacidade", href: "/privacidade" },
      { label: "Vocábulos de Uso", href: "/vocabulos-de-uso" },
      { label: "Acessibilidade", href: "/acessibilidade" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="texture-footer bg-[#061f4a] text-blue-100">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,112,255,0.42),transparent_36%)]">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200/75 mb-3">
                Comissão Nacional - CN-IILP
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Explore o português<br />de Angola, hoje.
              </h2>
              <p className="mt-4 text-blue-100/75 text-base leading-relaxed max-w-md">
                Dicionário, Topónimos, Antropónimos, Vocabulário Ortográfico Nacional de Angola e publicações relevantes. Tudo no mesmo portal, totalmente gratuito.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/vonalp">
                <Button className="rounded-md px-7 h-11 font-semibold bg-white text-primary hover:bg-blue-50 shadow-none">
                  Consultar Vocabulário
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" className="rounded-md px-7 h-11 font-semibold border-white/25 text-white bg-transparent hover:bg-white/10 hover:text-white shadow-none">
                  Saber mais
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="space-y-5">
            <img
              src="/med.gov.png"
              className="h-11 w-auto brightness-0 invert opacity-90"
              alt="CNLP Angola"
            />
            <p className="text-sm text-blue-100/75 leading-relaxed">
              A língua preserva,{" "}
              <span className="text-white font-medium">o povo perpetua.</span>
            </p>
            <address className="not-italic text-sm text-blue-100/70 space-y-1">
              <p>Ministério da Educação</p>
              <p>Luanda, Angola</p>
              <a href="tel:+244222000000" className="hover:text-white transition-colors block">
                +244 222 000 000
              </a>
              <a href="mailto:geral@cn-iilp.ao" className="hover:text-white transition-colors block">
                geral@cn-iilp.ao
              </a>
            </address>

            <div className="flex items-center gap-3 pt-1">
              {socials.map(({ label, href, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-white/20 text-blue-100/75 hover:text-white hover:border-white/45 transition-all duration-200"
                >
                  <Icon />
                </Link>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200/65 mb-5">
                {col.heading}
              </p>
              <ul className="space-y-3">
                {col.links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-blue-100/70 hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-100/62">
          <p>© {new Date().getFullYear()} Comissão Nacional de Língua Portuguesa de Angola. Todos os direitos reservados.</p>
          <p>
            Desenvolvido por{" "}
            <a
              href="https://mindware.ao"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              Mindware
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

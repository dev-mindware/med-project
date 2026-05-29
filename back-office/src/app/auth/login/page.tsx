import { Activity } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      <div className="flex flex-col gap-4 p-6 md:p-10 z-10 bg-background/60 backdrop-blur-xl lg:bg-transparent">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-semibold tracking-tight transition-transform hover:scale-105">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Activity className="size-5" />
            </div>
            <span className="text-xl">CN-IILP</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm rounded-2xl border border-border/50 bg-background/50 p-8 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-4">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-tr from-primary/20 via-background to-background mix-blend-multiply z-10 dark:mix-blend-color-burn pointer-events-none" />
        <img
          src="/login-bg.png"
          alt="MedProject Background"
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity duration-1000 ease-in-out hover:opacity-100"
        />
        <div className="absolute bottom-10 left-10 z-20 max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-backwards">
          <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">
            Sistema de Gestão Linguística
          </h2>
          <p className="mt-2 text-lg text-white/90 drop-shadow-md font-medium">
            Faça a gestão de entradas, antropónimos, estrangeirismos e eventos com eficiência e precisão.
          </p>
        </div>
      </div>
    </div>
  )
}

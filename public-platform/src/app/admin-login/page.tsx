"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    await new Promise((r) => setTimeout(r, 600))

    if (credentials.username === "admin" && credentials.password === "cplp2024") {
      localStorage.setItem(
        "admin_session",
        JSON.stringify({
          user: credentials.username,
          timestamp: Date.now(),
          expires: Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
        }),
      )
      router.push("/admin")
    } else {
      setError("Credenciais inválidas. Verifique o utilizador e a senha.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#E8EEF8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl p-10 shadow-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Image src="/cn_illp.png" alt="CN-IILP" width={110} height={110} className="object-contain mb-1" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Entre na sua conta</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="admin@cnlp.ao"
                required
                autoComplete="username"
                className="bg-[#EEF2FF] border-transparent focus-visible:border-blue-400 focus-visible:ring-0 rounded-lg h-11 text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setShowHint(!showHint)}
                >
                  Esqueceu-se?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="pr-12 bg-[#EEF2FF] border-transparent focus-visible:border-blue-400 focus-visible:ring-0 rounded-lg h-11 text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
              />
              <label htmlFor="remember" className="text-sm text-slate-500 select-none cursor-pointer">
                Manter sessão iniciada
              </label>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 rounded-xl">
                <AlertDescription className="text-sm font-medium text-red-600">{error}</AlertDescription>
              </Alert>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold rounded-lg transition-colors mt-2 flex items-center justify-center"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  A verificar...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="border-t border-slate-100 mt-6 pt-4">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="flex items-center justify-between w-full text-xs font-medium text-slate-400 hover:text-slate-500 transition-colors"
            >
              <span>Credenciais de demonstração</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showHint ? "rotate-180" : ""}`} />
            </button>
            {showHint && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <span>
                  Utilizador:{" "}
                  <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">admin</code>
                </span>
                <span>
                  Senha:{" "}
                  <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">cplp2024</code>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <p className="text-center mt-5 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-700 transition-colors">
            ← Voltar ao Portal Público
          </Link>
        </p>
      </div>
    </div>
  )
}

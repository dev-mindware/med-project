// Deteta grafias pré-AO90, brasileirismos e texto em inglês conhecidos na interface.
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const rules = [
  [/\b[Aa]ctividades?\b/, "atividade(s)"],
  [/\b[Aa]ctualiz\w+/, "atualiz-"],
  [/\b[Cc]orrect[oa]s?\b/, "correto/a"],
  [/\b[Dd]idáctic\w+/, "didátic-"],
  [/\b[Oo]bjectivos?\b/, "objetivo(s)"],
  [/\b[Dd]efectivo/, "defetivo"],
  [/\b[Mm]ídias?\b/, "multimédia"],
  [/\bSobrenomes?\b/, "apelido(s)"],
  [/\b[Ee]m andamento\b/, "em curso"],
  [/>Close<|>Previous slide<|>Next slide<|>More<|Toggle Sidebar/, "texto em inglês"],
]

let bad = 0
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path)
    else if (/\.(tsx|ts)$/.test(name)) {
      readFileSync(path, "utf8").split("\n").forEach((line, i) => {
        if (/^\s*(import|\/\/)/.test(line)) return
        for (const [re, hint] of rules) {
          if (re.test(line)) {
            console.log(`${path}:${i + 1}: ${hint}`)
            bad++
          }
        }
      })
    }
  }
}
walk("src")
process.exit(bad ? 1 : 0)

"use client"

import { useEffect, useState } from "react"

const images = [
  "/angolan-cultural-festival.jpg",
  "/angolan-culture-traditional-dance.jpg",
  "/damian-patkowski-T-LfvX-7IVg-unsplash.jpg",
  "/ninno-jackjr-CG6Gd__QIOY-unsplash.jpg",
]

/**
 * Fundo rotativo do topo da página inicial. Só a primeira imagem entra no carregamento
 * inicial; as outras são pedidas depois de a página estar pronta, para não competirem
 * com o texto e os estilos.
 */
export function HeroSlides() {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const load = () => setCount(images.length)
    if (document.readyState === "complete") {
      const timer = window.setTimeout(load, 1500)
      return () => window.clearTimeout(timer)
    }
    let timer: number | undefined
    const onLoad = () => {
      timer = window.setTimeout(load, 1500)
    }
    window.addEventListener("load", onLoad, { once: true })
    return () => {
      window.removeEventListener("load", onLoad)
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="absolute inset-0">
      {images.slice(0, count).map((image, index) => (
        <img
          key={image}
          src={image}
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority={index === 0 ? "high" : "low"}
          className="absolute inset-0 h-full w-full object-cover opacity-0"
          style={{
            animation: "heroImageFade 28s ease-in-out infinite",
            animationDelay: `${index * 7}s`,
          }}
        />
      ))}
    </div>
  )
}

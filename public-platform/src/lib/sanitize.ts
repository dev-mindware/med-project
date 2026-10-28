import sanitizeHtml from "sanitize-html"

/** HTML editorial seguro: mantém a formatação de texto, ligações e imagens; remove scripts e eventos. */
export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption", "h1", "h2", "h3", "u", "s", "iframe"]),
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      iframe: ["src", "width", "height", "allowfullscreen", "title"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
  })
}

import os
import sys
import time
import json
import cairo

# Disable hardware compositing/GL in GTK WebKit2 for pure software headless rendering
os.environ["WEBKIT_DISABLE_COMPOSITING_MODE"] = "1"
os.environ["LIBGL_ALWAYS_SOFTWARE"] = "1"
os.environ["GDK_BACKEND"] = "x11"

import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gtk, WebKit2, GLib

BASE_URL = "http://localhost:3000"
BASE_DIR = "/home/jonatao-cardoso/Documents/GitHub/med-project/capturas_por_seccao_public_platform"

PAGES = [
    ("01_Pagina_Inicial", f"{BASE_URL}/", "Página Inicial / Home"),
    ("02_Sobre", f"{BASE_URL}/about", "Sobre a CNLP / Missão"),
    ("03_Eventos_Lista", f"{BASE_URL}/events", "Agenda e Lista de Eventos"),
    ("04_Evento_Detalhes", f"{BASE_URL}/events/052df2e4-5e2e-4598-bead-dcc92cabb1ae", "Detalhes de Evento Específico"),
    ("05_Evento_Inscricao", f"{BASE_URL}/events/052df2e4-5e2e-4598-bead-dcc92cabb1ae/inscricao", "Formulário de Inscrição em Evento"),
    ("06_Artigos_Lista", f"{BASE_URL}/articles", "Publicações e Lista de Artigos"),
    ("07_Artigo_Detalhes", f"{BASE_URL}/articles/d9a7fbb0-5ad5-4eac-9215-85283fb7cf85", "Detalhes de Artigo Específico"),
    ("08_Dicionario_Lista", f"{BASE_URL}/dictionary", "Dicionário de Termos - Lista"),
    ("09_Dicionario_Flipbook", f"{BASE_URL}/dictionary/flip", "Dicionário de Termos - Flipbook"),
    ("10_Neologismos_Lista", f"{BASE_URL}/neologismos", "Neologismos - Lista"),
    ("11_Neologismos_Flipbook", f"{BASE_URL}/neologismos/flip", "Neologismos - Flipbook"),
    ("12_Antroponimos_Lista", f"{BASE_URL}/antroponimos", "Antropónimos - Lista"),
    ("13_Antroponimos_Flipbook", f"{BASE_URL}/antroponimos/flip", "Antropónimos - Flipbook"),
    ("14_Toponimos_Lista", f"{BASE_URL}/toponimos", "Topónimos - Lista"),
    ("15_Toponimos_Flipbook", f"{BASE_URL}/toponimos/flip", "Topónimos - Flipbook"),
    ("16_Estrangeirismos_Lista", f"{BASE_URL}/estrangeirismos", "Estrangeirismos - Lista"),
    ("17_Estrangeirismos_Flipbook", f"{BASE_URL}/estrangeirismos/flip", "Estrangeirismos - Flipbook"),
    ("18_VOLNA_Lista", f"{BASE_URL}/volna", "Vocabulário VOLNA - Lista"),
    ("19_VOLNA_Flipbook", f"{BASE_URL}/volna/flip", "Vocabulário VOLNA - Flipbook"),
    ("20_VONALP_Lista", f"{BASE_URL}/vonalp", "Vocabulário VONALP - Lista"),
    ("21_VONALP_Flipbook", f"{BASE_URL}/vonalp/flip", "Vocabulário VONALP - Flipbook"),
    ("22_VONALP_EP_Lista", f"{BASE_URL}/vonalp-ep", "Vocabulário VONALP-EP - Lista"),
    ("23_VONALP_EP_Flipbook", f"{BASE_URL}/vonalp-ep/flip", "Vocabulário VONALP-EP - Flipbook"),
]

RESULTS_SUMMARY = {}

def capture_laptop_page_sections(page_folder, url, page_title, width=1920, height=1080):
    folder_path = os.path.join(BASE_DIR, page_folder)
    os.makedirs(folder_path, exist_ok=True)
    
    print(f"\n==========================================")
    print(f"[INSTANT REVEAL 100% VISIBLE LAPTOP] {page_title}")
    print(f"URL: {url}")
    print(f"Pasta Destino: {page_folder}/")
    print(f"==========================================")

    window = Gtk.OffscreenWindow()
    # 1920 x 1080 Full HD Laptop Screen Viewport
    window.set_default_size(width, height)
    
    web_view = WebKit2.WebView()
    web_view.set_zoom_level(1.0)
    
    settings = web_view.get_settings()
    settings.set_enable_javascript(True)
    settings.set_enable_webgl(False)
    
    window.add(web_view)
    window.show_all()

    loop = GLib.MainLoop()

    def on_load_changed(view, load_event):
        if load_event == WebKit2.LoadEvent.FINISHED:
            GLib.timeout_add(1000, apply_instant_reveal_and_grouping)

    def apply_instant_reveal_and_grouping():
        js_code = r"""
        (function() {
            // 1. Scroll down gradually to trigger IntersectionObservers
            const totalH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            for (let y = 0; y <= totalH; y += 250) {
                window.scrollTo(0, y);
            }
            window.scrollTo(0, 0);

            // 2. Inject master CSS that disables ALL transitions & animations instantly
            let style = document.getElementById('instant-reveal-master');
            if (!style) {
                style = document.createElement('style');
                style.id = 'instant-reveal-master';
                style.innerHTML = `
                    /* Disable transitions globally so elements reveal instantly without waiting 0.75s */
                    *, *::before, *::after {
                        transition: none !important;
                        transition-duration: 0s !important;
                        animation: none !important;
                        animation-duration: 0s !important;
                    }

                    /* Unhide reveal-on-scroll elements with 100% opacity and no blur/transform */
                    .reveal-on-scroll,
                    .reveal-on-scroll.is-visible,
                    [class*="reveal"],
                    [class*="animate-"],
                    main [class*="opacity-0"],
                    main [class*="blur"] {
                        opacity: 1 !important;
                        filter: none !important;
                        transform: none !important;
                        visibility: visible !important;
                    }

                    /* Keep Header Navbar Dropdown Panels CLOSED/HIDDEN */
                    header .pointer-events-none,
                    header [class*="group-hover/nav"]:not(:hover) > div,
                    header [class*="group-hover/nav"]:not(:hover) .pointer-events-none {
                        opacity: 0 !important;
                        visibility: hidden !important;
                        pointer-events: none !important;
                    }
                `;
                document.head.appendChild(style);
            }

            // 3. Mark all reveal elements as is-visible
            document.querySelectorAll('.reveal-on-scroll, [class*="reveal"]').forEach(el => {
                el.classList.add('is-visible');
                el.style.opacity = '1';
                el.style.filter = 'none';
                el.style.transform = 'none';
                el.style.visibility = 'visible';
            });

            window.dispatchEvent(new Event('scroll'));

            // 4. Gather raw section bounds
            const rawSections = [];
            
            // Header
            const header = document.querySelector('header');
            if (header) {
                const r = header.getBoundingClientRect();
                if (r.height > 10) {
                    rawSections.push({
                        type: 'header',
                        label: 'Cabecalho',
                        x: Math.round(r.x), y: Math.round(r.y + window.scrollY),
                        w: Math.round(r.width), h: Math.round(r.height)
                    });
                }
            }
            
            // Main Content Sections
            const main = document.querySelector('main');
            if (main) {
                let blocks = Array.from(main.querySelectorAll('section'));
                if (blocks.length === 0) {
                    blocks = Array.from(main.children);
                }
                
                blocks.forEach((child) => {
                    const r = child.getBoundingClientRect();
                    if (r.height > 20) {
                        let heading = child.querySelector('h1, h2, h3, h4')?.innerText || '';
                        heading = heading.replace(/[\n\r\t]/g, ' ').trim();
                        heading = heading.replace(/[^a-zA-Z0-9-áàâãéèêíóòôõúçÁÀÂÃÉÈÍÓÒÔÕÚÇ ]/g, '').trim();
                        heading = heading.replace(/\s+/g, '_').substring(0, 35);
                        
                        rawSections.push({
                            type: 'main_block',
                            label: heading || 'Seccao',
                            x: Math.round(r.x), y: Math.round(r.y + window.scrollY),
                            w: Math.round(r.width), h: Math.round(r.height)
                        });
                    }
                });
            }
            
            // Footer
            const footer = document.querySelector('footer');
            if (footer) {
                const r = footer.getBoundingClientRect();
                if (r.height > 10) {
                    rawSections.push({
                        type: 'footer',
                        label: 'Rodape_Footer',
                        x: Math.round(r.x), y: Math.round(r.y + window.scrollY),
                        w: Math.round(r.width), h: Math.round(r.height)
                    });
                }
            }

            // Grouping Rules:
            // - Merge Header (Navbar) + First Main Section (Hero) into "01_Cabecalho_e_Hero"
            // - Merge any small section (< 350px height) with the section below it
            const grouped = [];
            let i = 0;

            while (i < rawSections.length) {
                let current = rawSections[i];

                if (current.type === 'header' && i + 1 < rawSections.length && rawSections[i+1].type === 'main_block') {
                    const next = rawSections[i+1];
                    const minY = Math.min(current.y, next.y);
                    const maxY = Math.max(current.y + current.h, next.y + next.h);
                    const maxW = Math.max(current.w, next.w);
                    
                    grouped.push({
                        name: '01_Cabecalho_e_Hero',
                        x: current.x, y: minY,
                        w: maxW, h: (maxY - minY)
                    });
                    i += 2;
                    continue;
                }

                if (current.h < 350 && i + 1 < rawSections.length && rawSections[i+1].type !== 'footer') {
                    const next = rawSections[i+1];
                    const minY = Math.min(current.y, next.y);
                    const maxY = Math.max(current.y + current.h, next.y + next.h);
                    const maxW = Math.max(current.w, next.w);
                    
                    const idx = (grouped.length + 1).toString().padStart(2, '0');
                    const nextLabel = next.label || 'Conteudo';
                    const combinedLabel = `${idx}_Descricao_e_${nextLabel}`;
                    
                    grouped.push({
                        name: combinedLabel,
                        x: current.x, y: minY,
                        w: maxW, h: (maxY - minY)
                    });
                    i += 2;
                    continue;
                }

                const idx = (grouped.length + 1).toString().padStart(2, '0');
                let secName = `${idx}_${current.label}`;
                if (current.type === 'footer') secName = `${idx}_Rodape_Footer`;

                grouped.push({
                    name: secName,
                    x: current.x, y: current.y,
                    w: current.w, h: current.h
                });
                i += 1;
            }

            return JSON.stringify(grouped);
        })()
        """
        web_view.run_javascript(js_code, None, on_js_finished, None)

    def on_js_finished(view, result, data):
        try:
            js_val = view.run_javascript_finish(result)
            json_str = js_val.get_js_value().to_string()
            
            # Wait 1500ms so DOM reflow and font settling are 100% complete
            GLib.timeout_add(1500, lambda: process_snapshot(view, json_str))
        except Exception as e:
            print(f"ERRO ao analisar seções para {url}: {e}")
            loop.quit()

    def process_snapshot(view, json_str):
        web_view.get_snapshot(
            WebKit2.SnapshotRegion.FULL_DOCUMENT,
            WebKit2.SnapshotOptions.NONE,
            None,
            lambda v, res, d: on_snapshot_ready(v, res, json_str),
            None
        )

    def on_snapshot_ready(view, result, json_str):
        try:
            full_surface = view.get_snapshot_finish(result)
            sections_data = json.loads(json_str)
            
            saved_sections = []
            
            for sec in sections_data:
                x, y, w, h = sec['x'], sec['y'], sec['w'], sec['h']
                if w <= 0 or h <= 0:
                    continue
                
                # Precise 1:1 Cairo surface crop
                sub_surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, int(w), int(h))
                ctx = cairo.Context(sub_surface)
                ctx.set_source_surface(full_surface, -int(x), -int(y))
                ctx.paint()
                
                filename = f"{sec['name']}.png"
                out_path = os.path.join(folder_path, filename)
                sub_surface.write_to_png(out_path)
                
                size_kb = os.path.getsize(out_path) / 1024
                print(f"  ├─ [100% Instant Visible] {filename} ({w}x{h}px, {size_kb:.1f} KB)")
                
                saved_sections.append({
                    "name": sec['name'],
                    "filename": filename,
                    "width": w,
                    "height": h,
                    "size_kb": round(size_kb, 1)
                })
            
            RESULTS_SUMMARY[page_folder] = {
                "title": page_title,
                "url": url,
                "sections": saved_sections
            }
            print(f"  └─ Concluído: {len(saved_sections)} seções salvas.")
        except Exception as e:
            print(f"ERRO ao processar snapshot de {url}: {e}")
        finally:
            loop.quit()

    web_view.connect("load-changed", on_load_changed)
    web_view.load_uri(url)
    loop.run()

def generate_index_markdown():
    index_path = os.path.join(BASE_DIR, "INDEX.md")
    lines = [
        "# Relatório de Capturas Inteligentes (100% Componentes Revelados sem Animação) - Public Platform",
        "",
        f"**Data da Captura:** {time.strftime('%Y-%m-%d %H:%M:%S')}",
        "**Ambiente de Origem:** `http://localhost:3000`",
        "**Resolução de Layout Laptop:** `1920 x 1080 (Full HD Laptop Display)`",
        "",
        "> [!IMPORTANT]",
        "> **Recursos Especiais Aplicados:**",
        "> 1. **Zero Animações / Revelação Instantânea (100% Visível)**: Anulações globais de transição CSS (`transition: none !important`) foram injetadas para garantir que todos os elementos com animação *reveal on scroll* ou fade apareçam 100% visíveis, sem desfoque, transparência ou transições parciais.",
        "> 2. **Proporção Real de Laptop (1920px)**: Todas as imagens foram renderizadas na proporção nativa de ecrã de laptop (1920px com menus horizontais desktop e grelhas de 3 colunas).",
        "> 3. **Agrupamento Inteligente**: Secções curtas (ex: Navbar + Hero, Descrição + Conteúdo) unificadas para melhor contexto.",
        "> 4. **Navbar Limpa**: Os menus dropdown da barra de navegação permanecem fechados.",
        "",
        "## Índice Geral de Páginas e Secções em Layout Laptop",
        ""
    ]

    for page_folder, url, page_title in PAGES:
        info = RESULTS_SUMMARY.get(page_folder)
        if not info:
            continue
        
        lines.append(f"### {page_folder.replace('_', ' ')} — [{page_title}]({url})")
        lines.append(f"**Pasta:** [`{page_folder}/`](./{page_folder}/) | **URL:** `{url}` | **Total de Imagens:** {len(info['sections'])}\n")
        lines.append("| Seq | Nome da Secção Agrupada | Ficheiro | Resolução Laptop | Tamanho |")
        lines.append("| --- | --- | --- | --- | --- |")
        
        for idx, sec in enumerate(info['sections'], 1):
            rel_file = f"{page_folder}/{sec['filename']}"
            lines.append(f"| {idx:02d} | `{sec['name']}` | [{sec['filename']}](./{rel_file}) | **{sec['width']}x{sec['height']}px** | {sec['size_kb']} KB |")
        
        lines.append("")

    lines.append("---\n*Relatório e capturas em layout de laptop com 100% dos componentes revelados gerados automaticamente.*")
    
    with open(index_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"\n[Índice Geral] Ficheiro INDEX.md gerado com sucesso em: {index_path}")

if __name__ == "__main__":
    start_time = time.time()
    for page_folder, url, page_title in PAGES:
        capture_laptop_page_sections(page_folder, url, page_title)
    
    generate_index_markdown()
    total_time = time.time() - start_time
    print(f"\n==========================================")
    print(f"PROCESSO REVEAL FIX COMPLETO EM {total_time:.2f} SEGUNDOS!")
    print(f"==========================================")

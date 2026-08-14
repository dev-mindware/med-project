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

def capture_hd_page_sections(page_folder, url, page_title, width=1920, height=1080):
    folder_path = os.path.join(BASE_DIR, page_folder)
    os.makedirs(folder_path, exist_ok=True)
    
    print(f"\n==========================================")
    print(f"[HD PÁGINA] {page_title}")
    print(f"URL: {url}")
    print(f"Pasta Destino: {page_folder}/")
    print(f"==========================================")

    window = Gtk.OffscreenWindow()
    # Standard HD Viewport: 1920 x 1080
    window.set_default_size(width, height)
    
    web_view = WebKit2.WebView()
    settings = web_view.get_settings()
    settings.set_enable_javascript(True)
    settings.set_enable_webgl(False)
    
    window.add(web_view)
    window.show_all()

    loop = GLib.MainLoop()

    def on_load_changed(view, load_event):
        if load_event == WebKit2.LoadEvent.FINISHED:
            GLib.timeout_add(1000, trigger_full_reveal)

    def trigger_full_reveal():
        # Step 1: Scroll to bottom in increments to trigger IntersectionObserver
        js_prepare = r"""
        (function() {
            // Scroll down gradually to trigger observers
            const totalH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            for (let y = 0; y <= totalH; y += 250) {
                window.scrollTo(0, y);
            }
            window.scrollTo(0, 0);

            // Add is-visible class and inline style overrides to reveal-on-scroll elements ONLY
            document.querySelectorAll('.reveal-on-scroll, [class*="reveal"]').forEach(el => {
                el.classList.add('is-visible');
                el.style.opacity = '1';
                el.style.filter = 'none';
                el.style.transform = 'none';
                el.style.visibility = 'visible';
            });

            // Inject targeted CSS override: reveal motion components while strictly HIDING navbar dropdowns
            let style = document.getElementById('strict-reveal-override');
            if (!style) {
                style = document.createElement('style');
                style.id = 'strict-reveal-override';
                style.innerHTML = `
                    .reveal-on-scroll {
                        opacity: 1 !important;
                        transform: none !important;
                        filter: none !important;
                        visibility: visible !important;
                    }
                    .reveal-on-scroll.is-visible {
                        opacity: 1 !important;
                        transform: none !important;
                        filter: none !important;
                        visibility: visible !important;
                    }
                    /* Ensure Header Navbar Dropdown Panels stay CLOSED/HIDDEN */
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

            // Dispatch scroll event
            window.dispatchEvent(new Event('scroll'));

            // Gather sections
            const sections = [];
            
            // Header
            const header = document.querySelector('header');
            if (header) {
                const r = header.getBoundingClientRect();
                if (r.height > 10) {
                    sections.push({
                        name: '01_Cabecalho_Header',
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
                        
                        const idx = (sections.length + 1).toString().padStart(2, '0');
                        const nameSlug = heading || ('Seccao_' + (sections.length + 1));
                        const secName = `${idx}_${nameSlug}`;
                        
                        sections.push({
                            name: secName,
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
                    const idx = (sections.length + 1).toString().padStart(2, '0');
                    sections.push({
                        name: `${idx}_Rodape_Footer`,
                        x: Math.round(r.x), y: Math.round(r.y + window.scrollY),
                        w: Math.round(r.width), h: Math.round(r.height)
                    });
                }
            }
            
            return JSON.stringify(sections);
        })()
        """
        web_view.run_javascript(js_prepare, None, on_js_finished, None)

    def on_js_finished(view, result, data):
        try:
            js_val = view.run_javascript_finish(result)
            json_str = js_val.get_js_value().to_string()
            
            # Snapshot FULL DOCUMENT in HD
            web_view.get_snapshot(
                WebKit2.SnapshotRegion.FULL_DOCUMENT,
                WebKit2.SnapshotOptions.NONE,
                None,
                lambda v, res, d: process_snapshot(v, res, json_str),
                None
            )
        except Exception as e:
            print(f"ERRO ao analisar seções para {url}: {e}")
            loop.quit()

    def process_snapshot(view, result, json_str):
        try:
            full_surface = view.get_snapshot_finish(result)
            sections_data = json.loads(json_str)
            
            saved_sections = []
            
            for sec in sections_data:
                x, y, w, h = sec['x'], sec['y'], sec['w'], sec['h']
                if w <= 0 or h <= 0:
                    continue
                
                # Precise 1:1 HD Cairo surface crop
                sub_surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, int(w), int(h))
                ctx = cairo.Context(sub_surface)
                ctx.set_source_surface(full_surface, -int(x), -int(y))
                ctx.paint()
                
                filename = f"{sec['name']}.png"
                out_path = os.path.join(folder_path, filename)
                sub_surface.write_to_png(out_path)
                
                size_kb = os.path.getsize(out_path) / 1024
                print(f"  ├─ [HD Clean Navbar] {filename} ({w}x{h}px, {size_kb:.1f} KB)")
                
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
            print(f"ERRO ao processar snapshot HD de {url}: {e}")
        finally:
            loop.quit()

    web_view.connect("load-changed", on_load_changed)
    web_view.load_uri(url)
    loop.run()

def generate_index_markdown():
    index_path = os.path.join(BASE_DIR, "INDEX.md")
    lines = [
        "# Relatório de Capturas por Secção (Resolução HD & Dropdown Fechado) - Public Platform",
        "",
        f"**Data da Captura:** {time.strftime('%Y-%m-%d %H:%M:%S')}",
        "**Ambiente de Origem:** `http://localhost:3000`",
        "**Resolução do Viewport:** `1920 x 1080 (HD Padronizado)`",
        "",
        "> [!IMPORTANT]",
        "> **Recursos Especiais Aplicados:**",
        "> 1. **Resolução HD Normal**: Renderização padronizada a 1920px de largura sem distorção visual.",
        "> 2. **Revelação dos Componentes de Scroll**: Todos os componentes animados (como cartões de artigos, atividades e recursos) foram 100% revelados.",
        "> 3. **Navbar Dropdown Fechado**: Garantia estrita de que os painéis de menu dropdown da barra de navegação permanecem fechados/ocultos em todas as capturas.",
        "> 4. **Organização Sequencial**: Cada secção está organizada na sua pasta correspondente e numerada sequencialmente.",
        "",
        "## Índice Geral de Páginas e Secções",
        ""
    ]

    for page_folder, url, page_title in PAGES:
        info = RESULTS_SUMMARY.get(page_folder)
        if not info:
            continue
        
        lines.append(f"### {page_folder.replace('_', ' ')} — [{page_title}]({url})")
        lines.append(f"**Pasta:** [`{page_folder}/`](./{page_folder}/) | **URL:** `{url}` | **Total de Secções:** {len(info['sections'])}\n")
        lines.append("| Seq | Nome da Secção | Ficheiro | Resolução HD | Tamanho |")
        lines.append("| --- | --- | --- | --- | --- |")
        
        for idx, sec in enumerate(info['sections'], 1):
            rel_file = f"{page_folder}/{sec['filename']}"
            lines.append(f"| {idx:02d} | `{sec['name']}` | [{sec['filename']}](./{rel_file}) | **{sec['width']}x{sec['height']}px** | {sec['size_kb']} KB |")
        
        lines.append("")

    lines.append("---\n*Relatório e capturas em resolução HD com navbar fechado gerados automaticamente.*")
    
    with open(index_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"\n[Índice Geral HD] Ficheiro INDEX.md gerado com sucesso em: {index_path}")

if __name__ == "__main__":
    start_time = time.time()
    for page_folder, url, page_title in PAGES:
        capture_hd_page_sections(page_folder, url, page_title)
    
    generate_index_markdown()
    total_time = time.time() - start_time
    print(f"\n==========================================")
    print(f"PROCESSO HD REVEAL & NAVBAR CLEAN COMPLETO EM {total_time:.2f} SEGUNDOS!")
    print(f"==========================================")

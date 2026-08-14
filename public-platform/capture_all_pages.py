import os
import sys
import time

# Disable hardware compositing/GL in GTK WebKit2 so it runs reliably in headless mode
os.environ["WEBKIT_DISABLE_COMPOSITING_MODE"] = "1"
os.environ["LIBGL_ALWAYS_SOFTWARE"] = "1"
os.environ["GDK_BACKEND"] = "x11"

import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gtk, WebKit2, GLib

BASE_URL = "http://localhost:3000"
BASE_DIR = "/home/jonatao-cardoso/Documents/GitHub/med-project/capturas_relatorio_public_platform"

TARGETS = [
    # 01_Principais
    ("01_Principais", "01_Pagina_Inicial.png", f"{BASE_URL}/"),
    ("01_Principais", "02_Sobre.png", f"{BASE_URL}/about"),
    ("01_Principais", "03_Eventos_Lista.png", f"{BASE_URL}/events"),
    ("01_Principais", "04_Evento_Detalhes.png", f"{BASE_URL}/events/052df2e4-5e2e-4598-bead-dcc92cabb1ae"),
    ("01_Principais", "05_Evento_Inscricao.png", f"{BASE_URL}/events/052df2e4-5e2e-4598-bead-dcc92cabb1ae/inscricao"),
    ("01_Principais", "06_Artigos_Lista.png", f"{BASE_URL}/articles"),
    ("01_Principais", "07_Artigo_Detalhes.png", f"{BASE_URL}/articles/d9a7fbb0-5ad5-4eac-9215-85283fb7cf85"),
    
    # 02_Dicionario
    ("02_Dicionario", "01_Dicionario_Lista.png", f"{BASE_URL}/dictionary"),
    ("02_Dicionario", "02_Dicionario_Flipbook.png", f"{BASE_URL}/dictionary/flip"),
    
    # 03_Neologismos
    ("03_Neologismos", "01_Neologismos_Lista.png", f"{BASE_URL}/neologismos"),
    ("03_Neologismos", "02_Neologismos_Flipbook.png", f"{BASE_URL}/neologismos/flip"),
    
    # 04_Antroponimos
    ("04_Antroponimos", "01_Antroponimos_Lista.png", f"{BASE_URL}/antroponimos"),
    ("04_Antroponimos", "02_Antroponimos_Flipbook.png", f"{BASE_URL}/antroponimos/flip"),
    
    # 05_Toponimos
    ("05_Toponimos", "01_Toponimos_Lista.png", f"{BASE_URL}/toponimos"),
    ("05_Toponimos", "02_Toponimos_Flipbook.png", f"{BASE_URL}/toponimos/flip"),
    
    # 06_Estrangeirismos
    ("06_Estrangeirismos", "01_Estrangeirismos_Lista.png", f"{BASE_URL}/estrangeirismos"),
    ("06_Estrangeirismos", "02_Estrangeirismos_Flipbook.png", f"{BASE_URL}/estrangeirismos/flip"),
    
    # 07_Vocabularios_Especiais
    ("07_Vocabularios_Especiais", "01_VOLNA_Lista.png", f"{BASE_URL}/volna"),
    ("07_Vocabularios_Especiais", "02_VOLNA_Flipbook.png", f"{BASE_URL}/volna/flip"),
    ("07_Vocabularios_Especiais", "03_VONALP_Lista.png", f"{BASE_URL}/vonalp"),
    ("07_Vocabularios_Especiais", "04_VONALP_Flipbook.png", f"{BASE_URL}/vonalp/flip"),
    ("07_Vocabularios_Especiais", "05_VONALP_EP_Lista.png", f"{BASE_URL}/vonalp-ep"),
    ("07_Vocabularios_Especiais", "06_VONALP_EP_Flipbook.png", f"{BASE_URL}/vonalp-ep/flip"),
]

def capture_single(subfolder, filename, url, width=1920, height=1080):
    folder_path = os.path.join(BASE_DIR, subfolder)
    os.makedirs(folder_path, exist_ok=True)
    out_file = os.path.join(folder_path, filename)
    
    print(f"\n[Capturando] {url} -> {subfolder}/{filename}")
    
    window = Gtk.OffscreenWindow()
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
            GLib.timeout_add(1500, capture_snapshot)

    def capture_snapshot():
        web_view.get_snapshot(
            WebKit2.SnapshotRegion.FULL_DOCUMENT,
            WebKit2.SnapshotOptions.NONE,
            None,
            on_snapshot_ready,
            None
        )

    def on_snapshot_ready(view, result, data):
        try:
            surface = view.get_snapshot_finish(result)
            surface.write_to_png(out_file)
            size_kb = os.path.getsize(out_file) / 1024
            print(f"  └─ OK: Salvo em {subfolder}/{filename} ({size_kb:.1f} KB)")
        except Exception as e:
            print(f"  └─ ERRO ao capturar {url}: {e}")
        finally:
            loop.quit()

    web_view.connect("load-changed", on_load_changed)
    web_view.load_uri(url)
    loop.run()

def generate_index_markdown():
    index_path = os.path.join(BASE_DIR, "INDEX.md")
    content = [
        "# Relatório de Capturas de Tela - Public Platform",
        "",
        f"**Data da Captura:** {time.strftime('%Y-%m-%d %H:%M:%S')}",
        "**Ambiente:** `http://localhost:3000`",
        "",
        "## Estrutura das Capturas",
        "",
        "| Categoria | Ficheiro | URL | Descrição |",
        "| --- | --- | --- | --- |"
    ]

    for subfolder, filename, url in TARGETS:
        rel_path = f"{subfolder}/{filename}"
        desc = filename.replace('.png', '').replace('_', ' ')
        content.append(f"| `{subfolder}` | [{filename}](./{rel_path}) | `{url}` | {desc} |")

    content.append("\n---\n*Capturas geradas automaticamente em formato PNG de alta resolução.*")
    
    with open(index_path, "w", encoding="utf-8") as f:
        f.write("\n".join(content))
    print(f"\n[Índice] Gerado com sucesso em {index_path}")

if __name__ == "__main__":
    start_time = time.time()
    for subfolder, filename, url in TARGETS:
        capture_single(subfolder, filename, url)
    
    generate_index_markdown()
    elapsed = time.time() - start_time
    print(f"\nProcesso concluído com sucesso em {elapsed:.2f} segundos!")

"""Abre o site localmente:  python servidor.py   ->  http://localhost:8000"""
import http.server, socketserver

class H(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".webmanifest": "application/manifest+json", ".webp": "image/webp"}

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", 8000), H) as s:
    print("Abra no navegador: http://localhost:8000  (Ctrl+C para parar)")
    s.serve_forever()

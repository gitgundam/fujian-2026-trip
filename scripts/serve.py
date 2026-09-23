#!/usr/bin/env python3
"""Local preview; no cache avoids stale module graphs while editing static files."""
import argparse
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def do_GET(self):
        if 'If-Modified-Since' in self.headers:
            del self.headers['If-Modified-Since']
        super().do_GET()
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8773)
    parser.add_argument('--bind', default='127.0.0.1')
    args = parser.parse_args()
    directory = str(Path(__file__).resolve().parents[1])
    print(f'Preview: http://{args.bind}:{args.port}', flush=True)
    ThreadingHTTPServer((args.bind, args.port), partial(Handler, directory=directory)).serve_forever()

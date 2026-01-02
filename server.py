from http.server import SimpleHTTPRequestHandler, HTTPServer
import urllib.parse

PORT = 8080

# Optional: colors for pass/fail in terminal
COLORS = {
    "success": "\033[32m",     # green
    "error": "\033[31m",   # red
    "reset": "\033[0m"    # reset color
}

print("Python server starting…", flush=True)

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Intercept test result fetch
        if self.path.startswith("/__result__"):
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            test = params.get("test", ["?"])[0]
            status = params.get("status", ["?"])[0]
            message = params.get("message", [""])[0]

            # Print colored result
            color = COLORS.get(status.lower(), COLORS["reset"])
            print(f"{color}{message}{COLORS['reset']}", flush=True)
            # stop logging this request
            return
        else:
            # Serve normal static files
            super().do_GET()

    def log_message(self, format, *args):
        # Only log __result__ requests to keep terminal clean
        if "__result__" in args[0]:
            super().log_message(format, *args)

# Start server
server = HTTPServer(("0.0.0.0", PORT), Handler)
server.serve_forever()

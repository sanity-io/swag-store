import type {Plugin} from 'vite';

function isProbablyHtml(payload: string): boolean {
  const t = payload.trimStart();
  return t.startsWith('<!') || t.startsWith('<html');
}

/**
 * When MiniOxygen's worker loads SSR chunks it GETs `/__vite_fetch_module?...` and
 * calls `response.json()`. If anything returns an HTML document (wrong port, RR
 * catch-all, proxy), Node throws `Unexpected token '<', "<!DOCTYPE"...` with no
 * context. This middleware logs a short, actionable explanation plus the response
 * prefix when that happens — only in dev, only for that path.
 */
export function miniOxygenDevDiagnostics(): Plugin {
  return {
    name: 'mini-oxygen-dev-diagnostics',
    apply: 'serve',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/__vite_fetch_module')) {
          next();
          return;
        }

        const parts: Buffer[] = [];
        const origSetHeader = res.setHeader.bind(res);
        let contentType: string | number | readonly string[] | undefined;

        res.setHeader = (name: string, value: unknown) => {
          if (String(name).toLowerCase() === 'content-type') {
            contentType = value as typeof contentType;
          }
          return origSetHeader(name as never, value as never);
        };

        const origWrite = res.write.bind(res);
        res.write = function writeHook(
          chunk: unknown,
          ...args: unknown[]
        ): boolean {
          if (chunk != null && typeof chunk !== 'function') {
            parts.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
          }
          return (origWrite as (...a: unknown[]) => boolean)(chunk, ...args);
        };

        const origEnd = res.end.bind(res);
        res.end = function endHook(
          chunk?: unknown,
          encoding?: unknown,
          cb?: unknown,
        ) {
          if (chunk != null && typeof chunk !== 'function') {
            parts.push(
              Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)),
            );
          }

          const body = Buffer.concat(parts).toString('utf8');
          const ct = contentType != null ? String(contentType) : '';
          const looksHtml =
            (body.length > 0 &&
              (isProbablyHtml(body) ||
                ct.includes('text/html') ||
                (!ct.includes('json') && isProbablyHtml(body)))) ||
            (body.length > 0 && body.trimStart().startsWith('<') && !body.trimStart().startsWith('{'));

          if (looksHtml) {
            const preview = body.slice(0, 280).replace(/\s+/g, ' ');
            console.error('\n');
            console.error(
              '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓',
            );
            console.error(
              '┃ Hydrogen / MiniOxygen: SSR module fetch got HTML instead of JSON           ┃',
            );
            console.error(
              '┃                                                                             ┃',
            );
            console.error(
              '┃ The worker requested /__vite_fetch_module (Vite SSR transport).             ┃',
            );
            console.error(
              '┃ A plain HTML Response here is why you see:                                   ┃',
            );
            console.error(
              '┃   SyntaxError: Unexpected token "<", "<!DOCTYPE"... is not valid JSON        ┃',
            );
            console.error(
              '┃                                                                             ┃',
            );
            console.error(
              '┃ Likely causes:                                                               ┃',
            );
            console.error(
              '┃  • Wrong origin/port — use the exact "Local:" URL from shopify hydrogen dev ┃',
            );
            console.error(
              '┃  • Another process on that port — lsof -nP -iTCP:PORT -sTCP:LISTEN           ┃',
            );
            console.error(
              '┃  • Tunnel/proxy not forwarding dev paths — try localhost without tunnel     ┃',
            );
            console.error(
              '┃  • Loopback IPv4 vs IPv6 — pnpm dev:diag:host or H2_DEV_HOST=1 (see package) ┃',
            );
            console.error(
              '┃  • Node 24 — try Node 22 LTS if issues persist (Hydrogen targets >=18)      ┃',
            );
            console.error(
              '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛',
            );
            console.error(`Content-Type: ${ct || '(unset)'}`);
            console.error(`Body preview: ${preview}${body.length > 280 ? '…' : ''}\n`);
          }

          if (typeof encoding === 'function') {
            return origEnd(chunk, encoding);
          }
          if (typeof cb === 'function') {
            return origEnd(chunk, encoding as BufferEncoding, cb);
          }
          return origEnd(chunk, encoding as BufferEncoding | undefined);
        };

        next();
      });
    },
  };
}

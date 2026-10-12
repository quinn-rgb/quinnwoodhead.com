/**
 * Edge auth gate for quinnwoodhead.com
 *
 * Everything except the landing page is checked here, at Cloudflare's edge,
 * before a single byte of HTML is served. The password lives in a Worker
 * secret — it is never in this repo and never reaches the browser.
 *
 * Set it with:   npx wrangler secret put SITE_PASSWORD
 *
 * The session cookie is signed with the password itself, so changing the
 * password automatically invalidates every outstanding session.
 */

const COOKIE = 'qw_auth';
const SESSION_DAYS = 30;

/** Paths anyone may reach without the password. */
const PUBLIC_PATHS = new Set([
	'/',
	'/index.html',
	'/favicon.svg',
	'/robots.txt',
	'/__auth',
]);

const enc = new TextEncoder();

function b64url(bytes) {
	let s = '';
	for (const b of bytes) s += String.fromCharCode(b);
	return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(value, secret) {
	const key = await crypto.subtle.importKey(
		'raw',
		enc.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
	return b64url(new Uint8Array(sig));
}

/** Length-independent comparison, so we don't leak the answer by timing. */
function safeEqual(a, b) {
	if (typeof a !== 'string' || typeof b !== 'string') return false;
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

function readCookie(request, name) {
	const header = request.headers.get('Cookie');
	if (!header) return null;
	for (const part of header.split(';')) {
		const idx = part.indexOf('=');
		if (idx === -1) continue;
		if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
	}
	return null;
}

async function makeToken(secret) {
	const exp = String(Date.now() + SESSION_DAYS * 86400 * 1000);
	return `${exp}.${await sign(exp, secret)}`;
}

async function tokenValid(token, secret) {
	if (!token) return false;
	const dot = token.lastIndexOf('.');
	if (dot === -1) return false;
	const exp = token.slice(0, dot);
	const sig = token.slice(dot + 1);
	if (!/^\d+$/.test(exp)) return false;
	if (Number(exp) < Date.now()) return false;
	return safeEqual(sig, await sign(exp, secret));
}

function isPublic(pathname) {
	if (PUBLIC_PATHS.has(pathname)) return true;
	// Astro emits the landing at "/" — allow its build assets through so the
	// door still paints for someone who does not have the password.
	if (pathname.startsWith('/_astro/')) return true;
	return false;
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const pathname = url.pathname;
		const secret = env.SITE_PASSWORD;

		// Fail closed. A missing secret must never mean "let everyone in".
		if (!secret) {
			if (isPublic(pathname) && pathname !== '/__auth') {
				return env.ASSETS.fetch(request);
			}
			return new Response(
				'Site password is not configured. Run: npx wrangler secret put SITE_PASSWORD',
				{ status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } }
			);
		}

		// ── the auth endpoint ───────────────────────────────────────────
		if (pathname === '/__auth') {
			if (request.method !== 'POST') {
				return new Response('Method not allowed', { status: 405 });
			}

			let submitted = '';
			try {
				const body = await request.json();
				submitted = typeof body?.password === 'string' ? body.password : '';
			} catch {
				submitted = '';
			}

			if (!safeEqual(submitted, secret)) {
				// Blunt the edge off automated guessing.
				await new Promise((r) => setTimeout(r, 450));
				return Response.json({ ok: false, error: 'Incorrect' }, { status: 401 });
			}

			const token = await makeToken(secret);
			const headers = new Headers({ 'content-type': 'application/json' });
			headers.append(
				'Set-Cookie',
				`${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`
			);
			return new Response(JSON.stringify({ ok: true, next: '/about' }), { headers });
		}

		// ── sign out ────────────────────────────────────────────────────
		if (pathname === '/__logout') {
			const headers = new Headers({ Location: '/' });
			headers.append(
				'Set-Cookie',
				`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
			);
			return new Response(null, { status: 302, headers });
		}

		// ── the gate ────────────────────────────────────────────────────
		if (isPublic(pathname)) {
			return env.ASSETS.fetch(request);
		}

		if (await tokenValid(readCookie(request, COOKIE), secret)) {
			return env.ASSETS.fetch(request);
		}

		// Not allowed in. Send people to the door; answer machines plainly.
		const wantsHtml = (request.headers.get('Accept') || '').includes('text/html');
		if (wantsHtml) {
			return Response.redirect(new URL('/', url).toString(), 302);
		}
		return new Response('Unauthorized', { status: 401 });
	},
};

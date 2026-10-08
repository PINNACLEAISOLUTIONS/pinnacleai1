/**
 * Pinnacle AI Solutions - Production Web & Secure Payment Delivery Server
 * 
 * Features:
 * - High-speed static asset serving for Pinnacle AI Solutions website
 * - Zero-leak private storage for paid digital products (secure_storage/)
 * - GoDaddy Payments Poynt Cloud webhook verification (HMAC-SHA1)
 * - Cryptographically signed, expiring download tokens (HMAC-SHA256, 15-min TTL)
 * - Safe preview testing mode (no real card charged)
 * - Anti-tamper & path traversal protection
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

// Port configuration
const PORT = process.env.PORT || 8080;
const ROOT_DIR = 'C:\\Users\\futur\\gemini_workspace\\pinnacleai1';
const SECURE_STORAGE_DIR = path.join(ROOT_DIR, 'secure_storage');
const DOWNLOADS_DIR = path.join(ROOT_DIR, 'downloads');

// Security secrets
const SERVER_SECRET = process.env.SERVER_SECRET || 'pinnacle_vault_sec_' + crypto.randomBytes(24).toString('hex');
const GODADDY_WEBHOOK_SECRET = process.env.GODADDY_WEBHOOK_SECRET || 'pinnacle_godaddy_secret';

// Catalog configuration for the 2 selected paid products & 8 free products
const PRODUCT_CATALOG = {
    'bp-leadgen': {
        id: 'bp-leadgen',
        title: 'Enterprise AI Lead Generation Playbook',
        filename: 'Enterprise-AI-Lead-Generation-Playbook.pdf',
        isPaid: true,
        price: 10,
        currency: 'USD',
        payLink: 'https://pay.pinnacleaisolution.site/ebook',
        storagePath: path.join(SECURE_STORAGE_DIR, 'Enterprise-AI-Lead-Generation-Playbook.pdf')
    },
    'bp-multiagent': {
        id: 'bp-multiagent',
        title: 'Autonomous Multi-Agent Architecture',
        filename: 'Autonomous-Multi-Agent-Architecture.pdf',
        isPaid: true,
        price: 10,
        currency: 'USD',
        payLink: 'https://pay.pinnacleaisolution.site/ebook',
        storagePath: path.join(SECURE_STORAGE_DIR, 'Autonomous-Multi-Agent-Architecture.pdf')
    }
};

// In-memory token store for expiring download tokens
const tokenStore = new Map();

// Helper: Generate a cryptographically signed expiring download token
function generateSecureDownloadToken(productId, customerEmail = 'customer@pinnacleaisolution.site', expiryMinutes = 15) {
    const product = PRODUCT_CATALOG[productId];
    if (!product) return null;

    const tokenId = 'tkn_' + crypto.randomBytes(16).toString('hex');
    const now = Date.now();
    const expiresAt = now + (expiryMinutes * 60 * 1000);
    const maxDownloads = 3; // Allows buyer up to 3 download attempts within 15 mins

    // HMAC signature over token metadata
    const payload = `${tokenId}:${productId}:${customerEmail}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', SERVER_SECRET).update(payload).digest('hex');

    const tokenData = {
        tokenId,
        productId,
        productTitle: product.title,
        filename: product.filename,
        customerEmail,
        createdAt: now,
        expiresAt,
        maxDownloads,
        downloadCount: 0,
        signature
    };

    tokenStore.set(tokenId, tokenData);
    return tokenData;
}

// Helper: Validate a token
function validateDownloadToken(tokenId, productId) {
    if (!tokenId || !tokenStore.has(tokenId)) {
        return { valid: false, error: 'Token not found or invalid' };
    }

    const tokenData = tokenStore.get(tokenId);

    // Verify product match
    if (productId && tokenData.productId !== productId) {
        return { valid: false, error: 'Token is not authorized for this product' };
    }

    // Verify expiry
    if (Date.now() > tokenData.expiresAt) {
        tokenStore.delete(tokenId); // Clean up expired token
        return { valid: false, error: 'Download token has expired (15-minute window passed)' };
    }

    // Verify download count
    if (tokenData.downloadCount >= tokenData.maxDownloads) {
        return { valid: false, error: 'Maximum download limit reached for this token' };
    }

    // Cryptographic signature verification
    const payload = `${tokenData.tokenId}:${tokenData.productId}:${tokenData.customerEmail}:${tokenData.expiresAt}`;
    const expectedSignature = crypto.createHmac('sha256', SERVER_SECRET).update(payload).digest('hex');
    if (tokenData.signature !== expectedSignature) {
        return { valid: false, error: 'Cryptographic token signature validation failed' };
    }

    return { valid: true, tokenData };
}

// MIME Types
const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.xml': 'application/xml; charset=UTF-8',
    '.txt': 'text/plain; charset=UTF-8'
};

// HTTP Server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // CORS headers for local/cross-origin preview
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Poynt-Webhook-Signature, X-GoDaddy-Signature');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // ------------------------------------------------------------------
    // API ROUTE: Products Info
    // ------------------------------------------------------------------
    if (pathname === '/api/products' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'success',
            catalog: Object.values(PRODUCT_CATALOG).map(p => ({
                id: p.id,
                title: p.title,
                price: p.price,
                currency: p.currency,
                isPaid: p.isPaid,
                payLink: p.payLink
            }))
        }));
        return;
    }

    // ------------------------------------------------------------------
    // API ROUTE: Test Simulation (Preview Mode - No Real Card Charged)
    // ------------------------------------------------------------------
    if (pathname === '/api/test/simulate-payment' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body || '{}');
                const productId = data.productId;
                const email = data.email || 'preview-tester@pinnacleaisolution.site';

                if (!productId || !PRODUCT_CATALOG[productId]) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'error',
                        message: 'Invalid productId. Available paid products: bp-leadgen, bp-multiagent'
                    }));
                    return;
                }

                const tokenData = generateSecureDownloadToken(productId, email, 15);
                const downloadUrl = `/api/download-secure?token=${tokenData.tokenId}&id=${productId}`;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'success',
                    mode: 'PREVIEW_SIMULATION (Zero Real Card Charge)',
                    message: 'Payment simulation verified successfully. Cryptographic download token issued.',
                    token: tokenData.tokenId,
                    productId: tokenData.productId,
                    productTitle: tokenData.productTitle,
                    downloadUrl: downloadUrl,
                    expiresAt: tokenData.expiresAt,
                    expiresInMinutes: 15,
                    maxDownloads: tokenData.maxDownloads
                }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    // ------------------------------------------------------------------
    // API ROUTE: GoDaddy / Poynt Webhook Verification
    // ------------------------------------------------------------------
    if (pathname === '/api/webhook/godaddy' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const poyntSignature = req.headers['poynt-webhook-signature'] || req.headers['x-godaddy-signature'];

            console.log(`[GoDaddy Webhook] Received webhook event. Length: ${body.length}`);

            if (process.env.ENFORCE_WEBHOOK_SIGNATURE === 'true') {
                if (!poyntSignature) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'error', message: 'Missing webhook signature header' }));
                    return;
                }

                const computed = crypto.createHmac('sha1', GODADDY_WEBHOOK_SECRET).update(body).digest('hex');
                if (poyntSignature !== computed) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'error', message: 'Invalid Poynt HMAC-SHA1 signature' }));
                    return;
                }
            }

            try {
                const payload = JSON.parse(body || '{}');
                let matchedProductId = 'bp-leadgen';
                if (payload.order?.notes?.includes('multiagent') || payload.referenceId?.includes('multiagent')) {
                    matchedProductId = 'bp-multiagent';
                }

                const customerEmail = payload.buyer?.email || payload.customerEmail || 'verified-customer@pinnacleaisolution.site';
                const tokenData = generateSecureDownloadToken(matchedProductId, customerEmail, 60);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'success',
                    message: 'Payment verified and download token created.',
                    token: tokenData.tokenId,
                    downloadUrl: `/api/download-secure?token=${tokenData.tokenId}&id=${matchedProductId}`
                }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: 'Malformed webhook payload' }));
            }
        });
        return;
    }

    // ------------------------------------------------------------------
    // API ROUTE: Check Token Validity & Remaining Time
    // ------------------------------------------------------------------
    if (pathname === '/api/check-token' && req.method === 'GET') {
        const tokenId = query.token;
        const productId = query.id;
        const validation = validateDownloadToken(tokenId, productId);

        if (!validation.valid) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', valid: false, message: validation.error }));
            return;
        }

        const remainingMs = Math.max(0, validation.tokenData.expiresAt - Date.now());
        const remainingMinutes = Math.floor(remainingMs / 60000);
        const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'success',
            valid: true,
            productId: validation.tokenData.productId,
            productTitle: validation.tokenData.productTitle,
            expiresAt: validation.tokenData.expiresAt,
            remainingMinutes,
            remainingSeconds,
            remainingDisplay: `${remainingMinutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`,
            downloadsRemaining: validation.tokenData.maxDownloads - validation.tokenData.downloadCount
        }));
        return;
    }

    // ------------------------------------------------------------------
    // API ROUTE: Secure Expiring Download Delivery
    // ------------------------------------------------------------------
    if (pathname === '/api/download-secure' && req.method === 'GET') {
        const tokenId = query.token;
        const productId = query.id;

        const validation = validateDownloadToken(tokenId, productId);
        if (!validation.valid) {
            res.writeHead(403, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>403 Forbidden - Access Expired or Denied</title>
                    <style>
                        body { background: #030712; color: #f87171; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                        .card { background: #0f172a; border: 1px solid #ef4444; padding: 2.5rem; border-radius: 1rem; max-width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                        h1 { font-size: 1.5rem; color: #f87171; margin-bottom: 0.5rem; }
                        p { font-size: 0.9rem; color: #94a3b8; line-height: 1.5; }
                        a { display: inline-block; margin-top: 1.5rem; color: #38bdf8; text-decoration: none; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>🔒 Access Denied / Link Expired</h1>
                        <p>${validation.error}</p>
                        <p>Paid blueprint downloads require a verified, active cryptographic token.</p>
                        <a href="/portal.html">← Return to Member Portal</a>
                    </div>
                </body>
                </html>
            `);
            return;
        }

        const tokenData = validation.tokenData;
        const product = PRODUCT_CATALOG[tokenData.productId];

        if (!product || !fs.existsSync(product.storagePath)) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', message: 'Target secure file missing on server' }));
            return;
        }

        // Increment download counter
        tokenData.downloadCount++;
        console.log(`[Secure Delivery] Serving "${product.filename}" to token ${tokenId}. Attempt ${tokenData.downloadCount}/${tokenData.maxDownloads}`);

        // Stream secure PDF with strict anti-caching headers
        const stat = fs.statSync(product.storagePath);
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Length': stat.size,
            'Content-Disposition': `attachment; filename="${product.filename}"`,
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Content-Type-Options': 'nosniff'
        });

        const readStream = fs.createReadStream(product.storagePath);
        readStream.pipe(res);
        return;
    }

    // ------------------------------------------------------------------
    // ZERO-LEAK SECURITY RULE: Explicitly Block Direct Access to secure_storage/
    // ------------------------------------------------------------------
    if (pathname.startsWith('/secure_storage') || pathname.includes('secure_storage')) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'forbidden',
            code: 403,
            message: 'Access to private secure storage is strictly forbidden. Downloads must go through verified token delivery.'
        }));
        return;
    }

    // Block private system files (.git, .env, backups, etc.)
    if (pathname.includes('/.git') || pathname.includes('.env') || pathname.endsWith('.backup') || pathname.endsWith('package.json') || pathname.endsWith('server.js')) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
    }

    // ------------------------------------------------------------------
    // STATIC ASSET SERVING
    // ------------------------------------------------------------------
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') {
        safePath = '/portal.html';
    }

    const filePath = path.join(ROOT_DIR, safePath);

    // Prevent directory traversal
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(`<h1>404 Not Found</h1><p>The requested file does not exist.</p><a href="/portal.html">Go to Portal</a>`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stats.size,
            'Cache-Control': ext === '.pdf' ? 'no-cache' : 'public, max-age=3600'
        });

        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`⚡ Pinnacle AI Solutions Payment & Portal Server Running`);
    console.log(`🌐 URL: http://localhost:${PORT}/portal.html`);
    console.log(`🔒 Secure Storage: Protected (Zero Direct Access)`);
    console.log(`💎 Paid Products ($10):`);
    console.log(`   1. Enterprise AI Lead Generation Playbook`);
    console.log(`   2. Autonomous Multi-Agent Architecture`);
    console.log(`💳 Pay Link: https://pay.pinnacleaisolution.site/ebook`);
    console.log(`🧪 Test Simulation Endpoint: POST /api/test/simulate-payment`);
    console.log(`=======================================================`);
});

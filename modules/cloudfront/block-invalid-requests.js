// CloudFront Function: Block invalid/bot requests at the edge
// This runs BEFORE CloudFront checks cache or contacts origin
// Cost: FREE (included in CloudFront, up to 2M invocations/month free tier)

function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var headers = request.headers;
  
  // 1. Block requests with excessive path depth (bots crawling concatenated URLs)
  var slashCount = (uri.match(/\//g) || []).length;
  if (slashCount > 3) {
    return {
      statusCode: 403,
      statusDescription: 'Forbidden',
      headers: { 'cache-control': { value: 'public, max-age=86400' } },
      body: { encoding: 'text', data: '' }
    };
  }
  
  // 2. Block requests to non-existent file extensions (scanners probing for vulnerabilities)
  var blockedExtensions = /\.(php|asp|aspx|jsp|cgi|env|git|sql|bak|old|orig|swp|log|ini|conf|yml|yaml|xml|json|db|sqlite)$/i;
  if (blockedExtensions.test(uri)) {
    return {
      statusCode: 403,
      statusDescription: 'Forbidden',
      headers: { 'cache-control': { value: 'public, max-age=86400' } },
      body: { encoding: 'text', data: '' }
    };
  }
  
  // 3. Block requests with suspicious paths (common bot/scanner patterns)
  var blockedPaths = /\/(wp-admin|wp-login|wp-content|wp-includes|xmlrpc|\.well-known\/|administrator|phpmyadmin|admin\.php|config\.|\.env|\.git)/i;
  if (blockedPaths.test(uri)) {
    return {
      statusCode: 403,
      statusDescription: 'Forbidden',
      headers: { 'cache-control': { value: 'public, max-age=86400' } },
      body: { encoding: 'text', data: '' }
    };
  }
  
  // 4. Block empty or missing User-Agent (most legitimate browsers always send UA)
  var userAgent = headers['user-agent'] ? headers['user-agent'].value : '';
  if (!userAgent || userAgent.length < 5) {
    return {
      statusCode: 403,
      statusDescription: 'Forbidden',
      headers: { 'cache-control': { value: 'public, max-age=86400' } },
      body: { encoding: 'text', data: '' }
    };
  }
  
  // 5. Block known bad bots by User-Agent pattern
  var badBots = /(Scrapy|AhrefsBot|SemrushBot|MJ12bot|DotBot|BLEXBot|PetalBot|YandexBot|Bytespider|GPTBot|ClaudeBot|CCBot|DataForSeoBot|Sogou|MegaIndex|ltx71)/i;
  if (badBots.test(userAgent)) {
    return {
      statusCode: 403,
      statusDescription: 'Forbidden',
      headers: { 'cache-control': { value: 'public, max-age=86400' } },
      body: { encoding: 'text', data: '' }
    };
  }
  
  // 6. Only allow valid file types that actually exist on the site
  var validExtensions = /\.(html|css|js|svg|png|jpg|jpeg|gif|ico|pdf|woff|woff2|ttf|eot|txt|xml|json|webp|zip)$/i;
  var isRoot = (uri === '/' || uri === '');
  var hasExtension = /\.[a-z0-9]+$/i.test(uri);
  
  // If it has an extension but not a valid one, block it
  if (hasExtension && !validExtensions.test(uri)) {
    return {
      statusCode: 403,
      statusDescription: 'Forbidden',
      headers: { 'cache-control': { value: 'public, max-age=86400' } },
      body: { encoding: 'text', data: '' }
    };
  }
  
  // 7. For paths without extension, append /index.html if it looks like a directory
  if (!hasExtension && !isRoot && !uri.endsWith('/')) {
    // Allow paths like /linux, /terraform (they resolve via S3 key)
    // But block deeply nested paths without extensions
    if (slashCount > 2) {
      return {
        statusCode: 403,
        statusDescription: 'Forbidden',
        headers: { 'cache-control': { value: 'public, max-age=86400' } },
        body: { encoding: 'text', data: '' }
      };
    }
  }
  
  return request;
}

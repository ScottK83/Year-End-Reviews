export default {
  async fetch(request) {
    const url = new URL(request.url);
    let path = url.pathname;

    // Default to index.html for root
    if (path === '/' || path === '') {
      path = '/index.html';
    }

    try {
      const response = await fetch(new Request(new URL(path, request.url).toString(), request));
      
      // Add proper content-type headers
      const contentType = getContentType(path);
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Content-Type', contentType);
      
      return newResponse;
    } catch (error) {
      return new Response('File not found', { status: 404 });
    }
  },
};

function getContentType(path) {
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.js')) return 'application/javascript';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  return 'text/plain';
}

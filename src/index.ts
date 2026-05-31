import http from 'http';

// Global variable acting as our "database"
let posts: { id: number; title: string; body: string; userId: number }[] = [
  { id: 1, title: 'First Post', body: 'Hello world', userId: 1 },
];

const server = http.createServer((req, res) => {
  const url = req.url || '';
  const method = req.method || '';

  // Helper to send JSON responses
  const sendJSON = (statusCode: number, data: unknown) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // Helper to read request body
  const getBody = (): Promise<string> => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => resolve(body));
    });
  };

  // GET /posts
  if (url === '/posts' && method === 'GET') {
    sendJSON(200, posts);

  // GET /posts/:id
  } else if (url.match(/^\/posts\/\d+$/) && method === 'GET') {
    const id = parseInt(url.split('/')[2]);
    const post = posts.find((p) => p.id === id);
    post ? sendJSON(200, post) : sendJSON(404, { error: 'Post not found' });

  // POST /posts
  } else if (url === '/posts' && method === 'POST') {
    getBody().then((body) => {
      const data = JSON.parse(body);
      const newPost = { id: posts.length + 1, ...data };
      posts.push(newPost);
      sendJSON(201, newPost);
    });

  // PUT /posts/:id
  } else if (url.match(/^\/posts\/\d+$/) && method === 'PUT') {
    getBody().then((body) => {
      const id = parseInt(url.split('/')[2]);
      const data = JSON.parse(body);
      const index = posts.findIndex((p) => p.id === id);
      if (index === -1) return sendJSON(404, { error: 'Post not found' });
      posts[index] = { id, ...data };
      sendJSON(200, posts[index]);
    });

  // PATCH /posts/:id
  } else if (url.match(/^\/posts\/\d+$/) && method === 'PATCH') {
    getBody().then((body) => {
      const id = parseInt(url.split('/')[2]);
      const data = JSON.parse(body);
      const index = posts.findIndex((p) => p.id === id);
      if (index === -1) return sendJSON(404, { error: 'Post not found' });
      posts[index] = { ...posts[index], ...data };
      sendJSON(200, posts[index]);
    });

  // DELETE /posts/:id
  } else if (url.match(/^\/posts\/\d+$/) && method === 'DELETE') {
    const id = parseInt(url.split('/')[2]);
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return sendJSON(404, { error: 'Post not found' });
    posts.splice(index, 1);
    sendJSON(200, { message: 'Post deleted' });

  } else {
    sendJSON(404, { error: 'I am here' });
  }
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
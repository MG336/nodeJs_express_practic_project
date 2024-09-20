import http from 'http';
import url from 'url';

class SimpleExpress {
  constructor() {
    this.routes = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {}
    };
  }

  get(path, handler) {
    this.routes.GET[path] = handler;
  }

  post(path, handler) {
    this.routes.POST[path] = handler;
  }

  put(path, handler) {
    this.routes.PUT[path] = handler;
  }

  delete(path, handler) {
    this.routes.DELETE[path] = handler;
  }

  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname;

    const handler = this.routes[method] ? this.routes[method][pathname] : null;

    if (handler) {
      req.query = parsedUrl.query;

      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', () => {
        if (body) {
          req.body = JSON.parse(body);
        }
        handler(req, res);
      });
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  }

  listen(port, callback) {
    const server = http.createServer((req, res) => this.handleRequest(req, res));
    server.listen(port, callback);
  }
}

const app = new SimpleExpress();

// Пример маршрутов
app.get('/', (req, res) => {
  res.end('Hello, World!');
});

app.get('/users', (req, res) => {
  res.end('GET users');
});

app.post('/users', (req, res) => {
  res.end(`POST user with data: ${JSON.stringify(req.body)}`);
});

app.put('/users/:id', (req, res) => {
  res.end(`PUT user with ID: ${req.query.id}`);
});

app.delete('/users/:id', (req, res) => {
  res.end(`DELETE user with ID: ${req.query.id}`);
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
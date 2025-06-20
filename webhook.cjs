const http = require('http');
const { exec } = require('child_process');

const SECRET = ''; // Leave empty for now (or add your GitHub webhook secret if set)

const PORT = 3000;

http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('🔁 Received webhook payload');
      
      // Optional: validate secret here

      exec('bash ./deploy.sh', (err, stdout, stderr) => {
        if (err) {
          console.error('❌ Deployment error:', stderr);
          res.writeHead(500);
          return res.end('Deployment failed');
        }
        console.log('✅ Deployment success:', stdout);
        res.writeHead(200);
        res.end('Deployed');
      });
    });
  } else {
    res.writeHead(200);
    res.end('Webhook listener up');
  }
}).listen(PORT, () => {
  console.log(`🚀 Webhook server running at http://localhost:${PORT}`);
});


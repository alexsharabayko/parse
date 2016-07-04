var http = require('http');
const PORT=4000;

function handleRequest(req, res){
    if (req.method === 'GET' && req.url === '/goro') {
        res.end('For file path');
    } else {
        res.end('Bad request');
    }
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});
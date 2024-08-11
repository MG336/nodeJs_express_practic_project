const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((request, response) => {
      console.log(request.url)
     if (request.url === "/user") {
         
        let data = "";
        request.on("data", chunk => {
            data += chunk;
        });//get all body data
        request.on("end", () => {
            console.log(data);
            response.statusCode = 200;
            response.end("The data has been successfully received");
        });
    }
    else{
        const filePath = path.join(__dirname,'..','html','index.html');
        console.log(filePath)
        fs.readFile(filePath, (error, data) => response.end(data));
    }
})
        
server.listen(3000, ()=>console.log("The server is running at http://localhost:3000 "));

module.exports = server;
        
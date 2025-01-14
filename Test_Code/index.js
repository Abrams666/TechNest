//import
const http = require("http");

//create server
const server = http.createServer((req, res) => {
    res.end("Hello World!");
});

//listen server
server.listen(80, "127.0.0.1", () => {
    console.log("listening");
});

//import
const http = require("http");
const url = require("url");
const fs = require("fs");

//router
const server = http.createServer((req, res) => {
    if (req.url === "/" || req.url === "/home") {
        fs.readFile("./Template/HomePage_Temp.html", (err, data) => {
            const output = data.toString().replace("{% CSSFILE %}", `Template\\css.css`);

            //console.log(output);
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(output);
        });
    } else if (req.url === "/cart") {
        res.end("Cart");
    } else if (req.url === "/market") {
        res.end("Market");
    } else if (req.url === "/setting") {
        res.end("Setting");
    } else if (req.url === "/Template/css.css") {
        fs.readFile("./Template/css.css", (err, data) => {
            const output = data.toString();

            //console.log(output);
            res.setHeader("Content-Type", "text/css");
            res.end(output);
        });
    } else {
        res.end("404");
    }
    console.log(req.url);
});

//listener
server.listen(80, "127.0.0.1", () => {
    console.log("listening on port 80");
});

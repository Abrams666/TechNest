//import
const http = require("http");
const url = require("url");
const fs = require("fs");

//router
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    console.log(parsedUrl);
    //homepage
    if (parsedUrl.pathname === "/" || parsedUrl.pathname === "/home") {
        fs.readFile("./Template/HomePage_Temp.html", (err, data) => {
            const output = data.toString().replace("{% CSSFILE %}", `Template\\css.css`);

            //console.log(output);
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(output);
        });

        //cart
    } else if (parsedUrl.pathname === "/cart") {
        res.end("Cart");

        //market
    } else if (parsedUrl.pathname === "/myshop") {
        res.end("Market");

        //setting
    } else if (parsedUrl.pathname === "/setting") {
        res.end("Setting");

        //css
    } else if (parsedUrl.pathname === "/Template/css.css") {
        fs.readFile("./Template/css.css", (err, data) => {
            const output = data.toString();

            //console.log(output);
            res.setHeader("Content-Type", "text/css");
            res.end(output);
        });
    } else {
        fs.readFile("./Template/404.html", (err, data) => {
            const output = data.toString().replace("{% CSSFILE %}", `Template\\css.css`);

            //console.log(output);
            res.setHeader("Content-Type", "text/html");
            res.writeHead(404);
            res.end(output);
        });
    }
    console.log(req.url);
});

//listener
server.listen(80, "127.0.0.1", () => {
    console.log("listening on port 80");
});

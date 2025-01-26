//import
const http = require("http");
const url = require("url");
const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

//config
dotenv.config({ path: "./config.env" });

//db connect
const DCS = process.env.DATABASE_CONNECTION_STRING.replace("<db_password>", process.env.DATABASE_PASSWORD);
mongoose
    .connect(DCS, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then((con) => {
        console.log("Connected to MongoDB");
        console.log(con.Connection);
    })
    .catch((err) => {
        console.error("Database connection error:", err.message);
    });

//function
function replacement(origin_file, replace_text, replace_content) {
    let output = origin_file.toString(); // Convert buffer to string if needed

    for (let i = 0; i < replace_text.length; i++) {
        output = output.replace(replace_text[i], replace_content[i]);
    }

    return output;
}

//read file
const css = fs.readFileSync("./Template/css.css", "utf8");
const home_page = fs.readFileSync("./Template/HomePage_Temp.html", "utf8");
const not_found = fs.readFileSync("./Template/404.html", "utf8");

//give page
app.get("/", (req, res) => {
    let output = replacement(home_page, ["{% CSS_FILE %}"], ["/css"]);

    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(output);
});

//give css
app.get("/css", (req, res) => {
    res.setHeader("Content-Type", "text/css");
    res.status(200);
    res.end(css);
});

//give img
app.get("/img/sys/:id", (req, res) => {
    const id = req.params.id;
    fs.readFile(`./Database/Server_Picture/${id}.jpg`, (err, data) => {
        res.writeHead(200, { "Content-Type": "image/jpg" });
        res.end(data);
    });
});

//404
app.use((req, res) => {
    let output = replacement(not_found, ["{% CSS_FILE %}"], ["/css"]);

    res.setHeader("Content-Type", "text/html");
    res.writeHead(404);
    res.end(output);
});

//start server
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

//router
// const server = http.createServer((req, res) => {
//     const parsedUrl = url.parse(req.url, true);
//     //console.log(parsedUrl);
//     //homepage
//     if (parsedUrl.pathname === "/" || parsedUrl.pathname === "/home") {
//         fs.readFile("./Template/HomePage_Temp.html", (err, data) => {
//             let output = data.toString().replace("{% CSS_FILE %}", "Template/css.css");
//             //output = output.replace("{%FACE_IMG%}", "/img/face-img.jpg");

//             //console.log(output);
//             res.setHeader("Content-Type", "text/html");
//             res.writeHead(200);
//             res.end(output);
//         });

//         //cart
//     } else if (parsedUrl.pathname === "/cart") {
//         res.end("Cart");

//         //market
//     } else if (parsedUrl.pathname === "/myshop") {
//         res.end("Market");

//         //setting
//     } else if (parsedUrl.pathname === "/setting") {
//         res.end("Setting");

//         //css
//     } else if (parsedUrl.pathname === "/Template/css.css") {
//         fs.readFile("./Template/css.css", (err, data) => {
//             const output = data.toString();

//             //console.log(output);
//             res.setHeader("Content-Type", "text/css");
//             res.end(output);
//         });
//     } else if (parsedUrl.pathname[0] + parsedUrl.pathname[1] + parsedUrl.pathname[2] + parsedUrl.pathname[3] === "/img") {
//         fs.readFile(`./Template/Server_Picture/${parsedUrl.pathname[5] + parsedUrl.pathname[6] + parsedUrl.pathname[7]}.jpg`, (err, data) => {
//             console.log(`./Template/Server_Picture/${parsedUrl.pathname[5] + parsedUrl.pathname[6] + parsedUrl.pathname[7]}.jpg`);
//             let output = data;
//             res.setHeader("Content-Type", "image/jpeg");
//             res.end(output);
//         });
//     } else {
//         fs.readFile("./Template/404.html", (err, data) => {
//             const output = data.toString().replace("{% CSS_FILE %}", `Template/css.css`);

//             //console.log(output);
//             res.setHeader("Content-Type", "text/html");
//             res.writeHead(404);
//             res.end(output);
//         });
//     }
//     console.log(req.url);
// });

// //listener
// server.listen(80, "127.0.0.1", () => {
//     console.log("listening on port 80");
// });

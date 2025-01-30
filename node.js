//import
const http = require("http");
const url = require("url");
const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());

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
        //console.log(con.Connection);
    })
    .catch((err) => {
        console.error("Database connection error:", err.message);
    });

const user_schema = new mongoose.Schema(
    {
        id: Number,
        password: String,
        name: String,
        email: String,
        shop_name: String,
        cart_product: Array,
        my_product: Array,
    },
    {
        collection: "User",
    }
);
const product_schema = new mongoose.Schema(
    {
        id: Number,
        name: String,
        price: Number,
        owner: Number,
        picture_num: Number,
        description: String,
        detail: String,
    },
    {
        collection: "Product",
    }
);
const item_in_cart_schema = new mongoose.Schema(
    {
        product_id: Number,
        product_name: String,
        owner_id: Number,
        amount: Number,
    },
    {
        collection: "Item_In_Cart",
    }
);

const user_model = mongoose.model("user_model", user_schema);
const product_model = mongoose.model("product_model", product_schema);
const item_in_cart_model = mongoose.model("item_in_cart_model", item_in_cart_schema);

//function
function replacement(origin_file, replace_text, replace_content) {
    let output = origin_file.toString();

    for (let i = 0; i < replace_text.length; i++) {
        output = output.replace(replace_text[i], replace_content[i]);
    }

    return output;
}

//read file
const css = fs.readFileSync("./Template/css.css", "utf8");
const home_page = fs.readFileSync("./Template/HomePage_Temp.html", "utf8");
const home_page_card = fs.readFileSync("./Template/HomePageCard_Temp.html", "utf8");
const cart = fs.readFileSync("./Template/Cart_Temp.html", "utf8");
const cart_card = fs.readFileSync("./Template/Cart_Card_Temp.html", "utf8");
const product = fs.readFileSync("./Template/Product_Temp.html", "utf8");
const myshop = fs.readFileSync("./Template/My_Shop.html", "utf8");
const edit = fs.readFileSync("./Template/Edit_Product_Temp.html", "utf8");
const setting = fs.readFileSync("./Template/Setting_Temp.html", "utf8");
const login = fs.readFileSync("./Template/Login_Temp.html", "utf8");
const signup = fs.readFileSync("./Template/SignUp_Temp.html", "utf8");
const success = fs.readFileSync("./Template/Success.html", "utf8");
const fail = fs.readFileSync("./Template/Fail.html", "utf8");
const not_found = fs.readFileSync("./Template/404.html", "utf8");

//give page
app.get("/", (req, res) => {
    let output = replacement(home_page, ["{% CSS_FILE %}"], ["/css"]);

    if (req.cookies.id && req.cookies.au4a83 && req.cookies.name) {
        output = replacement(output, ["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}"], [`<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`, `<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`]);
    } else {
        output = replacement(output, ["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}"], ["<i class='fa-solid fa-right-to-bracket'></i> Login", "/login", "<i class='fa-solid fa-right-to-bracket'></i> Login", "/login"]);
    }

    product_model
        .find()
        .sort({ id: -1 })
        .then((result) => {
            let max_product_num = 20;
            let cards = "";

            if (result.length < max_product_num) {
                max_product_num = result.length;
            }

            for (let i = 0; i < max_product_num; i++) {
                cards += replacement(home_page_card, ["{% PRODUCT_MAIN_IMG %}", "{% PRODUCT_NAME %}", "{% PRODUCT_DESCRIPTION %}", "{% PRODUCT_PICE %}", "{% PRODUCT_LINK %}", "{% LINK_TITLE %}"], [`/img/pro/${result[i].id}/1`, result[i].name, result[i].description, result[i].price, `/product/${result[i].id}`, "View More..."]);
            }

            output = replacement(output, ["{% PRODUCTS %}"], [cards]);

            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(output);
        });
});

app.get("/cart", (req, res) => {
    if (req.cookies.id && req.cookies.au4a83 && req.cookies.name) {
        item_in_cart_model
            .find({ owner_id: req.cookies.id })
            .sort({ product_id: -1 })
            .then((result) => {
                let cards = "";

                for (let i = 0; i < result.length; i++) {
                    cards += replacement(cart_card, ["{% ITEMIMG_URL %}", "{% ITEMNAME_P_STR %}", "{% ITEMID_INT %}", "{% ITEMNUM_STR %}", "{% ITEMID_INT %}", "{% ITEMID_INT %}"], [`img/pro/${result[i].product_id}/1`], result[i].product_name, result[i].product_id, result[i].amount, result[i].product_id, result[i].product_id);
                }

                let output = replacement(cart, ["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}", "{% ITEM %}"], [`<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`, `<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`, cards]);

                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(output);
            });
    } else {
        res.writeHead(302, { Location: "/login" });
        res.end();
    }
});

app.get("/product/:id", (req, res) => {
    const id = req.params.id;

    let output = replacement(product, ["{% CSS_FILE %}"], ["/css"]);

    if (req.cookies.id && req.cookies.au4a83 && req.cookies.name) {
        output = replacement(output, ["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}"], [`<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`, `<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`]);
    } else {
        output = replacement(output, ["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}"], ["<i class='fa-solid fa-right-to-bracket'></i> Login", "/login", "<i class='fa-solid fa-right-to-bracket'></i> Login", "/login"]);
    }

    product_model
        .find({
            id: id,
        })
        .then((result) => {
            output = replacement(output, ["{% PRODUCT_MAIN_IMG %}", "{% PRODUCT_NAME %}", "{% PRODUCT_DETAILS %}", "{% PRODUCT_OWNER %}", "{% PRODUCT_PRICE %}"], [`/img/pro/${id}/1`, result[0].name, result[0].detail, result[0].owner, result[0].price]);

            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(output);
        });
});

app.get("/editproduct/:id", (req, res) => {
    const id = req.params.id;

    if (req.cookies.id && req.cookies.au4a83 && req.cookies.name) {
        let output = replacement(edit, ["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}"], [`<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`, `<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`]);

        if (id === "N") {
            res.cookie("edit_type", "New", { maxAge: 86400000 });
        } else {
            res.cookie("edit_type", id, { maxAge: 86400000 });
        }

        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(output);
    } else {
        res.status(401).json({ message: "Access Denied" });
    }
});

app.get("/myshop", (req, res) => {
    if (req.cookies.id && req.cookies.au4a83 && req.cookies.name) {
        product_model
            .find({ owner: req.cookies.id })
            .sort({ id: -1 })
            .then((result2) => {
                let cards = "";

                for (let i = 0; i < result2.length; i++) {
                    cards += replacement(home_page_card, ["{% PRODUCT_MAIN_IMG %}", "{% PRODUCT_NAME %}", "{% PRODUCT_DESCRIPTION %}", "{% PRODUCT_PICE %}", "{% PRODUCT_LINK %}", "{% LINK_TITLE %}"], [`/img/pro/${result2[i].id}N1`, result2[i].name, result2[i].description, result2[i].price, `/editproduct/${result2[i].id}`, "Edit..."]);
                }

                let output = replacement(myshop, ["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}", "{% SHOP_NAME %}", "{% PRODUCTS %}"], [`<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`, `<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`, req.cookies.shop_name, cards]);

                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(output);
            });
    } else {
        res.writeHead(302, { Location: "/login" });
        res.end();
    }
});

app.get("/setting/:a", (req, res) => {
    if (req.cookies.id && req.cookies.au4a83 && req.cookies.name) {
        let output = replacement(setting, ["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}"], [`<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`, `<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`]);

        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(output);
    } else {
        res.writeHead(302, { Location: "/fail/Access Denied/401" });
        res.end();
    }
});

app.get("/login", (req, res) => {
    let output = replacement(login, ["{% CSS_FILE %}"], ["/css"]);

    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(output);
});

app.get("/signup", (req, res) => {
    let output = replacement(signup, ["{% CSS_FILE %}"], ["/css"]);

    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(output);
});

app.get("/success/:obj", (req, res) => {
    const obj = req.params.obj;

    let output = replacement(success, ["{% CSS_FILE %}", "{% OBJECT %}"], ["/css", obj]);

    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(output);
});

app.get("/fail/:obj/:status", (req, res) => {
    const obj = req.params.obj;
    const status = req.params.status;

    let output = replacement(fail, ["{% OBJECT %}"], [obj]);

    res.setHeader("Content-Type", "text/html");
    res.writeHead(status);
    res.end(output);
});

//deal with data
app.post("/logindata", (req, res) => {
    const data = req.body;

    user_model
        .find({
            email: data.acc,
        })
        .then((result) => {
            if (result.length === 0) {
                res.status(401).json({ message: "User not found" });
            } else if (result.length === 1 && result[0].password !== data.pwd) {
                res.status(403).json({ message: "Wrong Password" });
            } else if (result.length === 1 && result[0].password === data.pwd) {
                res.cookie("id", result[0].id.toString(), { maxAge: 86400000 });
                res.cookie("name", result[0].name, { maxAge: 86400000 });
                res.cookie("au4a83", data.pwd, { maxAge: 86400000 });
                res.cookie("shop_name", result[0].shop_name, { maxAge: 86400000 });
                res.status(200).json({ message: "Login success" });
            }
        });
});
app.post("/signupdata", (req, res) => {
    const data = req.body;

    console.log(data);

    user_model
        .find({
            email: data.acc,
        })
        .then((result) => {
            if (result.length === 0) {
                user_model
                    .find()
                    .sort({ id: -1 })
                    .then((result2) => {
                        const newAccount = new user_model({
                            id: result2[0].id + 1,
                            password: data.pwd,
                            name: data.name,
                            email: data.acc,
                            shop_name: data.shop,
                            cart_product: [],
                            my_product: [],
                        });

                        newAccount.save().then(() => {
                            res.cookie("id", (result2[0].id + 1).toString(), { maxAge: 86400000 });
                            res.cookie("name", data.name, { maxAge: 86400000 });
                            res.cookie("au4a83", data.pwd, { maxAge: 86400000 });
                            res.cookie("shop_name", data.shop, { maxAge: 86400000 });
                            res.status(201).json({ message: "Signup success" });
                        });
                    });
            } else {
                res.status(409).json({ message: "Account already exists" });
            }
        });
});

app.post("/editdata", (req, res) => {
    const data = req.body;

    if (req.cookies.id && req.cookies.au4a83 && req.cookies.name) {
        if (req.cookies.edit_type === "New") {
            user_model
                .find()
                .sort({ id: -1 })
                .then((result) => {
                    const newProduct_obj = new product_model({
                        id: result[0].id + 1,
                        name: data.name,
                        price: data.price,
                        owner: req.cookies.id,
                        picture_num: 1,
                        description: data.des,
                        detail: data.detail,
                    });

                    newProduct_obj.save().then(() => {
                        res.clearCookie("edit_type", { path: "/" });
                        res.status(201).json({ message: "Create success" });
                    });
                });
        } else {
            product_model
                .findOneAndUpdate(
                    { id: req.cookies.edit_type },
                    {
                        $set: {
                            name: data.name,
                            price: data.price,
                            description: data.des,
                            detail: data.detail,
                        },
                    },
                    { upsert: true }
                )
                .then(() => {
                    res.clearCookie("edit_type", { path: "/" });
                    res.status(201).json({ message: "Update success" });
                });
        }
    } else {
        res.writeHead(302, { Location: "/fail/Access Denied/401" });
        res.end();
    }
});

//give css
app.get("/css", (req, res) => {
    res.setHeader("Content-Type", "text/css");
    res.status(200);
    res.end(css);
});

//give js
app.get("/js/:filename", (req, res) => {
    const filename = req.params.filename;

    fs.readFile(`./Template/${filename}.js`, (err, data) => {
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.end(data);
    });
});

//give img
app.get("/img/sys/:id/:type", (req, res) => {
    const id = req.params.id;
    const type = req.params.type;
    fs.readFile(`./Database/Server_Picture/${id}.${type}`, (err, data) => {
        res.writeHead(200, { "Content-Type": `image/${type}` });
        res.end(data);
    });
});

app.get("/img/user/:id", (req, res) => {
    const id = req.params.id;
    fs.readFile(`./Database/User_Picture/${id}.jpg`, (err, data) => {
        res.writeHead(200, { "Content-Type": "image/jpg" });
        res.end(data);
    });
});

app.get("/img/pro/:id/:num", (req, res) => {
    const id = req.params.id;
    const num = req.params.num;
    fs.readFile(`./Database/Product_Picture/${id}N${num}.jpg`, (err, data) => {
        res.writeHead(200, { "Content-Type": "image/jpg" });
        res.end(data);
    });
});

//404
app.use((req, res) => {
    let output = replacement(not_found, ["{% CSS_FILE %}"], ["/css"]);

    if (req.cookies.id && req.cookies.au4a83 && req.cookies.name) {
        output = replacement(output, ["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}"], [`<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`, `<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting/${req.cookies.id}`]);
    } else {
        output = replacement(output, ["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}"], ["<i class='fa-solid fa-right-to-bracket'></i> Login", "/login", "<i class='fa-solid fa-right-to-bracket'></i> Login", "/login"]);
    }

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

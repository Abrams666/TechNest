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

function is_login(req) {
    if (req.cookies.id && req.cookies.au4a83 && req.cookies.name) {
        return true;
    } else {
        return false;
    }
}

async function check_pwd(id, pwd) {
    let result = await user_model.find({ id: id, password: pwd });
    if (result.length === 1) {
        return true;
    } else {
        return false;
    }
}

function replace_login_status(origin_file, req, is_login) {
    if (is_login) {
        return replacement(origin_file, ["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}"], [`<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting`, "Setting", "/setting"]);
    } else {
        return replacement(origin_file, ["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}"], ["<i class='fa-solid fa-right-to-bracket'></i> Login", "/login", "Login", "/login"]);
    }
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
    let output = home_page;

    if (is_login(req)) {
        output = replace_login_status(output, req, true);
    } else {
        output = replace_login_status(output, req, false);
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
    if (is_login(req)) {
        item_in_cart_model
            .find({ owner_id: req.cookies.id })
            .sort({ product_id: -1 })
            .then(async (result) => {
                let cards = "";

                for (let i = 0; i < result.length; i++) {
                    let result2 = await product_model.find({ id: result[i].product_id });
                    cards += replacement(cart_card, ["{% ITEMIMG_URL %}", "{% ITEMNAME_P_STR %}", "{% ITEMID_INT %}", "{% ITEMNUM_STR %}", "{% ITEMID_INT %}", "{% ITEMID_INT %}"], [`img/pro/${result[i].product_id}/1`, result2[0].name, result[i].product_id, result[i].amount, result[i].product_id, result[i].product_id]);
                }

                let output = replace_login_status(cart, req, true);
                output = replacement(output, ["{% ITEM %}"], [cards]);

                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(output);
            });
    } else {
        res.status(401);
        res.redirect("/login");
    }
});

app.get("/product/:id", (req, res) => {
    const id = req.params.id;

    let output = product;

    if (is_login(req)) {
        output = replace_login_status(output, req, true);
    } else {
        output = replace_login_status(output, req, false);
    }

    product_model
        .find({
            id: id,
        })
        .then((result) => {
            output = replacement(output, ["{% PRODUCT_MAIN_IMG %}", "{% PRODUCT_NAME %}", "{% PRODUCT_DETAILS %}", "{% PRODUCT_OWNER %}", "{% PRODUCT_PRICE %}", "{% PRODUCT_ID %}"], [`/img/pro/${id}/1`, result[0].name, result[0].detail, result[0].owner, result[0].price, id]);

            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(output);
        });
});

app.get("/editproduct/:id", (req, res) => {
    const id = req.params.id;

    if (is_login(req)) {
        let output = replace_login_status(edit, req, true);

        if (id === "N") {
            res.cookie("edit_type", "New", { maxAge: 86400000 });
        } else {
            res.cookie("edit_type", id, { maxAge: 86400000 });
        }

        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(output);
    } else {
        res.status(401);
        res.redirect("/fail/Require Denied/401");
    }
});

app.get("/myshop", (req, res) => {
    if (is_login(req)) {
        product_model
            .find({ owner: req.cookies.id })
            .sort({ id: -1 })
            .then((result2) => {
                let cards = "";

                for (let i = 0; i < result2.length; i++) {
                    cards += replacement(home_page_card, ["{% PRODUCT_MAIN_IMG %}", "{% PRODUCT_NAME %}", "{% PRODUCT_DESCRIPTION %}", "{% PRODUCT_PICE %}", "{% PRODUCT_LINK %}", "{% LINK_TITLE %}"], [`/img/pro/${result2[i].id}N1`, result2[i].name, result2[i].description, result2[i].price, `/editproduct/${result2[i].id}`, "Edit..."]);
                }

                let output = replace_login_status(myshop, req, true);
                output = replacement(output, ["{% SHOP_NAME %}", "{% PRODUCTS %}"], [req.cookies.shop_name, cards]);

                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(output);
            });
    } else {
        res.status(401);
        res.redirect("/login");
    }
});

app.get("/setting", (req, res) => {
    if (is_login(req)) {
        let output = replace_login_status(setting, req, true);

        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(output);
    } else {
        res.status(401);
        res.redirect("/fail/Access Denied/401");
    }
});

app.get("/login", (req, res) => {
    let output = replace_login_status(login, req, false);

    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(output);
});

app.get("/signup", (req, res) => {
    let output = replace_login_status(signup, req, false);

    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(output);
});

app.get("/success/:obj", (req, res) => {
    const obj = req.params.obj;

    let output = replacement(success, ["{% OBJECT %}"], [obj]);

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

    if (is_login(req)) {
        if (check_pwd(req.cookies.id, req.cookies.au4a83)) {
            if (req.cookies.edit_type === "New") {
                product_model
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
            res.status(401);
            res.end();
        }
    } else {
        res.status(401);
        res.end();
    }
});

app.post("/additemdata/:type/:id", (req, res) => {
    const type = req.params.type;
    const id = req.params.id;

    if (is_login(req)) {
        if (check_pwd(req.cookies.id, req.cookies.au4a83)) {
            item_in_cart_model.find({ product_id: id, owner_id: req.cookies.id }).then((result) => {
                if (result.length === 0) {
                    const newItem_in_cart = new item_in_cart_model({
                        product_id: id,
                        owner_id: req.cookies.id,
                        amount: 1,
                    });

                    newItem_in_cart.save().then(() => {
                        res.status(201).json({ message: "Join Item Success" });
                    });
                } else {
                    if (type === "add") {
                        item_in_cart_model.findOneAndUpdate({ product_id: id, owner_id: req.cookies.id }, { $set: { amount: result[0].amount + 1 } }).then(() => {
                            res.status(201).json({ message: "Add Item Success" });
                        });
                    } else if (type === "reduce") {
                        if (result[0].amount === 1) {
                            item_in_cart_model.findOneAndDelete({ product_id: id, owner_id: req.cookies.id }).then(() => {
                                res.status(201).json({ message: "Remove Item Success" });
                            });
                        } else {
                            item_in_cart_model.findOneAndUpdate({ product_id: id, owner_id: req.cookies.id }, { $set: { amount: result[0].amount - 1 } }).then(() => {
                                res.status(201).json({ message: "Reduce Item Success" });
                            });
                        }
                    } else if (type === "delete") {
                        item_in_cart_model.findOneAndDelete({ product_id: id, owner_id: req.cookies.id }).then(() => {
                            res.status(201).json({ message: "Remove Item Success" });
                        });
                    }
                }
            });
        } else {
            res.status(402);
            res.end();
        }
    } else {
        res.status(401);
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
    let output = not_found;

    if (is_login(req)) {
        output = replace_login_status(output, req, true);
    } else {
        output = replace_login_status(output, req, false);
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

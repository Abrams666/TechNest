//import
const http = require("http");
const url = require("url");
const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const formidable = require("formidable");
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static("uploads"));

//config
dotenv.config({ path: "./config.env" });

const home_max_product_num = 20;
const search_max_product_num = 100;

//db connect
const DCS = process.env.DATABASE_CONNECTION_STRING.replace("{db_password}", process.env.DATABASE_PASSWORD);
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
		hashtag: Array,
		picture_ext: Array,
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

//file
const uploadDir = path.join(__dirname, "/Database/Product_Picture/");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "/Database/Product_Picture/");
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);

		if (req.cookies.edit_type === "New") {
			product_model
				.find()
				.sort({ id: -1 })
				.then((result) => {
					const userId = result[0].id + 1;
				});
		} else {
			const userId = req.cookies.edit_type;
		}

		if (!req.fileIndex) req.fileIndex = 1;

		const newFileName = `${userId}N${req.fileIndex}${ext}`;
		req.fileIndex++;

		cb(null, newFileName);
	},
});

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		const allowedTypes = ["image/png", "image/jpeg"];
		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("不支援的檔案格式"), false);
		}
	},
});

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
		return replacement(
			origin_file,
			["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}"],
			[`<i class='fa-solid fa-user'></i> ${req.cookies.name}`, `/setting`, "Setting", "/setting"]
		);
	} else {
		return replacement(
			origin_file,
			["{% USER %}", "{% SETTINGORLOGIN %}", "{% USER %}", "{% SETTINGORLOGIN %}"],
			["<i class='fa-solid fa-right-to-bracket'></i> Login", "/login", "Login", "/login"]
		);
	}
}

function split_hashtag(hashtag_str) {
	let hashtag_strArr_1 = hashtag_str.toLowerCase().trim().split(/\s+/);
	let hashtag_strArr_2 = [];

	for (let i = 0; i < hashtag_strArr_1.length; i++) {
		if (!hashtag_strArr_2.includes(hashtag_strArr_1[i])) {
			hashtag_strArr_2.push(hashtag_strArr_1[i]);
		}
	}

	return hashtag_strArr_2;
}

function arr_to_str(arr) {
	let str = "";

	for (let i = 0; i < arr.length; i++) {
		str += arr[i] + " ";
	}

	return str;
}

function search_engin(search_str, start, exp_end, forbid, callback) {
	const contain = split_hashtag(search_str);

	const search_conditions = {
		$or: [{ name: { $regex: contain.join("|"), $options: "i" } }, { hashtag: { $in: contain } }],
	};

	product_model
		.find(search_conditions)
		.sort({ id: -1 })
		.then((result) => {
			if (!(result.length === 0)) {
				let score_intArr = [];
				let max_score_int = 0;

				for (let i = 0; i < result.length; i++) {
					score_intArr.push(0);

					for (let j = 0; j < result[i].hashtag.length; j++) {
						if (contain.includes(result[i].hashtag[j])) {
							score_intArr[i] += 1;
						}
					}
					if (contain.some((item) => result[i].name.includes(item))) {
						score_intArr[i] += 1;
					}

					if (score_intArr[i] > max_score_int) {
						max_score_int = score_intArr[i];
					}
				}

				let end = Math.min(exp_end, result.length);
				let count_product = 0;
				let cards = "";

				for (let i = max_score_int; i > 0; i--) {
					for (let j = 0; j < result.length; j++) {
						if (score_intArr[j] === i && result[j].id !== forbid) {
							if (count_product >= start && count_product < end) {
								cards += replacement(
									home_page_card,
									[
										"{% PRODUCT_MAIN_IMG %}",
										"{% PRODUCT_NAME %}",
										"{% PRODUCT_DESCRIPTION %}",
										"{% PRODUCT_PICE %}",
										"{% PRODUCT_LINK %}",
										"{% LINK_TITLE %}",
									],
									[
										`/img/pro/${result[j].id}/1/${result[j].picture_ext[0]}`,
										result[j].name,
										result[j].detail,
										result[j].price,
										`/product/${result[j].id}/1`,
										"View More...",
									]
								);
							}

							count_product++;
						}
					}
				}

				callback(cards, result, contain);
			} else {
				callback("No product found...", result, contain);
			}
		});
}

//read file
const css = fs.readFileSync("./Template/css.css", "utf8");
const home_page = fs.readFileSync("./Template/HomePage_Temp.html", "utf8");
const home_page_card = fs.readFileSync("./Template/HomePageCard_Temp.html", "utf8");
const cart = fs.readFileSync("./Template/Cart_Temp.html", "utf8");
const cart_card = fs.readFileSync("./Template/Cart_Card_Temp.html", "utf8");
const product = fs.readFileSync("./Template/Product_Temp.html", "utf8");
const myshop = fs.readFileSync("./Template/My_Shop.html", "utf8");
const search = fs.readFileSync("./Template/Search_Temp.html", "utf8");
const pay = fs.readFileSync("./Template/Pay_Temp.html", "utf8");
const pay_card = fs.readFileSync("./Template/Pay_Card_Temp.html", "utf8");
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
			let cards = "";
			let max_product_num = home_max_product_num;

			if (result.length < max_product_num) {
				max_product_num = result.length;
			}

			for (let i = 0; i < max_product_num; i++) {
				if (result[i].id !== 1) {
					cards += replacement(
						home_page_card,
						[
							"{% PRODUCT_MAIN_IMG %}",
							"{% PRODUCT_NAME %}",
							"{% PRODUCT_DESCRIPTION %}",
							"{% PRODUCT_PICE %}",
							"{% PRODUCT_LINK %}",
							"{% LINK_TITLE %}",
						],
						[
							`/img/pro/${result[i].id}/1/${result[i].picture_ext[0]}`,
							result[i].name,
							result[i].description,
							result[i].price,
							`/product/${result[i].id}/1`,
							"View More...",
						]
					);
				}
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
					let result2 = await product_model.find({
						id: result[i].product_id,
					});
					cards += replacement(
						cart_card,
						[
							"{% ITEMIMG_URL %}",
							"{% ITEMNAME_P_STR %}",
							"{% ITEMPRICE_STR %}",
							"{% ITEMID_INT %}",
							"{% ITEMNUM_STR %}",
							"{% ITEMID_INT %}",
							"{% ITEMID_INT %}",
							"{% product_url %}",
						],
						[
							`/img/pro/${result2[0].id}/1/${result2[0].picture_ext[0]}`,
							result2[0].name,
							result2[0].price * result[i].amount,
							result[i].product_id,
							result[i].amount,
							result[i].product_id,
							result[i].product_id,
							`/product/${result[i].product_id}/1`,
						]
					);
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

app.get("/product/:id/:n", (req, res) => {
	const id = req.params.id;
	const n = req.params.n;

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
			if (!(result.length === 0)) {
				let hashtag_str = "";

				let next_n = 1;
				let last_n = 1;
				if (n * 1 === 1) {
					last_n = result[0].picture_ext.length;
				} else {
					last_n = n * 1 - 1;
				}
				if (n * 1 === result[0].picture_ext.length) {
					next_n = 1;
				} else {
					next_n = n * 1 + 1;
				}

				let search_contain = result[0].name;
				for (let i = 0; i < result[0].hashtag.length; i++) {
					hashtag_str += `<a href="/search/1/${result[0].hashtag[i]}">#${result[0].hashtag[i]} ,</a>`;
					search_contain += ` ${result[0].hashtag[i]}`;
				}
				output = replacement(
					output,
					[
						"{% PRODUCT_MAIN_IMG %}",
						"{% PRODUCT_NAME %}",
						"{% PRODUCT_DETAILS %}",
						"{% PRODUCT_OWNER %}",
						"{% PRODUCT_PRICE %}",
						"{% PRODUCT_ID %}",
						"{% PRODUCT_LABELS %}",
						"{% last_productImg_url %}",
						"{% next_productImg_url %}",
					],
					[
						`/img/pro/${result[0].id}/${n}/${result[0].picture_ext[n * 1 - 1]}`,
						result[0].name,
						result[0].detail,
						result[0].owner,
						result[0].price,
						id,
						hashtag_str,
						`/product/${id}/${last_n}`,
						`/product/${id}/${next_n}`,
					]
				);

				search_engin(search_contain, 0, 20, result[0].id * 1, (cards, result2, contain) => {
					output = replacement(output, ["{% PRODUCTS %}", "{% view_moreContain_str %}"], [cards, search_contain]);

					res.setHeader("Content-Type", "text/html");
					res.writeHead(200);
					res.end(output);
				});
			} else {
				res.status(404);
				res.redirect("/notfound");
			}
		});
});

app.get("/editproduct/:id", (req, res) => {
	const id = req.params.id;

	if (is_login(req)) {
		let output = replace_login_status(edit, req, true);

		if (id === "N") {
			res.cookie("edit_type", "New", { maxAge: 86400000 });
			output = replacement(output, ["{% ID %}"], [""]);

			res.setHeader("Content-Type", "text/html");
			res.writeHead(200);
			res.end(output);
		} else {
			res.cookie("edit_type", id, { maxAge: 86400000 });

			product_model
				.find({
					id: id,
				})
				.then((result) => {
					output = replacement(output, ["{% ID %}"], [`/${id}`]);

					res.setHeader("Content-Type", "text/html");
					res.writeHead(200);
					res.end(output);
				});
		}
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
					cards += replacement(
						home_page_card,
						[
							"{% PRODUCT_MAIN_IMG %}",
							"{% PRODUCT_NAME %}",
							"{% PRODUCT_DESCRIPTION %}",
							"{% PRODUCT_PICE %}",
							"{% PRODUCT_LINK %}",
							"{% LINK_TITLE %}",
						],
						[
							`/img/pro/${result2[i].id}/1/${result2[i].picture_ext[0]}`,
							result2[i].name,
							result2[i].description,
							result2[i].price,
							`/editproduct/${result2[i].id}`,
							"Edit...",
						]
					);
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

app.get("/search/:page/:contain?", (req, res) => {
	let page = req.params.page * 1;
	let max_product_num = search_max_product_num;
	let cards = "";
	let output = "";

	if (req.params.contain) {
		let start = max_product_num * (page - 1);
		let end = max_product_num * page;

		search_engin(req.params.contain, start, end, 1, (cards, result, contain) => {
			let last_page_num = page - 1;
			let next_page_num = page + 1;

			if (page === 1) {
				last_page_num = 1;
			}
			if (page === Math.ceil(result.length / max_product_num)) {
				next_page_num = Math.ceil(result.length / max_product_num);
			}

			output = replacement(
				search,
				["{% PRODUCTS %}", "{% last_page_url %}", "{% next_page_url %}", "{% now_page_input %}", "{% total_pageNum_str %}"],
				[
					cards,
					`/search/${last_page_num}/${contain}`,
					`/search/${next_page_num}/${contain}`,
					page,
					Math.ceil(result.length / max_product_num),
				]
			);

			output = replace_login_status(output, req, is_login(req));
			output = replacement(output, ["{% contain %}"], [req.params.contain]);
			res.setHeader("Content-Type", "text/html");
			res.writeHead(200);
			res.end(output);
		});
	} else {
		product_model
			.find()
			.sort({ id: -1 })
			.then((result) => {
				if (max_product_num * (page - 1) > result.length || page <= 0) {
					res.status(403);
					res.redirect("/fail/Access Denied/403");
					return;
				}

				if (result.length > 0) {
					let start = max_product_num * (page - 1);
					let end = Math.min(max_product_num * page, result.length);

					for (let i = start; i < end; i++) {
						if (!(result[i].id * 1 === 1)) {
							cards += replacement(
								home_page_card,
								[
									"{% PRODUCT_MAIN_IMG %}",
									"{% PRODUCT_NAME %}",
									"{% PRODUCT_DESCRIPTION %}",
									"{% PRODUCT_PICE %}",
									"{% PRODUCT_LINK %}",
									"{% LINK_TITLE %}",
								],
								[
									`/img/pro/${result[i].id}/1/${result[i].picture_ext[0]}`,
									result[i].name,
									result[i].detail,
									result[i].price,
									`/product/${result[i].id}/1`,
									"View More...",
								]
							);
						}
					}

					let last_page_num = page - 1;
					let next_page_num = page + 1;
					if (page === 1) {
						last_page_num = 1;
					}
					if (page === Math.ceil(result.length / max_product_num)) {
						next_page_num = Math.ceil(result.length / max_product_num);
					}

					output = replacement(
						search,
						["{% PRODUCTS %}", "{% last_page_url %}", "{% next_page_url %}", "{% now_page_input %}", "{% total_pageNum_str %}"],
						[cards, `/search/${last_page_num}/`, `/search/${next_page_num}/`, page, Math.ceil(result.length / max_product_num)]
					);
				} else {
					output = replacement(
						search,
						["{% PRODUCTS %}", "{% last_page_url %}", "{% next_page_url %}", "{% now_page_input %}", "{% total_pageNum_str %}"],
						["No products found", `/`, "/", "1", "1"]
					);
				}

				output = replace_login_status(output, req, is_login(req));
				output = replacement(output, ["{% contain %}"], [""]);

				res.setHeader("Content-Type", "text/html");
				res.writeHead(200);
				res.end(output);
			});
	}
});

app.get("/pay", (req, res) => {
	if (is_login(req)) {
		if (check_pwd(req.cookies.id, req.cookies.au4a83)) {
			item_in_cart_model.find({ owner_id: req.cookies.id }).then(async (result) => {
				if (result.length > 0) {
					let output = replace_login_status(pay, req, true);
					let cards = "";
					let total_price = 0;

					for (let i = 0; i < result.length; i++) {
						let result2 = await product_model.find({
							id: result[i].product_id,
						});
						cards += replacement(
							pay_card,
							["{% img_url %}", "{% productName_str %}", "{% productNum_str %}", "{% productPrice_str %}"],
							[
								`/img/pro/${result2[0].id}/1/${result2[0].picture_ext[0]}`,
								result2[0].name,
								`$${result2[0].price}*${result[i].amount}=`,
								result2[0].price * result[i].amount,
							]
						);
						total_price += result2[0].price * result[i].amount;
					}

					output = replacement(output, ["{% Order %}", "{% total_price %}"], [cards, total_price]);

					res.setHeader("Content-Type", "text/html");
					res.writeHead(200);
					res.end(output);
				} else {
					res.status(403);
					res.redirect("/fail/No Product in Cart/403");
				}
			});
		} else {
			res.status(403);
			res.redirect("/fail/Forbidden/403");
		}
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
				res.cookie("shop_name", result[0].shop_name, {
					maxAge: 86400000,
				});
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
						});

						newAccount.save().then(() => {
							res.cookie("id", (result2[0].id + 1).toString(), {
								maxAge: 86400000,
							});
							res.cookie("name", data.name, { maxAge: 86400000 });
							res.cookie("au4a83", data.pwd, {
								maxAge: 86400000,
							});
							res.cookie("shop_name", data.shop, {
								maxAge: 86400000,
							});
							res.status(201).json({ message: "Signup success" });
						});
					});
			} else {
				res.status(409).json({ message: "Account already exists" });
			}
		});
});

app.post("/editdata", async (req, res) => {
	const data = req.body;

	if (is_login(req)) {
		if (await check_pwd(req.cookies.id, req.cookies.au4a83)) {
			if (req.cookies.edit_type === "New") {
				const form = new formidable.IncomingForm();
				form.uploadDir = uploadDir;
				form.keepExtensions = true;

				form.parse(req, (err, fields, files) => {
					product_model
						.find()
						.sort({ id: -1 })
						.then((result) => {
							let exts = [];

							const uploaded_imgArr = files.files;

							for (let i = 0; i < uploaded_imgArr.length; i++) {
								const oldPath = uploaded_imgArr[i].filepath || uploaded_imgArr[i].path;
								const newPath = path.join(
									uploadDir,
									`${result[0].id + 1}N${i + 1}${path.extname(uploaded_imgArr[i].originalFilename)}`
								);

								//console.log(path.extname(uploaded_imgArr[i].originalFilename));

								exts.push(path.extname(uploaded_imgArr[i].originalFilename).toString());

								fs.rename(oldPath, newPath, () => {});
							}

							const newProduct_obj = new product_model({
								id: result[0].id + 1,
								name: fields.name[0],
								price: fields.price[0],
								owner: req.cookies.id,
								hashtag: split_hashtag(fields.hashtag[0]),
								picture_ext: exts,
								description: fields.des[0],
								detail: fields.detail[0],
							});

							newProduct_obj.save().then(() => {
								//res.clearCookie("edit_type", { path: "/" });
								res.status(201).json({
									message: "Create success",
								});
							});
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
								hashtag: split_hashtag(data.hashtag),
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
			res.status(403);
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
						res.status(201).json({
							message: "Join Item Success",
						});
					});
				} else {
					if (type === "add") {
						item_in_cart_model
							.findOneAndUpdate(
								{
									product_id: id,
									owner_id: req.cookies.id,
								},
								{ $set: { amount: result[0].amount + 1 } }
							)
							.then(() => {
								res.status(201).json({
									message: "Add Item Success",
								});
							});
					} else if (type === "reduce") {
						if (result[0].amount === 1) {
							item_in_cart_model
								.findOneAndDelete({
									product_id: id,
									owner_id: req.cookies.id,
								})
								.then(() => {
									res.status(201).json({
										message: "Remove Item Success",
									});
								});
						} else {
							item_in_cart_model
								.findOneAndUpdate(
									{
										product_id: id,
										owner_id: req.cookies.id,
									},
									{
										$set: {
											amount: result[0].amount - 1,
										},
									}
								)
								.then(() => {
									res.status(201).json({
										message: "Reduce Item Success",
									});
								});
						}
					} else if (type === "delete") {
						item_in_cart_model
							.findOneAndDelete({
								product_id: id,
								owner_id: req.cookies.id,
							})
							.then(() => {
								res.status(201).json({
									message: "Remove Item Success",
								});
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

app.post("/upload", upload.array("images", 5), (req, res) => {
	const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);
	res.json({ files: fileUrls });
});

app.post("/changepwd", async (req, res) => {
	const data = req.body;

	if (!is_login(req)) {
		res.status(401);
		res.end();

		return;
	}
	if (!(await check_pwd(req.cookies.id, req.cookies.au4a83))) {
		res.status(403);
		res.end();

		return;
	}
	if (!(await check_pwd(req.cookies.id, data.old_pwd))) {
		res.status(402);
		res.end();

		return;
	}

	user_model.findOneAndUpdate({ id: req.cookies.id }, { $set: { password: data.new_pwd } }).then(() => {
		res.cookie("au4a83", data.new_pwd, { maxAge: 86400000 });
		res.status(201);
		res.end();
	});
});

app.post("/changeinfo", async (req, res) => {
	const data = req.body;

	if (!is_login(req)) {
		res.status(401);
		res.end();

		return;
	}
	if (!(await check_pwd(req.cookies.id, req.cookies.au4a83))) {
		res.status(403);
		res.end();

		return;
	}
	if (!(await check_pwd(req.cookies.id, data.pwd))) {
		res.status(402);
		res.end();

		return;
	}

	if (data.type === "both") {
		user_model.findOneAndUpdate({ id: req.cookies.id }, { $set: { name: data.name, shop_name: data.shop } }).then(() => {
			res.cookie("name", data.name, { maxAge: 86400000 });
			res.cookie("shop_name", data.shop, { maxAge: 86400000 });
			res.status(201);
			res.end();
		});
	} else if (data.type === "name") {
		user_model.findOneAndUpdate({ id: req.cookies.id }, { $set: { name: data.name } }).then(() => {
			res.cookie("name", data.name, { maxAge: 86400000 });
			res.status(201);
			res.end();
		});
	} else if (data.type === "shop") {
		user_model.findOneAndUpdate({ id: req.cookies.id }, { $set: { shop_name: data.shop } }).then(() => {
			res.cookie("shop_name", data.shop, { maxAge: 86400000 });
			res.status(201);
			res.end();
		});
	}
});

app.post("/deleteacc", async (req, res) => {
	const data = req.body;

	if (!is_login(req)) {
		res.status(401);
		res.end();

		return;
	}
	if (!(await check_pwd(req.cookies.id, req.cookies.au4a83))) {
		res.status(403);
		res.end();

		return;
	}
	if (!(await check_pwd(req.cookies.id, data.pwd))) {
		res.status(402);
		res.end();

		return;
	}

	item_in_cart_model.findOneAndDelete({ owner_id: req.cookies.id }).then(() => {
		product_model.findOneAndDelete({ owner: req.cookies.id }).then(() => {
			user_model.findOneAndDelete({ id: req.cookies.id }).then(() => {
				res.clearCookie("id", { path: "/" });
				res.clearCookie("au4a83", { path: "/" });
				res.clearCookie("name", { path: "/" });
				res.clearCookie("shop_name", { path: "/" });

				res.status(201);
				res.end();
			});
		});
	});
});

//give css
app.get("/css", (req, res) => {
	res.setHeader("Content-Type", "text/css");
	res.status(200);
	res.end(css);
});

//give js
app.get("/js/:filename/:id?", (req, res) => {
	const filename = req.params.filename;
	let id = req.params.id;

	fs.readFile(`./Template/${filename}.js`, (err, data) => {
		if (filename === "Edit_Product" && id) {
			product_model
				.find({
					id: id,
				})
				.then((result) => {
					data = replacement(
						data,
						[
							"{% DEFALUT_PRODUCTNAME_INPUT_STR %}",
							"{% DEFALUT_PRODUCTPRICE_INPUT_STR %}",
							"{% DEFALUT_PRODUCTHASHTAGE_INPUT_STR %}",
							"{% DEFALUT_PRODUCTDES_INPUT_STR %}",
							"{% DEFALUT_PRODUCTDET_INPUT_STR %}",
						],
						[result[0].name, result[0].price, arr_to_str(result[0].hashtag), result[0].description, result[0].detail]
					);

					res.writeHead(200, { "Content-Type": "text/javascript" });
					res.end(data);
				});
		} else if (filename === "Edit_Product" && !id) {
			data = replacement(
				data,
				[
					"{% DEFALUT_PRODUCTNAME_INPUT_STR %}",
					"{% DEFALUT_PRODUCTPRICE_INPUT_STR %}",
					"{% DEFALUT_PRODUCTHASHTAGE_INPUT_STR %}",
					"{% DEFALUT_PRODUCTDES_INPUT_STR %}",
					"{% DEFALUT_PRODUCTDET_INPUT_STR %}",
				],
				["", "", "", "", ""]
			);

			res.writeHead(200, { "Content-Type": "text/javascript" });
			res.end(data);
		} else if (filename === "Search") {
			if (!id) {
				id = "";
			}
			data = replacement(data, ["{% search_contain_str %}"], [id]);

			res.writeHead(200, { "Content-Type": "text/javascript" });
			res.end(data);
		} else if (filename === "Setting") {
			data = replacement(data, ["{% name %}", "{% shop %}"], [req.cookies.name, req.cookies.shop_name]);

			res.writeHead(200, { "Content-Type": "text/javascript" });
			res.end(data);
		} else {
			res.writeHead(200, { "Content-Type": "text/javascript" });
			res.end(data);
		}
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

app.get("/img/pro/:id/:num/:type", (req, res) => {
	const id = req.params.id;
	const num = req.params.num;
	let type = req.params.type;

	// for (let i = 1; i < req.params.type.toString().length; i++) {
	// 	type = type + req.params.type.toString()[i];
	// }

	fs.readFile(`./Database/Product_Picture/${id}N${num}${type}`, (err, data) => {
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

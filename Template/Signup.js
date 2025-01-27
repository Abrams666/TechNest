const app = Vue.createApp({
    data() {
        return {
            ACCOUNT_ERR: "",
            PASSWORD_ERR: "",
            CONFIRM_PASSWORD_ERR: "",
            NAME_ERR: "",
            SHOP_NAME_ERR: "",
            acc: "",
            pwd: "",
            con: "",
            name: "",
            shop: "",
            shop_clicked: 0,
            err_check: 0,
        };
    },
    methods: {
        confirm_password() {
            if (this.pwd !== this.con) {
                this.CONFIRM_PASSWORD_ERR = "Passwords do not match.";
            } else {
                this.CONFIRM_PASSWORD_ERR = "";
            }
        },
        update_shop_name() {
            if (this.shop_clicked === 0) {
                this.shop = this.name + "'s Shop";
            }
        },
        shop_click() {
            this.shop_clicked = 1;
        },
        signup() {
            this.err_check = 0;
            if (this.acc === "") {
                this.ACCOUNT_ERR = "Email cannot be empty.";
                this.err_check = 1;
            } else {
                this.ACCOUNT_ERR = "";
            }
            if (this.pwd === "") {
                this.PASSWORD_ERR = "Password cannot be empty.";
                this.err_check = 1;
            } else {
                this.PASSWORD_ERR = "";
            }
            if (this.pwd !== this.con) {
                this.CONFIRM_PASSWORD_ERR = "Passwords do not match.";
                this.err_check = 1;
            } else {
                this.CONFIRM_PASSWORD_ERR = "";
            }
            if (this.name === "") {
                this.NAME_ERR = "Your name cannot be empty.";
                this.err_check = 1;
            } else {
                this.NAME_ERR = "";
            }
            if (this.shop === "") {
                this.SHOP_NAME_ERR = "Shop name cannot be empty.";
                this.err_check = 1;
            } else {
                this.SHOP_NAME_ERR = "";
            }
            if (this.err_check === 0) {
                fetch("/signupdata", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        acc: this.acc,
                        pwd: this.pwd,
                        con: this.con,
                        name: this.name,
                        shop: this.shop,
                    }),
                })
                    .then((res) => {
                        if (res.redirected) {
                            window.location.href = res.url;
                        } else if (res.status === 409) {
                            this.ACCOUNT_ERR = "Email already exists.";
                        }
                    })
                    .catch((error) => console.error("Error:", error));
            }
        },
    },
});
app.mount("#signup_form");

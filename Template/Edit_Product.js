const app = Vue.createApp({
    data() {
        return {
            PRODUCTIMGERR_STR: "",
            PRODUCTNAMEERR_STR: "",
            PRODUCTPRICEERR_STR: "",
            PRODUCTDESCRIPTIONERR_STR: "",
            PRODUCTDETAILERR_STR: "",
            productName_input_str: "",
            productPrice_input_str: "",
            productDescription_input_str: "",
            productDetail_input_str: "",
            //status: Cookies.get("status") || null,
        };
    },
    methods: {
        submit_btn() {
            this.PRODUCTIMGERR_STR = "";
            this.PRODUCTNAMEERR_STR = "";
            this.PRODUCTPRICEERR_STR = "";
            this.PRODUCTDESCRIPTIONERR_STR = "";
            this.PRODUCTDETAILERR_STR = "";

            let is_err = false;

            if (this.productName_input_str === "") {
                this.PRODUCTNAMEERR_STR = "Name cannot be empty.";
                is_err = true;
            }
            if (this.productPrice_input_str === "") {
                this.PRODUCTPRICEERR_STR = "Price cannot be empty.";
                is_err = true;
            }

            if (!is_err) {
                fetch("/editdata", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: this.productName_input_str,
                        price: this.productPrice_input_str,
                        des: this``.productDescription_input_str,
                        detail: this.productDetail_input_str,
                    }),
                })
                    .then((res) => {
                        if (res.status === 201) {
                            window.location.href = "/myshop";
                        } else if (res.status === 409) {
                            this.ACCOUNT_ERR = "Email already exists.";
                        }
                    })
                    .catch((error) => console.error("Error:", error));
            }
        },
    },
});
app.mount("#editProduct_formId");

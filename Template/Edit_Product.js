import { createApp } from "vue";
import App from "./App.vue";
import axios from "axios";

export default {
    data() {
        return {
            PRODUCTIMGERR_STR: "",
            PRODUCTNAMEERR_STR: "",
            PRODUCTPRICEERR_STR: "",
            PRODUCTDESCRIPTIONERR_STR: "",
            PRODUCTDETAILERR_STR: "",
            PRODUCTHASHTAGERR_STR: "",
            productName_input_str: "{% DEFALUT_PRODUCTNAME_INPUT_STR %}",
            productPrice_input_str: "{% DEFALUT_PRODUCTPRICE_INPUT_STR %}",
            productHashtag_input_str: "{% DEFALUT_PRODUCTHASHTAGE_INPUT_STR %}",
            productDescription_input_str: "{% DEFALUT_PRODUCTDES_INPUT_STR %}",
            productDetail_input_str: "{% DEFALUT_PRODUCTDET_INPUT_STR %}",
            productImg_imgArr: [],
            previews: [],
        };
    },
    methods: {
        async submit_btn() {
            this.PRODUCTIMGERR_STR = "";
            this.PRODUCTNAMEERR_STR = "";
            this.PRODUCTPRICEERR_STR = "";
            this.PRODUCTDESCRIPTIONERR_STR = "";
            this.PRODUCTDETAILERR_STR = "";
            this.PRODUCTHASHTAGERR_STR = "";

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
                const formData = new FormData();
                formData.append("name", this.productName_input_str);
                formData.append("price", this.productPrice_input_str);
                formData.append("hashtag", this.productHashtag_input_str);
                formData.append("des", this.productDescription_input_str);
                formData.append("detail", this.productDetail_input_str);
                this.productImg_imgArr.forEach((file) => formData.append("images", file));

                await axios
                    .post("/editdata", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    })
                    .then((res) => {
                        if (res.status === 201) {
                            window.location.href = "/myshop";
                        } else if (res.status === 401) {
                            window.location.href = "/fail/Require Denied/401";
                        } else if (res.status === 403) {
                            document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            document.cookie = "au4a83=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                            window.location.href = "/fail/Require Denied/403";
                        }
                    });
            }
        },
        handle_img(event) {
            this.productImg_imgArr = [...event.target.files];
            this.previews = this.productImg_imgArr.map((file) => URL.createObjectURL(file));
        },
    },
};

createApp(App).mount("#editProduct_formId");
//app.mount("#editProduct_formId");

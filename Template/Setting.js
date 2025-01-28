const window1 = document.getElementById("check_pwd_div");

const app = Vue.createApp({
    data() {
        return {
            ACCOUNT_ERR: "",
            PASSWORD_ERR: "",
            pwd: "",
            name: "",
            shop: "",
            old_pwd: "",
            con_pwd: "",
        };
    },
    methods: {
        logout() {
            document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "au4a83=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            window.location.href = "/success/Logout";
        },
        change_pwd() {
            window1.style.display = "flex";

            console.log("clicked");
        },
        change_info() {},
        delete_acc() {},
        check_pwd_close() {
            window1.style.display = "none";
        },
        // login() {
        //     this.ACCOUNT_ERR = "";
        //     this.PASSWORD_ERR = "";
        //     fetch("/logindata", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify({
        //             acc: this.acc,
        //             pwd: this.pwd,
        //         }),
        //     })
        //         .then((res) => {
        //             if (res.status === 200) {
        //                 window.location.href = "success/Login";
        //             } else if (res.status === 401) {
        //                 this.ACCOUNT_ERR = "Email not found.";
        //             } else if (res.status === 403) {
        //                 this.PASSWORD_ERR = "Wrong password.";
        //             }
        //         })
        //         .catch((error) => console.error("Error:", error));
        // },
    },
});
app.mount("#setting_form");

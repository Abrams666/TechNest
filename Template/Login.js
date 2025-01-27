const app = Vue.createApp({
    data() {
        return {
            ACCOUNT_ERR: "",
            PASSWORD_ERR: "",
            acc: "",
            pwd: "",
        };
    },
    methods: {
        login() {
            this.ACCOUNT_ERR = "";
            this.PASSWORD_ERR = "";

            fetch("/logindata", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    acc: this.acc,
                    pwd: this.pwd,
                }),
            })
                .then((res) => {
                    if (res.status === 200) {
                        window.location.href = "success/Login";
                    } else if (res.status === 401) {
                        this.ACCOUNT_ERR = "Email not found.";
                    } else if (res.status === 403) {
                        this.PASSWORD_ERR = "Wrong password.";
                    }
                })
                .catch((error) => console.error("Error:", error));
        },
    },
});
app.mount("#login_form");

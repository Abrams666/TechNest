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
            fetch("/logindata", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    acc: this.acc,
                    pwd: this.pwd,
                }),
            })
                .then((response) => {
                    if (response.redirected) {
                        window.location.href = response.url;
                    } else {
                        return response.json();
                    }
                })
                .catch((error) => console.error("Error:", error));
        },
    },
});
app.mount("#login_form");

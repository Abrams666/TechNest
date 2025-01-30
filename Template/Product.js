const app = Vue.createApp({
    data() {
        return {};
    },
    methods: {
        add_item(id) {
            fetch(`/additemdata/add/${id}`, {
                method: "POST",
            })
                .then((res) => {
                    if (res.status === 201) {
                        window.location.href = `/product/${id}`;
                    } else if (res.status === 302) {
                        window.location.href = "/login";
                    }
                })
                .catch((error) => console.error("Error:", error));
        },
    },
});
app.mount("#product_form");

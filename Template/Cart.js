const app = Vue.createApp({
    data() {
        return {};
    },
    methods: {
        add(id) {
            fetch(`/additemdata/add/${id}`, {
                method: "POST",
            }).then((res) => {
                if (res.status === 201) {
                    window.location.href = "/cart";
                }
            });
        },
        reduce(id) {
            fetch(`/additemdata/reduce/${id}`, {
                method: "POST",
            }).then((res) => {
                if (res.status === 201) {
                    window.location.href = "/cart";
                }
            });
        },
        delete(id) {
            fetch(`/additemdata/delete/${id}`, {
                method: "POST",
            }).then((res) => {
                if (res.status === 201) {
                    window.location.href = "/cart";
                }
            });
        },
        pay() {},
    },
});
app.mount("#cart_formId");

const app = Vue.createApp({
    data() {
        return {
            search_contain_input: "",
        };
    },
    methods: {
        search() {
            if (!(this.search_contain_input === "")) {
                window.location.href = `/search/${this.search_contain_input}`;
            }
        },
    },
});
app.mount("#face_div2_2");

const app = Vue.createApp({
    data() {
        return {
            search_contain_input: "{% search_contain_str %}",
        };
    },
    methods: {
        search() {
            if (!(this.search_contain_input === "")) {
                window.location.href = `/search/1/${this.search_contain_input}/`;
            }
        },
        change_page(event) {
            window.location.href = `/search/${event.target.value}/${this.search_contain_input}`;
        },
    },
});
app.mount("#result_formId_2");

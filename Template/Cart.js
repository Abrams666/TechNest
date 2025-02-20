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
		ddelete(id) {
			console.log("delete");

			fetch(`/additemdata/delete/${id}`, {
				method: "POST",
			}).then((res) => {
				if (res.status === 201) {
					window.location.href = "/cart";
				}
			});
		},
		pay() {
			window.location.href = "/pay";
		},
	},
});
app.mount("#cart_formId");

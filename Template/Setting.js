const app = Vue.createApp({
	data() {
		return {
			ACCOUNT_ERR: "",
			NEW_PASS_ERR: "",
			CON_PASS_ERR: "",
			OLD_PASS_ERR: "",
			DEL_PASS_ERR: "",
			PASS_ERR: "",
			WORD_ERR: "",
			pwd: "",
			name: "",
			shop: "",
			old_pwd: "",
			new_pwd: "",
			con_pwd: "",
			info_pwd: "",
			del_pwd: "",
			word_str: "",
			change_pwd_window: false,
			change_info_window: false,
			delete_acc_window: false,
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
			this.change_pwd_window = true;
		},
		change_info() {
			console.log(this.name);
			console.log(this.shop);
			if (this.name !== "" || this.shop !== "") {
				this.change_info_window = true;
			}
		},
		delete_acc() {
			this.delete_acc_window = true;
		},
		check_pwd_close() {
			this.change_pwd_window = false;
		},
		check_info_close() {
			this.change_info_window = false;
		},
		delete_acc_close() {
			this.delete_acc_window = false;
		},
		check_pwd_submit() {
			this.NEW_PASS_ERR = "";
			this.CON_PASS_ERR = "";
			this.OLD_PASS_ERR = "";

			let check = 1;

			if (this.new_pwd === "") {
				this.NEW_PASS_ERR = "Password cannot be empty.";
				check = 0;
			} else if (this.new_pwd.length < 8) {
				this.NEW_PASS_ERR = "Password must be at least 8 characters.";
				check = 0;
			} else if (this.new_pwd !== this.con_pwd) {
				this.CON_PASS_ERR = "Passwords do not match.";
				check = 0;
			}

			if (check === 1) {
				fetch("/changepwd", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						old_pwd: this.old_pwd,
						new_pwd: this.new_pwd,
					}),
				}).then((res) => {
					if (res.status === 401) {
						window.location.href = "/fail/Require Denied/401";
					} else if (res.status === 402) {
						this.OLD_PASS_ERR = "Wrong password.";
					} else if (res.status === 403) {
						document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
						document.cookie = "au4a83=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
						document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

						window.location.href = "/fail/Require Denied/403";
					} else if (res.status === 201) {
						this.change_pwd_window = false;
						this.old_pwd = "";
						this.new_pwd = "";
						this.con_pwd = "";
					}
				});
			}
		},
		check_info_submit() {
			this.PASS_ERR = "";
			let info = {};
			if (this.name !== "" && this.shop !== "") {
				info = {
					type: "both",
					pwd: this.info_pwd,
					name: this.name,
					shop: this.shop,
				};
			} else if (this.name !== "" && this.shop === "") {
				info = {
					type: "name",
					pwd: this.info_pwd,
					name: this.name,
				};
			} else if (this.shop !== "" && this.name === "") {
				info = {
					type: "shop",
					pwd: this.info_pwd,
					shop: this.shop,
				};
			}

			console.log(info);

			fetch("/changeinfo", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(info),
			}).then((res) => {
				if (res.status === 401) {
					window.location.href = "/fail/Require Denied/401";
				} else if (res.status === 402) {
					this.PASS_ERR = "Wrong password.";
				} else if (res.status === 403) {
					document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
					document.cookie = "au4a83=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
					document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

					window.location.href = "/fail/Require Denied/403";
				} else if (res.status === 201) {
					this.change_info_window = false;
					this.info_pwd = "";
				}
			});
		},
		check_delete_acc_submit() {
			this.WORD_ERR = "";
			this.DEL_PASS_ERR = "";

			if (this.word_str !== "I want to delete my account.") {
				this.WORD_ERR = "Does not match";
			} else {
				fetch("/deleteacc", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						pwd: this.del_pwd,
					}),
				}).then((res) => {
					if (res.status === 401) {
						window.location.href = "/fail/Require Denied/401";
					} else if (res.status === 402) {
						this.DEL_PASS_ERR = "Wrong password.";
					} else if (res.status === 403) {
						document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
						document.cookie = "au4a83=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
						document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

						window.location.href = "/fail/Require Denied/403";
					} else if (res.status === 201) {
						document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
						document.cookie = "au4a83=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
						document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

						window.location.href = "/success/Delete Account/201";
					}
				});
			}
		},
	},
});
app.mount("#setting_form");

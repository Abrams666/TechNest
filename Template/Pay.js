const app = Vue.createApp({
    data() {
        return {
            first_name_input: "",
            last_name_input: "",
            num_input_1: "",
            num_input_2: "",
            num_input_3: "",
            num_input_4: "",
            month_input: "",
            year_input: "",
            cvv_input: "",
            cardNum_str: "0000 0000 0000 0000",
            cardName_str: "First Last",
            cardDate_str: "00/00",
            cardCvv_str: "000",
            num_1: "",
            num_2: "",
            num_3: "",
            num_4: "",
            month: "",
            year: "",
            activeBox: "front",
            is_flip: true,
        };
    },
    methods: {
        update_name() {
            this.cardName_str = `${this.first_name_input} ${this.last_name_input}`;
        },
        update_num_1() {
            this.activeBox = "front";
            setTimeout(() => {
                this.is_flip = true;
            }, 150);

            if (this.num_input_1.length > 4) {
                this.num_input_2 = this.num_input_1[4];
                this.$refs.num_input_2.focus();
                this.num_input_1 = `${this.num_input_1[0]}${this.num_input_1[1]}${this.num_input_1[2]}${this.num_input_1[3]}`;
            }

            this.num_1 = this.num_input_1;
            this.num_2 = this.num_input_2;
            this.num_3 = this.num_input_3;
            this.num_4 = this.num_input_4;

            for (let i = 0; i < 4 - this.num_input_1.length; i++) {
                this.num_1 += "0";
            }
            for (let i = 0; i < 4 - this.num_input_2.length; i++) {
                this.num_2 += "0";
            }
            for (let i = 0; i < 4 - this.num_input_3.length; i++) {
                this.num_3 += "0";
            }
            for (let i = 0; i < 4 - this.num_input_4.length; i++) {
                this.num_4 += "0";
            }
            this.cardNum_str = `${this.num_1} ${this.num_2} ${this.num_3} ${this.num_4}`;
        },
        update_num_2() {
            this.activeBox = "front";
            setTimeout(() => {
                this.is_flip = true;
            }, 150);

            if (this.num_input_2.length > 4) {
                this.num_input_3 = this.num_input_2[4];
                this.$refs.num_input_3.focus();
                this.num_input_2 = `${this.num_input_2[0]}${this.num_input_2[1]}${this.num_input_2[2]}${this.num_input_2[3]}`;
            } else if (this.num_input_2.length === 0) {
                this.$refs.num_input_1.focus();
            }

            this.num_1 = this.num_input_1;
            this.num_2 = this.num_input_2;
            this.num_3 = this.num_input_3;
            this.num_4 = this.num_input_4;

            for (let i = 0; i < 4 - this.num_input_1.length; i++) {
                this.num_1 += "0";
            }
            for (let i = 0; i < 4 - this.num_input_2.length; i++) {
                this.num_2 += "0";
            }
            for (let i = 0; i < 4 - this.num_input_3.length; i++) {
                this.num_3 += "0";
            }
            for (let i = 0; i < 4 - this.num_input_4.length; i++) {
                this.num_4 += "0";
            }
            this.cardNum_str = `${this.num_1} ${this.num_2} ${this.num_3} ${this.num_4}`;
        },
        update_num_3() {
            this.activeBox = "front";
            setTimeout(() => {
                this.is_flip = true;
            }, 150);

            if (this.num_input_3.length > 4) {
                this.num_input_4 = this.num_input_3[4];
                this.$refs.num_input_4.focus();
                this.num_input_3 = `${this.num_input_3[0]}${this.num_input_3[1]}${this.num_input_3[2]}${this.num_input_3[3]}`;
            } else if (this.num_input_3.length === 0) {
                this.$refs.num_input_2.focus();
            }

            this.num_1 = this.num_input_1;
            this.num_2 = this.num_input_2;
            this.num_3 = this.num_input_3;
            this.num_4 = this.num_input_4;

            for (let i = 0; i < 4 - this.num_input_1.length; i++) {
                this.num_1 += "0";
            }
            for (let i = 0; i < 4 - this.num_input_2.length; i++) {
                this.num_2 += "0";
            }
            for (let i = 0; i < 4 - this.num_input_3.length; i++) {
                this.num_3 += "0";
            }
            for (let i = 0; i < 4 - this.num_input_4.length; i++) {
                this.num_4 += "0";
            }
            this.cardNum_str = `${this.num_1} ${this.num_2} ${this.num_3} ${this.num_4}`;
        },
        update_num_4() {
            this.activeBox = "front";
            setTimeout(() => {
                this.is_flip = true;
            }, 150);

            if (this.num_input_4.length > 4) {
                this.num_input_4 = `${this.num_input_4[0]}${this.num_input_4[1]}${this.num_input_4[2]}${this.num_input_4[3]}`;
            } else if (this.num_input_4.length === 0) {
                this.$refs.num_input_3.focus();
            }

            this.num_1 = this.num_input_1;
            this.num_2 = this.num_input_2;
            this.num_3 = this.num_input_3;
            this.num_4 = this.num_input_4;

            for (let i = 0; i < 4 - this.num_input_1.length; i++) {
                this.num_1 += "0";
            }
            for (let i = 0; i < 4 - this.num_input_2.length; i++) {
                this.num_2 += "0";
            }
            for (let i = 0; i < 4 - this.num_input_3.length; i++) {
                this.num_3 += "0";
            }
            for (let i = 0; i < 4 - this.num_input_4.length; i++) {
                this.num_4 += "0";
            }
            this.cardNum_str = `${this.num_1} ${this.num_2} ${this.num_3} ${this.num_4}`;
        },
        update_date() {
            this.activeBox = "front";
            setTimeout(() => {
                this.is_flip = true;
            }, 150);

            this.month = "";
            this.year = "";

            if (this.month_input.length === 0) {
                this.month = "00";
            } else if (this.month_input.length === 1) {
                this.month = `0${this.month_input}`;
            } else if (this.month_input.length === 2) {
                this.month = this.month_input;
            }

            if (this.year_input.length < 3) {
                this.year = "00";
            } else if (this.year_input.length === 3) {
                this.year = `${this.year_input[2]}0`;
            } else if (this.year_input.length === 4) {
                this.year = `${this.year_input[2]}${this.year_input[3]}`;
            }

            this.cardDate_str = `${this.month}/${this.year}`;
        },
        update_cvv() {
            this.activeBox = "back";
            setTimeout(() => {
                this.is_flip = false;
            }, 100);

            this.cardCvv_str = `${this.cvv_input}`;
        },
        pay() {},
    },
});
app.mount("#pay_formId");

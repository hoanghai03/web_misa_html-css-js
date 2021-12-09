/**
 * Hàm chuyển đổi dữ liệu ngày tháng
 * createdBy: NHHai 30/11/2021
 * @param {*} value trả về kiểu dữ liệu bất kì
 * @returns
 */
function formatDate(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    } else {
        var day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();
        day = day < 10 ? "0" + day : day;
        month = month < 10 ? "0" + month : month;
        return day + "/" + month + "/" + year;
    }
}
/**
 * Hàm chuyển đổi dữ liệu ngày tháng để hieent thị ra
 * createdBy: NHHai 30/11/2021
 * @param {*} value trả về kiểu dữ liệu bất kì
 * @returns
 */
function formatGetDate(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    } else {
        var day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();
        day = day < 10 ? "0" + day : day;
        month = month < 10 ? "0" + month : month;
        return year + "-" + month + "-" + day;
    }
}

/**
 * Hàm format tiền
 * createdBy NHHai 30/11/2021
 * @param {*} money trả về kiểu bất kì
 * @returns
 */
function formatSalary(money) {
    money = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(money);
    return money;
}
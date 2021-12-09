$(document).ready(function() {
    new MCombobox();

    // Khởi tạo sự kiện cho buttoin combobox
    $(".mcombobox .m-combobox-button").click(btnComboboxOnClick);

    // $('.mcombobox .m-combobox-item').click(itemComboboxOnClick);
    $(".mcombobox").on("click", ".cb-item", itemComboboxOnClick);

    $(".mcombobox input").keydown(inputComboboxOnKeyDown);
    // $('.mcombobox').on('keydown', 'input', inputComboboxOnKeyDown)

    $(".mcombobox input").keyup(inputComboboxOnKeyUp);
    // $('.mcombobox').on('keyup', 'input', inputComboboxOnKeyUp)
});

class MCombobox {
    constructor() {
        this.buildComboboxHTML();
    }

    buildComboboxHTML() {
        // Duyệt tất cả các thẻ là combobox
        let comboboxs = $("combobox");
        $.each(comboboxs, function(index, combobox) {
            // Lấy tất cả các thông tin chi tiết
            const api = combobox.getAttribute("api");
            const propertyDisplay = combobox.getAttribute("propertyDisplay");
            const propertyCode = combobox.getAttribute("propertyCode");
            const id = combobox.getAttribute("id");
            const fieldName = combobox.getAttribute("fieldName");
            // Build html của combobox
            let comboboxHTML = $(`<div mcombobox id=${id || ""} class="mcombobox" fieldName="${fieldName}">
                                    <input type="text" class="m-input" autocomplete="off" fieldName="${fieldName}" propertyDisplay="${propertyDisplay}" required/>
                                    <button tabindex="-1" class="m-combobox-button m-icon m-icon-dropdown">
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="m-combobox-data">
                                        <div class="cb-table">
                                            <div class="cb-table-left">Mã đơn vị</div>
                                            <div class="cb-table-right">Tên đơn vị</div>
                                        </div>
                                    </div>
                                </div>`);
            if (api && propertyDisplay && fieldName && propertyCode) {
                // Lấy dữ liệu từ api
                $.ajax({
                    type: "GET",
                    url: api,
                    async: false,
                    success: function(data) {
                        // build combobox data
                        $.each(data, function(index, item) {
                            let text = item[propertyDisplay];
                            let value = item[fieldName];
                            let code = item[propertyCode];
                            let itemHTML = `<div class="cb-item" value="${value}">
                                                <div class="item-code">${code}</div>
                                                <div class="m-combobox-item" >${text}</div>
                                            </div>`;
                            $(comboboxHTML).find(".m-combobox-data").append(itemHTML);
                        });

                    },
                });
            }
            $(combobox).replaceWith(comboboxHTML);
            $(comboboxHTML).data("itemDataElements", $(comboboxHTML).find(".m-combobox-data").children());

        });
    }
}

function inputComboboxOnKeyUp() {
    switch (event.keyCode) {
        case 13:
        case 40:
        case 38:
        case 9: // nút tab
            break;

        default:
            $(this).siblings(".m-combobox-data").empty();
            let itemDataElement = $(this.parentElement).data("itemDataElements");
            //build html
            $(this).siblings(".m-combobox-data").html(itemDataElement);
            // Thực hiện lọc dữ liệu trong combobox data item
            // 1. lấy input đã nhập
            let valueInput = this.value;
            // 2. Duyệt từng item và kiếm tra xem data nào có text trùng
            let items = $('.cb-item');
            for (const item of items) {
                let text = item.textContent;
                if (!text.toLowerCase().includes(valueInput.toLowerCase())) {
                    item.remove();
                }
            }
            // Hiển thị data của combobox hiện tại
            $(this).siblings(".m-combobox-data").show();
            break;
    }
}

function inputComboboxOnKeyDown() {
    // Lấy tất cả item element của combobox
    let items = $(this).siblings(".m-combobox-data").children();
    // Bỏ hover item đã được set trước đó
    // $(items).removeClass("m-combobox-item-hover");

    // Kiểm tra xem có item nào đã ở trạng thái được hover chưa
    let itemHovered = items.filter(".m-combobox-item-hover");
    switch (event.keyCode) {
        case 13: // Nhấn phím enter
            // Nếu có item nào được chọn thì lấy text và value
            if (itemHovered.length == 1) {

                itemHovered = itemHovered[0];
                let text = $(itemHovered).find('.m-combobox-item').text();
                let value = $(itemHovered).attr("value");
                // 3. Gán text vào input của combobox:
                // 3.1 lấy ra element cha
                let parentElement = itemHovered.parentElement;
                // 3.2 - Tìm element input ngang cấp với element cha rồi thực hiện gán
                $(parentElement).siblings("input").val(text);
                $(parentElement).siblings("input").trigger('blur');

                // Gán value cho input
                $(parentElement).siblings("input").data('value', value);
                // Ẩn combobox data đi
                $(parentElement).hide();
            }
            break;
        case 40: // Nhấn phím mũi tên xuống của bàn phím
            // Nếu đã có item được hover trước đó thì hover item kế kiếp
            if (itemHovered.length > 0) {
                // Lấy element kế tiếp
                let nextElement = itemHovered.next();
                // Thêm class hover cho element kế tiếp
                nextElement.addClass("m-combobox-item-hover");
                // Xóa class ở element hiện tại
                itemHovered.removeClass("m-combobox-item-hover");
            } else {
                // Nếu chưa có item nào được hover thì mặc định focus vào item đầu tiên trong data của combobox
                // chọn item đầu tiên
                let firstItem = items[1];
                firstItem.classList.add("m-combobox-item-hover");
            }
            // Hiển thị data của combobox hiện tại
            $(this).siblings(".m-combobox-data").show();
            break;
        case 38: // Nhấn phím mũi tên lên của bàn phím
            // Nếu đã có item được hover trước đó thì hover item kế kiếp
            if (itemHovered.length > 0) {
                // Lấy element trước
                let prevElement = itemHovered.prev();
                if ($(prevElement).attr('class') == 'cb-table') {
                    prevElement = prevElement.prev();
                }
                // Thêm class hover cho element trước
                prevElement.addClass("m-combobox-item-hover");
                // Xóa class ở element hiện tại
                itemHovered.removeClass("m-combobox-item-hover");
            } else {
                // Nếu chưa có item nào được hover thì mặc định focus vào item cuối trong data của combobox
                // chọn item cuối cùng
                let lastItem = items[items.length - 1];
                lastItem.classList.add("m-combobox-item-hover");
            }
            // Hiển thị data của combobox hiện tại
            $(this).siblings(".m-combobox-data").show();
            break;
        default:
            break;
    }
}

function btnComboboxOnClick() {
    // Hiển thị combobox datacủa chính combobox hiện tại
    // 1. Xác định combobox data của combobox hiện tại
    let comboboxData = $(this).siblings(".m-combobox-data");
    // 2. Hiển thị
    comboboxData.toggle();
}

function itemComboboxOnClick() {
    // Hiển thị text vừa được chọn lên input
    // 1. Lấy text trong item vừa chọn
    const text = $(this).children('.m-combobox-item').text();
    // 2. Lấy ra value của item vừa chọn
    const value = $(this).attr('value');
    // 3. Gán text vào input của combobox:
    // 3.1 lấy ra element cha
    let parentElement = this.parentElement;
    // 3.2 - Tìm element input ngang cấp với element cha rồi thực hiện gán
    $(parentElement).siblings("input").val(text);
    $(parentElement).siblings("input").trigger('blur');
    // 4. Gán value cho input
    // thực hiện lưu value vào DATA của element
    $(parentElement).siblings("input").data("value", value);
    // Ẩn combobox data đi
    $(parentElement).hide();
}
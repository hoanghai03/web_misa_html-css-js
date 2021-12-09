class Base {
    constructor() {
        this.host = 'http://amis.manhnv.net/api/v1';
        this.apiRouter = null;
        this.id = null;
        this.newEntityCode = null;
        this.entityCode = null;
        // là mã code của phòng ban
        this.code = null;
        // trang hiển thị đầu tiên là 1
        this.curentPageIndex = 1;
        // biến tổng số trang
        this.totalPageEntity = null;
        // biến để xét khi search dữ liệu
        this.timer = null;
        this.setApi();
        this.setId();
        this.setNewEntityCode();
        this.setCode();
        this.loadData();
        this.initEvents();
        // click vào bên ngoài sự kiện delete-entity và thực hiện ẩn delete-entity
        this.clickOutSideDeleteEntity();

        // click vào bên ngoài data select và thực hiện đóng data select
        this.clickOutDataSelect();
    }

    setApi() {}
    setId() {}
    setNewEntityCode() {}
    setCode() {}

    /**
     * Hàm load dữ liệu table
     * createdBy: NHHAi 29/11/1021
     */
    loadData() {
        var me = this;
        try {
            // console.log("vào hàm");
            //Làm sạch bảng
            $("table tbody").empty();
            // Lấy thông tin số cột th
            var ths = $("table thead th");
            // css loading
            $(".loading-data").show();
            // xóa forcus item select
            $('.select-item').removeClass('focus-item');
            // Lấy các thông tin thực hiện phân trang
            const searchText = $('#txtSearch').val();
            let pageSize = $('#cbxPageSize').data('value');
            if (pageSize == undefined) pageSize = 10;
            const pageNumber = me.curentPageIndex;
            let apiUrl = `http://amis.manhnv.net/api/v1/Employees/filter?pageSize=${pageSize}&pageNumber=${pageNumber}&employeeFilter=${searchText}`;
            // lấy thông tin dữ liệu
            $.ajax({
                    // Lấy dữ liệu về qua API
                    // url: me.host + me.apiRouter,
                    url: apiUrl,
                    method: "GET",
                })
                .done(function(res) {
                    if (res != undefined) { // TH: Nếu dữ liệu không rỗng
                        /**============================= HIỂN THỊ DỮ LIỆU ========================================= */
                        // Nếu thành công thì sẽ vào hàm done này
                        // Hàm dưới load lại tất cả dữ liệu của API
                        $.each(res.Data, function(index, obj) {
                            var tr = $("<tr></tr>");
                            $(tr).data("elementId", obj[me.id]);
                            $(tr).data("entityCode", obj[me.entityCode]);
                            // Lấy thông tin dữ liệu tương ứng với các propetyName trong thẻ th của table
                            $.each(ths, function(index, th) {
                                var td = $("<td></td>");
                                switch (index) {
                                    case 0:
                                    case ths.length - 1:
                                    case ths.length - 2:
                                        break;
                                    case 1:
                                        $(td).append('<input type="checkbox" class="m-icon-checkbox">')
                                        break;
                                    case ths.length - 3:
                                        $(td).append(`<button class="btnEdit">Sửa</button>
                                    <button class="icon-down-delete m-icon m-icon-down-delete"></button>`);
                                        break
                                    default:
                                        var nameProperty = $(th).attr("fieldName");
                                        var value = obj[nameProperty];
                                        // format các cột ngày tháng và lương
                                        if (nameProperty == "DateOfBirth") {
                                            $(td).addClass("text-center-col");
                                            value = formatDate(value);
                                        } else if (nameProperty == "Salary") {
                                            $(td).addClass("text-right-col");
                                            value = formatSalary(value);
                                        }
                                        $(td).append(value);
                                        break;
                                }

                                $(tr).append(td);
                            });
                            $("table tbody").append(tr);
                        });
                        // Tắt thông báo không có dữ liệu
                        $('.below-table').hide();
                        /**============================= PHẦN PHÂN TRANG ========================================= */
                        // Hiển thị paging bar
                        $('.paging-bar').show();
                        // Tính tổng số bản ghi
                        const totalRecord = res.TotalRecord;
                        // Gán số bản ghi vào text
                        $('.total-record').text(totalRecord);
                        //Tính tổng số trang
                        const totalPage = res.TotalPage;
                        me.totalPageEntity = totalPage;
                        // Xóa hết số trong paging
                        $('.paging-number').empty();
                        // Css màu text khi trang ở vị trí là 1
                        if (me.curentPageIndex == 1) {
                            $('.p-left').addClass('color-text');
                        } else {
                            $('.p-left').removeClass('color-text');
                        }
                        // Css màu text khi trang ở vị trí cuối cùng
                        if (me.curentPageIndex == totalPage) {
                            $('.p-right').addClass('color-text');
                        } else {
                            $('.p-right').removeClass('color-text');
                        }
                        // focus vào item select 
                        let valueItem = $('#cbxPageSize').data('value');
                        if (valueItem == undefined) valueItem = 10;
                        $(`#cbxPageSize .item-${valueItem}`).addClass('focus-item');
                        switch (totalPage) {
                            case 1: // Trường hợp bản ghi tuef 1 đến 4 thì hiển thị đầy đủ
                            case 2:
                            case 3:
                            case 4:
                                for (let i = 1; i <= totalPage; i++) {
                                    let buttonHTML = `<div class='page-index page-index-${i}' value="${i}">${i}</div>`;
                                    $('.paging-number').append(buttonHTML);
                                }
                                break;

                            default: // Trường hợp bản ghi từ 5 trở lên
                                if (me.curentPageIndex == 1 || me.curentPageIndex == 2) {
                                    // TH1: đang nằm ở trang 1 và 2 sẽ hiển thị trang 1 đến trang 3
                                    for (let i = 1; i <= 3; i++) {
                                        $('.paging-number').append(`<div class='page-index page-index-${i}' value="${i}"></div>`);
                                        $(`.page-index-${i}`).text(i);
                                    }
                                    // Các trang ở giữa là các dấu chấm
                                    $('.paging-number').append(`<div class='page-index-dot-right'></div>`);
                                    $('.page-index-dot-right').text('...');
                                    // Hiển thị trang cuối
                                    $('.paging-number').append(`<div class='page-index page-index-${totalPage}' value="${totalPage}"></div>`);
                                    $(`.page-index-${totalPage}`).text(totalPage);
                                } else if (me.curentPageIndex == Number(totalPage) - 1 || me.curentPageIndex == totalPage - 2 || me.curentPageIndex == totalPage) {
                                    // TH2: đang nằm ở 3 trang cuối cùng
                                    // Hiển thị trang 1
                                    $('.paging-number').append(`<div class='page-index page-index-1' value="1"></div>`);
                                    $(`.page-index-1`).text(1);
                                    // Hiển thị dấu ...
                                    $('.paging-number').append(`<div class='page-index-dot-left'></div>`);
                                    $('.page-index-dot-left').text('...');
                                    // Hiển thị 3 trang cuối
                                    for (let i = totalPage - 2; i <= totalPage; i++) {
                                        $('.paging-number').append(`<div class='page-index page-index-${i}' value="${i}"></div>`);
                                        $(`.page-index-${i}`).text(i);
                                    }

                                } else { //TH3:  đang nằm ở các trang từ trang 3 -> trang thứ 4 từ dưới lên
                                    // hiển thị trang 1
                                    $('.paging-number').append(`<div class='page-index page-index-1' value="1"></div>`);
                                    $(`.page-index-1`).text(1);
                                    // hiển thị các dấu ...
                                    $('.paging-number').append(`<div class='page-index-dot-left'></div>`);
                                    $('.page-index-dot-left').text('...');
                                    // Hiển thị trang đang đứng và 2 trang kế tiếp
                                    for (let i = me.curentPageIndex; i <= Number(me.curentPageIndex) + 2; i++) {
                                        $('.paging-number').append(`<div class='page-index page-index-${i}' value="${i}"></div>`);
                                        $(`.page-index-${i}`).text(i);
                                    }
                                    // Hiển thị dấu ...
                                    $('.paging-number').append(`<div class='page-index-dot-right'></div>`);
                                    $('.page-index-dot-right').text('...');
                                    // Hiển thị trang cuối cùng
                                    $('.paging-number').append(`<div class='page-index page-index-${totalPage}' value="${totalPage}"></div>`);
                                    $(`.page-index-${totalPage}`).text(totalPage);
                                }

                                break;
                        }
                        // border cho trang hiện tại
                        $(`.page-index-${me.curentPageIndex}`).addClass('border-index');
                        // ===========================================================================================
                    } else if (me.curentPageIndex >= 2) {
                        // Xét nếu trường hợp xóa bản ghi cuối cùng của trang mà trang đó lớn hơn 1 thì nó sẽ nhảy về trang trước đó
                        me.curentPageIndex = Number(me.curentPageIndex) - 1;
                        me.loadData();
                    } else {
                        // TH : hết dữ liệu 
                        // Xóa hết tổng số bản ghi
                        $('.total-record').text(0);
                        // Xóa hết phân trang
                        $('.paging-number').empty();
                        // Ẩn paging
                        $('.paging-bar').hide();
                        // Hiển thị thông báo không có dữ liệu
                        $('.below-table').show();
                    }

                    // ấn loading
                    $(".loading-data").hide();
                    // console.log("xong hàm");
                })
                .fail(function(res) {
                    // Nếu thất bại thì sẽ vào đây
                    $(".loading-data").hide();
                    console.log(res);
                    if (res.status == 400) {
                        $('.popup-content .messenger-warning').text(`Dữ liệu đầu vào không hợp lệ`);
                        $('.popup-bot-right').append('<button class="close-popup m-btn">Đồng ý</button>')
                        $('#popup').show();
                    }
                });
        } catch (error) {
            console.log("Lỗi : " + error);
            $(".loading-data").hide();

        }
    }

    /**
     * Hàm hiển thị các sự kiện
     * createdBy NHHai 29/11/2021
     */
    initEvents() {
        var me = this;
        // Sự kiện click vào nút thêm mới để hiển thị dialog entity
        $('#addEntity').click(this.addEntity.bind(this));

        // Sự kiện click vào nút hủy để đóng dialog
        $('#closeDialog').click(this.closeDialog);

        // sự kiện click vào dấu X để tắt dialog
        $('.icon-close').click(this.closeDialog);

        // Sự kiện click vào nút hủy để đóng popup
        $('.popup-bottom').on('click', '.close-popup', this.closePopup.bind(this));

        // Load lại dữ liệu khi click vào nút refresh
        $("#refresh").click(this.loadData.bind(this));

        // validate dữ liệu trống
        $("input[required]").blur(this.validateNullValue);

        // validate email
        $("input[type='email']").blur(this.validateEmail);

        // validate Date
        $("input[type='date']").blur(this.validateDate);

        // Lưu dữ liệu xuông database khi click vào nút Cất 
        $('#saveEntity,#saveAndContinue').click(this.saveEntity.bind(this));

        // Hiển thị dữ liệu chi tiết khi double click vào từng hàng trong table
        $("table tbody").on("dblclick", "tr", this.dbClickOnTr.bind(this));

        // click vào nút sửa cột cuối cùng ở table
        $("table tbody ").on("click", ".btnEdit", this.dbClickOnTr.bind(this));

        // click vào icon cột cuối cùng ở table để hiển thị nút xóa
        $("table tbody ").on("click", ".icon-down-delete", this.showBtnDel.bind(this));

        // click vào button xóa để hiển thị dialog cảnh báo
        $('#delEntity').click(this.delEntity.bind(this));

        // click vào button Xóa trên popup để xóa nhân viên đang chọn
        $('.popup-bottom').on('click', '#deleteEntity', this.deleteEntity.bind(this));

        // hover vào icon hiển thị lựa chọn data select
        $('.icon-dropdown').hover(this.hoverIconSelect);

        // click vào icon để hiển thị lựa chọn
        $('.show-select').click(this.showDataSelect);

        // click vào item để chọn bản ghi
        $('.select-item').click(this.selectItem.bind(this));

        // click vào các index ở phân trang để chuyển trang VD: trang 1,2,3,...
        $(".paging").on("click", ".page-index", this.changeAnyPage.bind(this));

        // click vào nút Sau để chuyển đến trang kế tiếp
        $(".paging").on("click", ".page-index-dot-right, .p-right", this.nextPage.bind(this));

        // click vào nút trước để chuyển sang trang trước
        $(".paging").on("click", ".page-index-dot-left , .p-left", this.prevPage.bind(this));

        //khi click checked vào input ở table thì nó hover cả tr đó
        $('table tbody').on('click', 'input[type="checkbox"]', this.forcusTrClick);

        //  Khi click vào checkbox ở trên th thì sẽ focus tất cả checkbox
        $('table thead').on('click', 'input[type="checkbox"]', this.allCheckBox);

        // Nhập vào ô input search và nó sẽ tự động search
        $('#txtSearch').on('keyup', this.searchTable.bind(this));
    }

    /**
     * Hàm hiển thị dialog entity
     * createdBy NHHai 29/11/2021
     */
    addEntity() {
        try {
            var me = this;
            this.formMode = Enum.FormMode.Add;
            $('input[type="radio"]').attr('checked', false);
            $('#rdMale').attr('checked', true);
            // Hiển thị form chi tiết 
            $("#dialog").show();
            // Xóa hế dữ liệu
            $("input").val(null);
            // Lấy mã mới và hiển thị lên ô nhập mã
            $.ajax({
                    url: me.host + me.newEntityCode,
                    method: "GET",
                })
                .done(function(res) {
                    $("#txtEntityCode").val(res);
                    // Focus vào ô nhập liệu 
                    $("#txtEntityCode").focus();
                })
                .fail(function(res) {});
        } catch (error) {
            console.log("Lỗi : " + error);
        }
    }

    /**
     * Đóng dialog 
     * createdBy NHHai 29/11/2021
     */
    closeDialog() {
        $('#dialog').hide();
    }

    /**
     * Đóng popup 
     * createdBy NHHai 30/11/2021
     */
    closePopup() {
        this.elementId = undefined;
        // Xóa hết các nút
        $('.popup-bot-left').empty();
        $('.popup-bot-right').empty();
        $('#popup').hide();
    }

    /**
     * Hàm lưu thông tin entity vào csdl
     * createdBy NHHai 29/11/2021
     * @param {*} sender sender là element mình click vào
     * @returns 
     */
    saveEntity(sender) {
        try {
            var me = this
                // validate dữ liệu
            var inputvalidates = $('input[required]');
            $.each(inputvalidates, function(index, input) {
                $(this).trigger("blur");
            });

            var inputNotValidates = $('input[validate="false"]');
            if (inputNotValidates && inputNotValidates.length > 0) {
                $('.popup-content .messenger-warning').text(`Dữ liệu trống hoặc không đúng định dạng`);
                $('.popup-bot-right').append('<button class="close-popup m-btn">Đồng ý</button>')
                $('#popup').show();
                inputNotValidates[0].focus();
                return;
            }
            // Thu thập các thông tin dữ liệu
            var inputs = $("#dialog input[fieldName]");
            // Build thành object
            var entity = {};
            $.each(inputs, function(index, input) {
                let property = $(this).attr("fieldName");
                let value = "";
                switch (property) {
                    case "DepartmentId":
                    case "PositionId":
                        value = $(this).data("value");
                        entity[property] = value;
                        break;
                    case "Gender":
                        var val = $(this).attr('val');
                        if (this.checked) entity[property] = val;
                        break;
                    default:
                        value = $(this).val();
                        entity[property] = value;
                        break;
                }
            });
            // Sử dung ajax lưu dữ liệu
            var method = "POST";
            var id = "";
            // var toastMs = "#toastMsSuccess";
            if (me.formMode == 2) {
                method = "PUT";
                id = me.entityId;
                // toastMs = "#toastMsEditSuccess";
            }
            $.ajax({
                    url: me.host + me.apiRouter + id,
                    method: method,
                    data: JSON.stringify(entity),
                    contentType: "application/json",
                })
                .done(
                    function(res) {
                        let text = $(sender.currentTarget).attr('id');
                        // 2 trường hợp
                        switch (text) {
                            case 'saveEntity': // TH 1: khi bấm Cất thì thực hiện lưu xong sẽ ấn form
                                $("#dialog").hide();
                                // Load lại dữ liệu
                                me.loadData();
                                break;
                            case 'saveAndContinue':
                                // Load lại dữ liệu
                                me.loadData();
                                // TH 2: Khi bấm Cất và Thêm thì thực hiện lưu xong nó sẽ xóa hết dữ liệu để nhập tiếp
                                me.addEntity();
                                break;
                            default:
                                break;
                        }
                    }
                )
                .fail(function(res) {
                    if (res.status == 400) {
                        let input = $('#txtEntityCode').val()
                        $('.popup-content .messenger-warning').text(`Mã nhân viên <${input}> đã tồn tại trong hệ thống vui lòng kiểm tra lại.`);
                        $('.popup-bot-right').append('<button class="close-popup m-btn">Đồng ý</button>')
                        $('#popup').show();
                    }
                });
        } catch (error) {
            console.log("Lỗi : " + error);
        }
    }

    /**
     * Hàm hiển thị thông tin chi tiết khách hàng khi double click vào hàng của bảng danh sách nhân viên
     * createdBy NHHai 30/11/2021
     * @param {*} sender
     */
    dbClickOnTr(sender) {
        try {
            this.formMode = Enum.FormMode.Edit;
            // Hiển thị form chi tiết nhân viên
            $("#dialog").show();
            //Xóa hết dữ liệu
            $("input").val(null);
            if ($(sender.currentTarget).html() == 'Sửa') {
                this.entityId = $(sender.currentTarget).parents('tr').data("elementId");

            } else {
                this.entityId = $(sender.currentTarget).data("elementId");
            }
            this.entityId = "/" + this.entityId;
            $.ajax({
                    url: this.host + this.apiRouter + this.entityId,
                    method: "GET",
                })
                .done(function(res) {
                    console.log(res);
                    var inputs = $("#dialog input[fieldName]");
                    $.each(inputs, function(index, input) {
                        let property = $(this).attr("fieldName");
                        let propertyDisplay = $(this).attr("propertyDisplay");
                        let value = res[property];
                        if (propertyDisplay != null) {
                            $(this).val(res[propertyDisplay]);
                        } else {
                            switch (property) {
                                case "DateOfBirth":
                                case "IdentityDate":
                                    $(this).val(formatGetDate(value));
                                    break;
                                case "Gender":
                                    $('input[type="radio"]').attr('checked', false);
                                    switch (value) {
                                        case 0:
                                            $('#rdFemale').attr('checked', true);
                                            break;
                                        case 1:
                                            $('#rdMale').attr('checked', true);
                                            break;
                                        default:
                                            $('#rdOther').attr('checked', true);
                                            break;
                                    }
                                    break;
                                default:
                                    $(this).val(value);
                                    break;
                            }
                        }

                    });
                })
                .fail(function(res) {});
        } catch (error) {
            console.log("Lỗi : " + error);
        }
    }

    /**
     * Hàm hiển thị nút xóa khi click vào icon cột chưc năng
     * createdBy NHHai 30/11/2021
     */
    showBtnDel(sender) {
        var rect = sender.currentTarget.getBoundingClientRect();
        this.elementId = $(sender.currentTarget).parents('tr').data("elementId");
        this.code = $(sender.currentTarget).parents('tr').data("entityCode");

        // console.log(rect.top, rect.right, rect.bottom, rect.left);
        $('.delete-entity').css('top', rect.top + 20);
        setTimeout(() => {
            $('.delete-entity').addClass('show');
        }, 0);
    }

    /**
     * Hàm hiển thị dialog cảnh báo xóa
     * createdBy NHHai 30/11/2021
     * 
     */
    delEntity() {
        $('.popup-bottom .popup-bot-left').append('<button class="close-popup m-second-btn">Không</button>');
        $('.popup-bottom .popup-bot-right').append('<button id="deleteEntity" class="m-btn">Có</button>');
        $('.popup-content .messenger-warning').text(`Bạn có thực sự muốn xóa Nhân viên <${this.code}> không?`);
        $('#delEntity').fadeOut();
        $('#popup').show();
    }

    /**
     * Hàm xóa entity đang chọn
     * createdBy NHHai 1/12/2021
     */
    deleteEntity() {
        try {
            let employeeId = this.elementId;
            if (employeeId != undefined) {
                $.ajax({
                        type: "DELETE",
                        url: this.host + this.apiRouter + "/" + `${employeeId}`,
                    })
                    .done(
                        function(res) {
                            // Ẩn dialog
                            $("#popup").hide();
                            // xóa hết các nút
                            $('.popup-bot-left').empty();
                            $('.popup-bot-right').empty();
                            // Load lại dữ liệu
                            this.loadData();
                            this.entityId = undefined;

                        }.bind(this)
                    )
                    .fail(function(res) {});
            }
        } catch (error) {
            console.log("Lỗi : " + error);
        }
    }

    /**
     * Hàm lựa chọn số bản ghi/trang
     * createdBy NHHai 2/12/2021
     */
    selectItem(sender) {
        $('#cbxPageSize .select').empty();
        // ẩn data select
        $('#dataSelect').hide();
        // lấy giá trị text trong item vừa chọn
        let text = $(sender.currentTarget).text();
        // lấy giá trị value của item hiện tại
        let value = $(sender.currentTarget).attr("value");
        // gán text vaof select
        $('#cbxPageSize .select').text(text);
        // gán value vào data  của cbxPageZize
        $('#cbxPageSize').data("value", value);
        // load lại dữ liệu
        this.loadData();
    }

    forcusTrClick() {
        // Kiểm tra xem nếu checked == true thì sẽ checked vào tr đó
        if (this.checked) {
            debugger
            // focus cho td cha của nó
            $(this).parents('td').addClass('hover-tr');
            // focus cho những td xung quanh td cha ngoại trừ td đầu và 2 cái cuối
            $(this).parents('td').siblings('td:not(:first-child,:nth-last-child(-n+2))').addClass('hover-tr');
            // focus vào cà thành phần con của cột chức năng
            $(this).parents('td').siblings('td:nth-last-child(3)').children().addClass('hover-tr');
        } else {
            // xóa class hover-tr trong td cha
            $(this).parents('td').removeClass('hover-tr');
            // xóa class hover-tr trong các td xung quanh
            $(this).parents('td').siblings('td').removeClass('hover-tr');
            // xóa class hover-tr cho các phần con của cột chức năng
            $(this).parents('td').siblings('td:nth-last-child(3)').children().removeClass('hover-tr');
        }
    }

    /**
     * Hàm tick và bỏ tick tất cả các ô checkbox trong table
     * createdBy NHHai 3/21/2021
     */
    allCheckBox() {
        if (this.checked) { // nếu chưa click vào checkbox
            $('tbody input[type="checkbox"]').each(function() { //lặp tất cả các checkbox
                this.checked = true; //tick tất cả     
                // add class cho tất cả các td
                $('tbody td:not(:first-child,:nth-last-child(-n+2))').addClass('hover-tr');
                $('tbody td:nth-last-child(3)').children().addClass('hover-tr');

            });

        } else {
            $('tbody input[type="checkbox"]').each(function() { //lặp tất cả các checkbox
                this.checked = false; //bỏ tick tất cả 
                // bỏ class hover-tr cho tất cả td
                $('tbody td').removeClass('hover-tr');
                $('tbody td:nth-last-child(3)').children().removeClass('hover-tr');
            });
        }
    }

    /**
     * Hàm thực hiện search tìm kiếm trên table
     * createdBy NHHai 3/12/2021
     */
    searchTable() {
        var me = this
        clearTimeout(me.timer);
        me.timer = setTimeout(() => {
            me.loadData();
        }, 500);
    }

    /**
     * Hàm click vào trang bất kì để chuyển trang
     * createdBy NHHai 3/12/2021
     * @param {*} sender 
     */
    changeAnyPage(sender) {
        var me = this;
        me.curentPageIndex = $(sender.currentTarget).attr("value");
        me.loadData();
    }

    /**
     * Hàm click vào nút Trước để chuyển sang trang phía trước
     * createdBy NHHai 3/12/2021
     */
    nextPage() {
        var me = this;
        let totalPage = Number(me.totalPageEntity);
        let pageCurent = Number(me.curentPageIndex);
        if (pageCurent < totalPage) {
            me.curentPageIndex = pageCurent + 1;
            me.loadData();
        }
    }

    /**
     * Hàm click vào nút Sau để chuyển sang trang phía trước
     * createdBy NHHai 3/12/2021
     */
    prevPage() {
        var me = this;
        let pageCurent = Number(me.curentPageIndex);
        // kiểm tra xem nếu trang ở vị trí lớn hơn 1 thì khi click mới chuyển xuống trang thấp hơn
        if (pageCurent > 1) {
            me.curentPageIndex = pageCurent - 1;
            me.loadData();
        }
    }

    /**
     * Hàm hiển thị data select
     * createdBy NHai 3/12/2021
     */
    showDataSelect() {
        // Hàm show nó ẩn cmn trước khi vào hàm này rồi 
        setTimeout(() => {
            $('#dataSelect').addClass('show');
            $('.icon-dropdown').addClass('rotate-icon');
        }, 0);
    }

    /**
     * Hàm khi mình click bên ngoài nút Xóa để ẩn nút xóa
     * createdBy NHHai 3/12/2021
     */
    clickOutSideDeleteEntity() {
        const popups = [...document.getElementsByClassName('delete-entity')];
        window.addEventListener('click', ({ target }) => {
            popups.forEach(p => p.classList.remove('show'));
        });
    }

    /**
     * Hàm khi mình click bên ngoài data select để ẩn data select và icon quay trở lại
     * createdBy NHHai 3/12/2021
     */
    clickOutDataSelect() {
        const popupss = [...document.getElementsByClassName('data-select')];
        const icons = [...document.getElementsByClassName('icon-dropdown')];
        window.addEventListener('click', ({ target }) => {
            popupss.forEach(p => p.classList.remove('show'));
            icons.forEach(p => p.classList.remove('rotate-icon'));

        });
    }

    /** 
     * hàm khi hover vào icon trong select ở paging bar thì set background cho thằng cha của nó
     * */
    hoverIconSelect() {
        $('.icon-select').css('background-color', '#f8f8f8');
    }

    /**
     * Hàm validate dữ liệu , những ô input yêu cầu phải nhập thông tin không được để trống
     * createdBy NHHai 29/11/2021
     */
    validateNullValue() {
        // lấy giá trị trong input
        let value = $(this).val();
        if (value == "") {
            $(this).addClass("input-warning");
            $(this).attr("title", "Không được để trống");
            $(this).attr("validate", "false");
        } else {
            $(this).removeClass("input-warning");
            $(this).attr("validate", "true");
        }
    }

    /**
     * Hàm validate dữ liệu trong ô email
     * createdBy NHHai 3/12/2021
     */
    validateEmail() {
        //lấy giá trị trong input
        let value = $(this).val();
        // nếu giá trị trống thì bỏ qua
        if (!value || !value.length) {
            return;
        }
        var email = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;
        if (!email.test(value)) {
            $(this).addClass("input-warning");
            $(this).attr("title", "Email không đúng định dạng");
            $(this).attr("validate", "false");
        } else {
            $(this).removeClass("input-warning");
            $(this).attr("validate", "true");
        }
    }

    /**
     * Hàm validate dữ liệu ngày tháng
     * createdBy NHHai 3/12/2021
     */
    validateDate() {
        //Lấy giá trị trong input
        var date = $(this).val();
        // Chuyển đổi giá trị sang kiểu date
        date = new Date(date);
        // Lấy giá trị ngày hiện tại
        var today = new Date()
            // Lấy giá trị ngày hiện tại trừ đi số ngày nhập trong input
            // nếu < 0 là sai
        if (today - date < 0) {
            $(this).addClass("input-warning");
            $(this).attr("title", "Không được lớn hơn ngày hiện tại");
            $(this).attr("validate", "false");
        } else {
            $(this).removeClass("input-warning");
            $(this).attr("validate", "true");
        }

    }


}
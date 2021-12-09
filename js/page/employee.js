$(document).ready(function(event) {
    // add class bg-focus vào navi item
    $('.navigation-item').click(function() {
        $('.navigation-item>:first-child').removeClass('bg-focus');
        $(this).find(">:first-child").addClass('bg-focus');
    });

    new EmployeeJS();
});

class EmployeeJS extends Base {
    constructor() {
        super()
    }

    setApi() {
        this.apiRouter = '/Employees';
    }
    setId() {
        this.id = 'EmployeeId';
    }
    setCode() {
        this.entityCode = 'EmployeeCode';
    }
    setNewEntityCode() {
        this.newEntityCode = '/Employees/NewEmployeeCode';
    }


}
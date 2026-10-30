$(function () {

    $('.menu-btn').click(function (ev) {
        $('.wrapper').toggleClass('collapse-sidebar');

        if ($('.wrapper').hasClass('collapse-sidebar')) {
            $('.wrapper').removeClass('view-settings-menu');
        }
        ev.preventDefault();
        return false;
    });
    $('.settings-link').click(function (ev) {

        if ($('.wrapper').hasClass('collapse-sidebar')) {
            $('.wrapper').removeClass('collapse-sidebar');
            $('.wrapper').toggleClass('view-settings-menu');
        } else {
            $('.wrapper').toggleClass('view-settings-menu');
        }
        ev.preventDefault();
        return false;
    });

    $('.flex-sidebar-trigger').click(function (ev) {
        $('.wrapper').toggleClass('view-flex-sidebar');
        ev.preventDefault();
        return false;
    });

    $('.overview-list .expand-table-row').click(function (ev) {
        $('.overview-list > li').addClass('view-expand-table-row');
        ev.preventDefault();
        return false;
    });

    $('.screens-list .more-options-trigger').click(function (ev) {
        $('.screens-list li').toggleClass('view-more-options-list');
        ev.preventDefault();
        return false;
    });

    $('.sidebar-list .trigger-sl-options').click(function (ev) {
        $('.sidebar-list li').removeClass('view-more-options-list');
        if (!$(this).parent().parent().hasClass("view-more-options-list")) {
            $(this).parent().parent().addClass("view-more-options-list");
        }
        ev.preventDefault();
        return false;
    });

    $('.sidebar-list .more-options-list span').click(function (ev) {
        $('.sidebar-list li').removeClass('view-more-options-list');
        ev.preventDefault();
        return false;
    });

    $('.flex-sidebar-header .select-filter-trigger').click(function (ev) {
        if (!$(this).parent().hasClass("active")) {
            $(this).parent().addClass("active");
        } else {
            $(this).parent().removeClass("active");
        }
        ev.preventDefault();
        return false;
    });

    $('.select-filter .select-filter-list li').click(function (ev) {
        $('.select-filter').removeClass('active');
        ev.preventDefault();
        return false;
    });

    $('.trigger-profile-options').click(function (ev) {
        $('.profile-box').toggleClass('view-more-options-list');
        ev.preventDefault();
        return false;
    });

    $('.profile-box .more-options-list span').click(function (ev) {
        $('.profile-box').removeClass('view-more-options-list');
        ev.preventDefault();
        return false;
    });

    $('.multiple-select-trigger').click(function (ev) {
        
        if (!$(this).parent().hasClass("active")) {
            $(this).parent().addClass('active');
        } else {
            $(this).parent().removeClass('active');
        }
        ev.preventDefault();
        return false;
    });

    $('.hc-btn').click(function (ev) {
        $('.hc-btn').removeClass('selected');
        $(this).addClass('selected');
        ev.preventDefault();
        return false;
    });

    var contentBoxBodySlider = new Swiper('.content-box-body-slider', {
        slidesPerView: 1,
        spaceBetween: 0,
        
    });

    var pieGraphSlider = new Swiper('.pie-graph-slider', {
        slidesPerView: 1,
        spaceBetween: 0        
    });


    $('.tabs span').click(function (ev) {
        const $this = $(this);
        $this.parent().find('span').removeClass('selected');
        $this.addClass('selected');
        contentBoxBodySlider.slideTo($this.index());
        ev.preventDefault();
        return false;
    });
    
    $('.tabs .icon-wlc-close').click(function (ev) {
        $('.wrapper').removeClass('hide-overlay');
        $('.wrapper').addClass('view-discard-draft-overlay');
        ev.preventDefault();
        return false;
    });

    $('.close-overlay').click(function (ev) {
        $('.wrapper').removeClass('view-discard-draft-overlay');
        $('.wrapper').removeClass('view-send-mail-overlay');
        $('.wrapper').addClass('hide-overlay');
        ev.preventDefault();
        return false;
    });

    $('.table-ul .square-btn-light').click(function (ev) {
        $('.table-ul li').removeClass('view-more-options-list');
        if (!$(this).parent().hasClass("view-more-options-list")) {
            $(this).parent().addClass("view-more-options-list");
        }
        ev.preventDefault();
        return false;
    });

    $('.more-options-list span').click(function (ev) {
        $('.table-ul li').removeClass('view-more-options-list');
        ev.preventDefault();
        return false;
    });

    $(".input-box-field").on("click", function (e) {
        $(".input-box-field").removeClass("active");
        $(".select-box-field").removeClass("active");
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            $('.form .input-box-field.active input, .form .input-box-field.active textarea').focus();
        }
    });

    $(".select-box-field").on("click", function (e) {
        $(".input-box-field").removeClass("active");
        $(".select-box-field").removeClass("active");
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");          
        }
    });

    $(".select-box-field-twin").on("click", function (e) {
        $(".form-rows .form-row").removeClass("active");
        $(".input-box-field").removeClass("active");
        if (!$(this).parent().hasClass("active")) {
            $(this).parent().addClass("active");
        }

    });

    


});
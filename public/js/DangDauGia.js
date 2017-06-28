$(document).on('click', '#close-preview', function(){
    $('#hinhanh1 .image-preview').popover('hide');
    // Hover befor close the preview
    $('#hinhanh1 .image-preview').hover(
        function () {
           $('#hinhanh1 .image-preview').popover('show');
        },
         function () {
           $('#hinhanh1 .image-preview').popover('hide');
        }
    );
});

$("#hinhanh2").on('click', '#close-preview1', function(){
    $('#hinhanh2 .image-preview').popover('hide');
    // Hover befor close the preview
    $('#hinhanh2 .image-preview').hover(
        function () {
           $('#hinhanh2 .image-preview').popover('show');
        },
         function () {
           $('#hinhanh2 .image-preview').popover('hide');
        }
    );
});

$("#hinhanh3").on('click', '#close-preview2', function(){
    $('#hinhanh3 .image-preview').popover('hide');
    // Hover befor close the preview
    $('#hinhanh3 .image-preview').hover(
        function () {
           $('#hinhanh3 .image-preview').popover('show');
        },
         function () {
           $('#hinhanh3 .image-preview').popover('hide');
        }
    );
});

$(function() {
    // Create the close button
    $('#datetimepicker1').datetimepicker();

    var closebtn = $('<button/>', {
        type:"button",
        text: 'x',
        id: 'close-preview',
        style: 'font-size: initial;',
    });
    closebtn.attr("class","close pull-right");
    // Set the popover default content
    $('#hinhanh1 .image-preview').popover({
        trigger:'manual',
        html:true,
        title: "<strong>Preview</strong>"+$(closebtn)[0].outerHTML,
        content: "There's no image",
        placement:'bottom'
    });
    // Clear event
    $('#hinhanh1 .image-preview-clear').click(function(){
        $('#hinhanh1 .image-preview').attr("data-content","").popover('hide');
        $('#hinhanh1 .image-preview-filename').val("");
        $('#hinhanh1 .image-preview-clear').hide();
        $('#hinhanh1 .image-preview-input input:file').val("");
        $("#hinhanh1 .image-preview-input-title").text("Browse");
    });
    // Create the preview image
    $("#hinhanh1 .image-preview-input input:file").change(function (){
        var img = $('<img/>', {
            id: 'dynamic',
            width:250,
            height:200
        });
        var file = this.files[0];
        var reader = new FileReader();
        // Set preview image into the popover data-content
        reader.onload = function (e) {
            $("#hinhanh1 .image-preview-input-title").text("Change");
            $("#hinhanh1 .image-preview-clear").show();
            $("#hinhanh1 .image-preview-filename").val(file.name);
            img.attr('src', e.target.result);
            $("#hinhanh1 .image-preview").attr("data-content",$(img)[0].outerHTML).popover("show");
        }
        reader.readAsDataURL(file);
    });




    var closebtn1 = $('<button/>', {
        type:"button",
        text: 'x',
        id: 'close-preview1',
        style: 'font-size: initial;',
    });
    closebtn1.attr("class","close pull-right");
    // Set the popover default content
    $('#hinhanh2 .image-preview').popover({
        trigger:'manual',
        html:true,
        title: "<strong>Preview</strong>"+$(closebtn1)[0].outerHTML,
        content: "There's no image",
        placement:'bottom'
    });
    // Clear event
    $('#hinhanh2 .image-preview-clear').click(function(){
        $('#hinhanh2 .image-preview').attr("data-content","").popover('hide');
        $('#hinhanh2 .image-preview-filename').val("");
        $('#hinhanh2 .image-preview-clear').hide();
        $('#hinhanh2 .image-preview-input input:file').val("");
        $("#hinhanh2 .image-preview-input-title").text("Browse");
    });
    // Create the preview image
    $("#hinhanh2 .image-preview-input input:file").change(function (){
        var img = $('<img/>', {
            id: 'dynamic',
            width:250,
            height:200
        });
        var file = this.files[0];
        var reader = new FileReader();
        // Set preview image into the popover data-content
        reader.onload = function (e) {
            $("#hinhanh2 .image-preview-input-title").text("Change");
            $("#hinhanh2 .image-preview-clear").show();
            $("#hinhanh2 .image-preview-filename").val(file.name);
            img.attr('src', e.target.result);
            $("#hinhanh2 .image-preview").attr("data-content",$(img)[0].outerHTML).popover("show");
        }
        reader.readAsDataURL(file);
    });




    var closebtn2 = $('<button/>', {
        type:"button",
        text: 'x',
        id: 'close-preview2',
        style: 'font-size: initial;',
    });
    closebtn2.attr("class","close pull-right");
    // Set the popover default content
    $('#hinhanh3 .image-preview').popover({
        trigger:'manual',
        html:true,
        title: "<strong>Preview</strong>"+$(closebtn2)[0].outerHTML,
        content: "There's no image",
        placement:'bottom'
    });
    // Clear event
    $('#hinhanh3 .image-preview-clear').click(function(){
        $('#hinhanh3 .image-preview').attr("data-content","").popover('hide');
        $('#hinhanh3 .image-preview-filename').val("");
        $('#hinhanh3 .image-preview-clear').hide();
        $('#hinhanh3 .image-preview-input input:file').val("");
        $("#hinhanh3 .image-preview-input-title").text("Browse");
    });
    // Create the preview image
    $("#hinhanh3 .image-preview-input input:file").change(function (){
        var img = $('<img/>', {
            id: 'dynamic',
            width:250,
            height:200
        });
        var file = this.files[0];
        var reader = new FileReader();
        // Set preview image into the popover data-content
        reader.onload = function (e) {
            $("#hinhanh3 .image-preview-input-title").text("Change");
            $("#hinhanh3 .image-preview-clear").show();
            $("#hinhanh3 .image-preview-filename").val(file.name);
            img.attr('src', e.target.result);
            $("#hinhanh3 .image-preview").attr("data-content",$(img)[0].outerHTML).popover("show");
        }
        reader.readAsDataURL(file);
    });


});

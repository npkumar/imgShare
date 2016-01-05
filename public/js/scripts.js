$(document).ready(function(){
    $('#post-comment').hide();
    $('#btn-comment').on('click', function(event) {
        event.preventDefault();
        $('#post-comment').show();
    });
});
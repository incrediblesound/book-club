$(document).ready(function() {
	$('.noteform').hide();
  $('#listbtn').hide();
	$('#newnote').on('click', function() {
		$('.noteform').toggle(250);
	})
	$('#make').on('click', function() {
    $('#listbtn').fadeIn(250);
    var LN = $('#titlesNum').val();
    for(i=0;i<LN;i++) {
		  $('.listItems').append('<div class="form-group"><span class="badge" style="margin-right:6px;">'+(i+1)+'</span><label for="title"> Title: </label><input class="form-control" name="title"></div><div class="form-group"><label for="author"> Author:</label><input class="form-control" name="author"></div><div class="form-group"><label for="description"> Description:</label><input class="form-control" name="description"></div>');
	  };
	})
})
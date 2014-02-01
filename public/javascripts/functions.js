$(document).ready(function() {
	$('.noteform').hide();
	$('#newnote').on('click', function() {
		$('.noteform').toggle(250);
	})
})
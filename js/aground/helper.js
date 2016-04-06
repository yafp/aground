// #############################################################################
// HELPER
// #############################################################################

// Display a noty notification
//
// Types: alert, information, error, warning, notification, success
function displayNoty(notyMessage, notyType, notyTime)
{
	if (typeof notyTime != 'undefined') // show for x seconds
	{
		var n = noty({text: notyMessage, type: notyType, timeout: notyTime});
	}
	else // show until clicked by user
	{
		var n = noty({text: notyMessage, type: notyType});
	}
}

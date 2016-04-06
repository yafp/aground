// #############################################################################
// PRE GAME
// #############################################################################

// Stores the selected difficulty before the game starts
//
function initGame_SetDifficulty(selectedDifficulty)
{
	difficulty = selectedDifficulty;
	console.log(difficulty);
}

// Ask user if he really wants to start a new game
//
function reallyStartNewGame()
{
	if (confirm('Do you really want to start a new game?'))
	{
		uiCleanGUINoGameRunning();
	}
}

// Init CALENDAR, the HUD and start the GAMELOOP
//
function gameStart()
{
	gameCheckRequirements();
	gameSetInitialValues();

    // Start game loop
    intervalID = setInterval(onTimerTick, 1000); // 33 milliseconds = ~ 30 frames per sec
	//intervalID = setInterval(onTimerTick, 10); // 33 milliseconds = ~ 30 frames per sec

	// navigation
	$('#navGamePause').fadeIn(1);

	reduceHUDValuesByDefaultEachHour();

	displayNoty("Game started","notification","3000");

}

//
//
function gameCheckRequirements()
{
   	// Check Playername and fill it if its empty
   	curPlayerName =  $( "#ui_playerName" ).val();
   	if (!curPlayerName || curPlayerName.length === 0 || curPlayerName === "" || typeof curPlayerName == 'undefined' || !/[^\s]/.test(curPlayerName) || /^\s*$/.test(curPlayerName) || curPlayerName.replace(/\s/g,"") === "")
   	{
    	$( "#ui_playerName" ).val("Lazy Bastard");
   	}

	// Check if difficulty is set, if not set it to normal
	//console.log("Diff: "+difficulty);

	if (typeof difficulty == 'undefined')
   	{
	   	difficulty = "normal"; // Set difficulty
	}
	console.log("Difficulty is set to "+difficulty);

	// fade in several UI sections
   	$('#section_status').fadeIn(500);
   	$('#section_tasks').fadeIn(500);

}

// Set some initial values
//
function gameSetInitialValues()
{
    // Update initial Day and Time
    $( "#ui_CalDay" ).val("1")
    $( "#ui_CalTime" ).val("17:31")

    // Update HUD
    $( "#ui_HUDWater" ).val("100")
    $( "#ui_HUDStamina" ).val("100")
    $( "#ui_HUDEnergy" ).val("100")
    $( "#ui_HUDBodyTemp" ).val("100")

   // Depending on difficulty
   switch(difficulty)
   {
      case "hardcore":
			factorLossWaterPerHour = 0.8;
			factorLossStaminaPerHour = 0.9;
         break;

      case "harder":
            factorLossWaterPerHour = 0.9;
			factorLossStaminaPerHour = 0.95;
         break;

      default:
			factorLossWaterPerHour = 0.95;
			factorLossStaminaPerHour = 0.99;
	}
}





// #############################################################################
// GAME
// #############################################################################


function toggleTaskArea(area)
{
	console.log("Toggle the task section "+area);

	if($("#taskArea").is(':hidden'))
	{
		console.log("Fading in the task area details for "+area);
		$('#taskArea').fadeIn(500);
	}
	else {
		console.log("Fading out the task area details for "+area);
		$('#taskArea').fadeOut(500);
	}
}


// PAUSE the GAMELOOP
//
function gamePause()
{
	alert("PAUSE - Press OK to RESUME GAME");
}



// Get all HUD values
//
function getHUDValues()
{
    curHUDWater = parseInt($( "#ui_HUDWater" ).val());
    curHUDStamina = $( "#ui_HUDStamina" ).val();
    curHUDEnergy = $( "#ui_HUDEnergy" ).val();
    curHUDBodyTemp = $( "#ui_HUDBodyTemp" ).val();
}

// Get date & time values
//
function getGameDateTimeValues()
{
    // Get Time, split hours and minutes and parse them to numbers
    var curTimeElements =  $( "#ui_CalTime" ).val().split(":");
    curHour = parseInt(curTimeElements[0]);
    curMinute = parseInt(curTimeElements[1]);

    // get current day
    curDay = $( "#ui_CalDay" ).val();
    curDay = parseInt(curDay);
}

// Set date time values
//
function setGameDateTimeValues()
{
    $( "#ui_CalDay" ).val(curDay);
    $( "#ui_CalTime" ).val(curHour+":"+curMinute);
}

// Update GAMELOOP
//
function onTimerTick()
{
    getGameDateTimeValues();

        // update Minute
        if(curMinute < 60)
        {
            curMinute = curMinute +1;
            if (curMinute < 10) // leading zero
            {
                curMinute = "0" + curMinute;
            }
        }
        else // update hour
        {
            curMinute = 00;

            // update hour
            if(curHour < 23)
            {
                curHour = curHour +1;
                reduceHUDValuesByDefaultEachHour();
            }
            else // update day
            {
                curHour = 0;
                curDay = parseInt(curDay) +1
          }
       }
       setGameDateTimeValues();
}


// Update the HUD values each full hour
//
function reduceHUDValuesByDefaultEachHour()
{
    getHUDValues();

	// Water
	//
	curHUDWater = Math.floor(curHUDWater * factorLossWaterPerHour);
    console.log("Water: "+curHUDWater);
    if(curHUDWater > 0)
    {
        $( "#ui_HUDWater" ).val(curHUDWater); // update hidden field
        $('#ui_HUDWaterProgress').attr('aria-valuenow', curHUDWater+'%').css('width',curHUDWater+'%'); // update progress-bar itself
		$( "#ui_HUDWaterProgressLabel" ).text( curHUDWater+'%' );	// update label of progress bar

		// adjust progress-bar color
		if(curHUDWater => 70) // green
		{
			ui_HUDWaterProgress.className = "progress-bar progress-bar-striped progress-bar-success active";
		}
		if(curHUDWater < 70) // yellow
		{
			ui_HUDWaterProgress.className = "progress-bar progress-bar-striped progress-bar-warning active";
		}

		if(curHUDWater < 30) // red
		{
			ui_HUDWaterProgress.className = "progress-bar progress-bar-striped progress-bar-danger active";
		}
    }
    else {
        $( "#ui_HUDWater" ).val(0);
        gameEnd("You hydrated");
    }

	// Stamina
	//
	curHUDStamina = Math.floor(curHUDStamina * factorLossStaminaPerHour);
    console.log("Stamina: "+curHUDStamina);
    if(curHUDStamina > 0)
    {
        $( "#ui_HUDStamina" ).val(curHUDStamina); // update hidden field
        $( "#ui_HUDStaminaProgress" ).attr('aria-valuenow', curHUDStamina+'%').css('width',curHUDStamina+'%'); // update progress-bar itself
		$( "#ui_HUDStaminaProgressLabel" ).text( curHUDStamina+'%' );	// update label of progress bar

		// adjust progress-bar color
		if(curHUDStamina => 70) // green
		{
			ui_HUDStaminaProgress.className = "progress-bar progress-bar-striped progress-bar-success active";
		}
		if(curHUDStamina < 70) // yellow
		{
			ui_HUDStaminaProgress.className = "progress-bar progress-bar-striped progress-bar-warning active";
		}

		if(curHUDStamina < 30) // red
		{
			ui_HUDStaminaProgress.className = "progress-bar progress-bar-striped progress-bar-danger active";
		}
    }
    else {
        $( "#ui_HUDStamina" ).val(0);
        gameEnd("Your stamina reached 0");
    }
}



// #############################################################################
// POST GAME
// #############################################################################

// End the GAMELOOP & Displays GAME OVER notification
//
function gameEnd(reason)
{
	clearInterval(intervalID); // stop the game loop

	// fadeOut some sections
	$('#section_tasks').fadeOut(1000);

	console.log(reason);
	console.log("*** GAME OVER ***");

	displayNoty("<h2>GAME OVER</h2><hr><h4>"+reason+"</h4>","notification");
}



// #############################################################################
// UNSORTED / MISC
// #############################################################################

function uiCleanGUINoGameRunning()
{
	console.log("Cleaned UI (no game running)");

	// main sections
	// hide some
	$('#section_status').fadeOut(500);
	$('#section_tasks').fadeOut(500);
	// show some
	$('#section_settings').fadeIn(500);


	$('#taskArea').fadeOut(500);

	// navigation-related
	$('#navGamePause').fadeOut(1); // show pause menu entry
}

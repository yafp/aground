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
    //intervalID = setInterval(onTimerTick, 1000); // 33 milliseconds = ~ 30 frames per sec
	intervalID = setInterval(onTimerTick, 10); // 33 milliseconds = ~ 30 frames per sec

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

function updateProgressBar(progressBarName, newValue)
{
	console.log("Updating a progress bar");
	
	progressBar = "#"+progressBarName;

	$( progressBar ).val(newValue); // update hidden field
	$( progressBar+"Progress" ).attr('aria-valuenow', newValue+'%').css('width',newValue+'%'); // update progress-bar itself
	$( progressBar+"ProgressLabel" ).text( newValue+'%' );	// update label of progress bar
}



function toggleTaskArea(area)
{
	curArea = "#"+area
	console.log("Toggle the task section "+curArea);

	// hide all other areas besides the currently clicked


	// check if the selected area is currently visible or not
	if($(curArea).is(':hidden'))
	{
		// fade out all areas
		$( "#navigate" ).fadeOut(1);
		$( "#camp" ).fadeOut(1);
		$( "#food" ).fadeOut(1);
		$( "#inventory" ).fadeOut(1);
		$( "#search" ).fadeOut(1);
		$( "#build" ).fadeOut(1);

		$( curArea ).fadeIn(1000);
		//console.log("is currently hidden");
	}
	else {
		//console.log("is currently visible");
		$( curArea ).fadeOut(1000);
	}

	return false; // prevent executing the a href
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

	updateProgressBar(ui_HUDWater,0);
	updateProgressBar(ui_HUDStamina,0);
	updateProgressBar(ui_HUDStamina,0);
	updateProgressBar(ui_HUDStamina,0);

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

	// Task Areas
	//
	$( "#navigate" ).fadeOut(1);
	$( "#camp" ).fadeOut(1);
	$( "#food" ).fadeOut(1);
	$( "#inventory" ).fadeOut(1);
	$( "#search" ).fadeOut(1);
	$( "#build" ).fadeOut(1);

	// navigation-related
	$('#navGamePause').fadeOut(1); // show pause menu entry

	// show some
	$('#section_settings').fadeIn(500);
}

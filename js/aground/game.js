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
	if (confirm("Do you really want to start a new game?"))
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

	// fade in several UI sections
   	$("#section_status").fadeIn(500);
   	$("#section_tasks").fadeIn(500);

	// Fade in navigation options
	$("#navGamePause").fadeIn(1); // pause entry to nav-bar

    // Start game loop
	//
	// slow
    //sintervalID = setInterval(gameProgressOneTick, 1000);
	//
	// medium
    //intervalID = setInterval(gameProgressOneTick, 300);
	//
	// fast (testing)
	intervalID = setInterval(gameProgressOneTick, 10);

	displayNoty("Game started","notification","2000");
}

// Checkthe playername and the difficulty
// Both should be configured by user - if not falling back to default values
//
function gameCheckRequirements()
{
   	// Check Playername
   	curPlayerName =  $("#ui_playerName").val();
   	if (!curPlayerName || curPlayerName.length === 0 || curPlayerName === "" || typeof curPlayerName == 'undefined' || !/[^\s]/.test(curPlayerName) || /^\s*$/.test(curPlayerName) || curPlayerName.replace(/\s/g,"") === "")
   	{
    	$("#ui_playerName").val("Lazy Bastard");
		curPlayerName =  $("#ui_playerName").val();
   	}
	console.log("Playername is set to "+curPlayerName);

	// Check difficulty
	if (typeof difficulty == "undefined")
   	{
	   	difficulty = "normal"; // Set difficulty
	}
	console.log("Difficulty is set to "+difficulty);
}

// Set some initial values
//
function gameSetInitialValues()
{
    // Update initial Day and Time
    $("#ui_CalDay").val("1")
    $("#ui_CalTime").val("17:31")

    // Update HUD
    $("#ui_HUDWater").val("100")
    $("#ui_HUDStamina").val("100")
    $("#ui_HUDEnergy").val("100")
    $("#ui_HUDBodyTemp").val("100")

   	// Depending on difficulty
   	switch(difficulty)
   	{
    	case "hardcore":
			factorLossWaterPerHour = 0.8;
			factorLossStaminaPerHour = 0.82;
			factorLossEnergyPerHour = 0.85;
			factorLossBodyTempPerHour = 0.9;
        break;

      	case "harder":
            factorLossWaterPerHour = 0.9;
			factorLossStaminaPerHour = 0.94;
			factorLossEnergyPerHour = 0.96;
			factorLossBodyTempPerHour = 0.95;
        break;

      	default:
			factorLossWaterPerHour = 0.95;
			factorLossStaminaPerHour = 0.97;
			factorLossEnergyPerHour = 0.99;
			factorLossBodyTempPerHour = 0.98;
	}

	// Init the Player HUD before the game starts
	updateProgressBar({progressBarHiddenField: ui_HUDWater.id, progressBar: ui_HUDWaterProgress.id , progressBarLabel: ui_HUDWaterProgressLabel.id , newValue: 100});
	updateProgressBar({progressBarHiddenField: ui_HUDStamina.id, progressBar: ui_HUDStaminaProgress.id , progressBarLabel: ui_HUDStaminaProgressLabel.id , newValue: 100});
	updateProgressBar({progressBarHiddenField: ui_HUDEnergy.id, progressBar: ui_HUDEnergyProgress.id , progressBarLabel: ui_HUDEnergyProgressLabel.id , newValue: 100});
	updateProgressBar({progressBarHiddenField: ui_HUDBodyTemp.id, progressBar: ui_HUDBodyTempProgress.id , progressBarLabel: ui_HUDBodyTempProgressLabel.id , newValue: 100});
}



// #############################################################################
// GAME
// #############################################################################

// Sleep regenerates Energy & Stamina
//
function doSleep()
{
	console.log("Player takes a 4h power-nap");

	// Update date/time for 240 minutes
	for (var i = 0; i < 240; i++)
	{
		getHUDValues();

		// Stamina
		curHUDStamina = curHUDStamina +1.1;
		if (curHUDStamina > 100)
		{
			curHUDStamina = 100;
		}
		updateProgressBar({progressBarHiddenField: ui_HUDStamina.id, progressBar: ui_HUDStaminaProgress.id , progressBarLabel: ui_HUDStaminaProgressLabel.id , newValue: curHUDStamina});

		// Energy
		curHUDEnergy = curHUDEnergy +1.05;
		if (curHUDEnergy > 100)
		{
			curHUDEnergy = 100;
		}
		updateProgressBar({progressBarHiddenField: ui_HUDEnergy.id, progressBar: ui_HUDEnergyProgress.id , progressBarLabel: ui_HUDEnergyProgressLabel.id , newValue: curHUDEnergy});

		gameProgressOneTick();
	}
	displayNoty("You just woke up after a 4 hour sleep","notification","2000");
}


// Consume some food or liquid
//
function doFood(foodType)
{
	console.log("User consumes "+foodType);
	getHUDValues();

	// Hydration
	//
	if (foodType="drink")
	{
		curHUDWater = curHUDWater + 35;
		if (curHUDWater > 100)
		{
			curHUDWater = 100;
		}
		updateProgressBar({progressBarHiddenField: ui_HUDWater.id, progressBar: ui_HUDWaterProgress.id , progressBarLabel: ui_HUDWaterProgressLabel.id , newValue: curHUDWater});
		displayNoty("You just got something to drink...","notification","2000");
	}
}


function updateProgressBar(arg)
{
	//console.log("Updating a progress bar");
	//console.log(arg.progressBarHiddenField);
	//console.log(arg.progressBar);
	//console.log(arg.progressBarLabel);
	//console.log(arg.newValue);

	$("#"+arg.progressBarHiddenField).val(arg.newValue); // update hidden field
	$("#"+arg.progressBar).attr('aria-valuenow', arg.newValue+'%').css('width',arg.newValue+'%'); // update progress-bar itself
	$("#"+arg.progressBarLabel ).text( arg.newValue+'%' );	// update label of progress bar

	// set class -> progress-Bar-color (// success / warning / danger)
	if(arg.newValue < 30) // red
	{
		$("#"+arg.progressBar).addClass("progress-bar progress-bar-striped progress-bar-danger active");
		return;
	}

	if(arg.newValue < 70) // yellow
	{
		$("#"+arg.progressBar).addClass("progress-bar progress-bar-striped progress-bar-warning active");
		return;
	}

	if(arg.newValue >= 70) // green
	{
		$("#"+arg.progressBar).addClass("progress-bar progress-bar-striped progress-bar-success active");
		return;
	}
}


// Manages the switch to and between the existing task sections. Opens them and closed them
//
function toggleTaskArea(area)
{
	curArea = "#"+area

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

		console.log("Open the task section "+curArea);
		$( curArea ).fadeIn(1000);
	}
	else {
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
    curHUDWater = parseInt($("#ui_HUDWater").val());
    curHUDStamina = parseInt($("#ui_HUDStamina").val());
    curHUDEnergy = parseInt($("#ui_HUDEnergy").val());
    curHUDBodyTemp = parseInt($("#ui_HUDBodyTemp").val());
}


// Get date & time values
//
function getGameDateTimeValues()
{
    // Get Time, split hours and minutes and parse them to numbers
    var curTimeElements =  $("#ui_CalTime").val().split(":");
    curHour = parseInt(curTimeElements[0]);
    curMinute = parseInt(curTimeElements[1]);

    // get current day
    curDay = $("#ui_CalDay").val();
    curDay = parseInt(curDay);
}


// Set date time values
//
function setGameDateTimeValues()
{
    $("#ui_CalDay").val(curDay);
    $("#ui_CalTime").val(curHour+":"+curMinute);
}


// Update GAMELOOP
//
function gameProgressOneTick()
{
	console.log("Time is ticking ...");
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
			console.log("It's now "+curHour+":00");
            reduceHUDValuesByDefaultEachHour();
        }
        else // update day
        {
            curHour = 0;
            curDay = parseInt(curDay) +1
			console.log("It's now Day "+curDay);
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
		updateProgressBar({progressBarHiddenField: ui_HUDWater.id, progressBar: ui_HUDWaterProgress.id , progressBarLabel: ui_HUDWaterProgressLabel.id , newValue: curHUDWater});
    }
    else {
        $("#ui_HUDWater").val(0);
        gameEnd("You hydrated");
		return;
    }

	// Stamina
	//
	curHUDStamina = Math.floor(curHUDStamina * factorLossStaminaPerHour);
    console.log("Stamina: "+curHUDStamina);
    if(curHUDStamina > 0)
    {
		updateProgressBar({progressBarHiddenField: ui_HUDStamina.id, progressBar: ui_HUDStaminaProgress.id , progressBarLabel: ui_HUDStaminaProgressLabel.id , newValue: curHUDStamina});
    }
    else {
        $("#ui_HUDStamina").val(0);
        gameEnd("Your stamina reached 0");
		return;
    }


	// Energy
	//
	curHUDEnergy = Math.floor(curHUDEnergy * factorLossEnergyPerHour);
    console.log("Stamina: "+curHUDEnergy);
    if(curHUDEnergy > 0)
    {
		updateProgressBar({progressBarHiddenField: ui_HUDEnergy.id, progressBar: ui_HUDEnergyProgress.id , progressBarLabel: ui_HUDEnergyProgressLabel.id , newValue: curHUDEnergy});
    }
    else {
        $("#ui_HUDEnergy").val(0);
        gameEnd("Your energy reached 0");
		return;
    }


	// BodyTemp
	//
	curHUDBodyTemp = Math.floor(curHUDBodyTemp * factorLossBodyTempPerHour);
    console.log("BodyTemp: "+curHUDBodyTemp);
    if(curHUDBodyTemp > 0)
    {
		updateProgressBar({progressBarHiddenField: ui_HUDBodyTemp.id, progressBar: ui_HUDBodyTempProgress.id , progressBarLabel: ui_HUDBodyTempProgressLabel.id , newValue: curHUDBodyTemp});
    }
    else {
        $("#ui_HUDBodyTemp").val(0);
        gameEnd("Your body temp reached 0");
		return;
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

	updateProgressBar({progressBarHiddenField: ui_HUDWater.id, progressBar: ui_HUDWaterProgress.id , progressBarLabel: ui_HUDWaterProgressLabel.id , newValue: 0});
	updateProgressBar({progressBarHiddenField: ui_HUDStamina.id, progressBar: ui_HUDStaminaProgress.id , progressBarLabel: ui_HUDStaminaProgressLabel.id , newValue: 0});
	updateProgressBar({progressBarHiddenField: ui_HUDEnergy.id, progressBar: ui_HUDEnergyProgress.id , progressBarLabel: ui_HUDEnergyProgressLabel.id , newValue: 0});
	updateProgressBar({progressBarHiddenField: ui_HUDBodyTemp.id, progressBar: ui_HUDBodyTempProgress.id , progressBarLabel: ui_HUDBodyTempProgressLabel.id , newValue: 0});

	console.log("Finished cleaning the progress bars");
	console.log(reason);
	console.log("*** GAME OVER ***");

	$("#section_tasks").fadeOut(1000); // fadeOut the task-sections
	$("#navGamePause").fadeOut(1000); // fade out pause nav bar entry

	displayNoty("<h2>GAME OVER</h2><hr><h4>"+reason+"</h4>","notification");
}



// #############################################################################
// UNSORTED / MISC
// #############################################################################
function uiCleanGUINoGameRunning()
{
	console.log("Cleaned UI (no game running)");

	// main sections
	//
	// hide some
	$("#section_status").fadeOut(500);
	$("#section_tasks").fadeOut(500);

	// Task Areas
	//
	// todo - check if this block is needed at all
	$("#navigate").fadeOut(1);
	$("#camp").fadeOut(1);
	$("#food").fadeOut(1);
	$("#inventory").fadeOut(1);
	$("#search").fadeOut(1);
	$("#build").fadeOut(1);

	// navigation-related
	$("#navGamePause").fadeOut(1); // show pause menu entry

	// show some
	$("#section_settings").fadeIn(500);
}

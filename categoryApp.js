var gameCache = new Object();
var nextQuestion = new Audio("media/click_char.mp3");
var correctChoice = new Audio("media/successful.mp3");
var wrongChoice = new Audio("media/enter_invalid.mp3");

function GameData(id){
  	this.id = id;
  	this.gameBlock = new CategoryGameBlock();
  	this.controlBlock = new GameControlBlock();
  	this.instructionBlock = new InstructionBlock();
    this.instructionURL = null;
  	this.instructionContent = null;
  	this.categoryNItemString = null;
  	this.orderType = null;
  	this.count = 0;
  	this.categories = new Array();
  	this.items = new Array();
  	this.itemsMap = new Object();
    this.gameStarted = false;
    this.move = 0;
    this.score = 0;
    this.countDownTimerString = null;
    this.timeLevelString = null;
    this.targetElementId = null;
    this.numberOfLevels = 0;
    this.level = 1;
    this.levelTimeMap = new Object();
    this.timer = new CountdownTimer(this.id);
    this.isSoundEnable = true;
    this.playPause = false;
}
/***********************************************************************************************/
  //Countdown module

  function CountdownTimer(gameDataId){
  	this.id = gameDataId;
  	this.name = gameDataId;
  	this.isPause = false;
    this.restart = false;
    this.timerString = null;
    this.timeUpString = '00:00';
    this.minutes = 0;
    this.seconds = 0;
    this.intervalObject = null;
  }

  CountdownTimer.prototype.setData = function(id){
    var gameObject = gameCache[id];
    this.targetElementId = id+'timer';
    this.timerString = gameObject.countDownTimerString;
  	this.minutes = parseInt(this.timerString.split(':')[0]);
    this.seconds = parseInt(this.timerString.split(':')[1]);
  }

  CountdownTimer.prototype.start = function(id){
   var obj = this;
   obj.intervalObject = setInterval(function(){
      if(obj.restart){
         clearInterval(obj.intervalObject);
         return;
      }
  		if(!obj.isPause){
        if(obj.seconds == 0 && obj.minutes > 0){
              obj.seconds = 59;
              obj.minutes--;
      }
      else if(obj.seconds > 0 ) {
              obj.seconds--; 
      }if(obj.seconds==0 && obj.minutes==0){
        checkMove(id,"");
        if(obj.isSoundEnable){
          nextQuestion.play();
        }
      }
       obj.update();     
      }  
  	}, 1000);
  }

  CountdownTimer.prototype.update = function(){
      //  alert('update :'+ this.minutes+ ' : '+ this.seconds);
      var minValue = this.minutes;
      var secValue = this.seconds;
      if(minValue < 10){
        minValue = "0"+minValue;
      }
      if(secValue < 10){
        secValue = "0"+secValue;
      }
    	document.getElementById(this.targetElementId).value = minValue + ':' + secValue;
  }


  CountdownTimer.prototype.reset = function(){
    this.minutes = parseInt(this.timerString.split(':')[0]);
    this.seconds = parseInt(this.timerString.split(':')[1]);
    this.update();
  }

  CountdownTimer.prototype.clear = function(){
    document.getElementById(this.targetElementId).value = this.timeUpString;
  }

  CountdownTimer.prototype.pause = function(){
    this.isPause = true;
  }

  CountdownTimer.prototype.continue = function(){
    this.isPause = false;
  }
/***********************************************************************************************/

/***********************************************************************************************/
//default values for all the objects
function CategoryGameBlock(){
	 this.id=null;
}

function GameControlBlock(){
	//data members with default values
	this.id = null;
	this.sound = false;
	this.level = 1;
	this.score = 0;
}

function InstructionBlock(){
   this.instructionBlockContent = null;
}

/***********************************************************************************************/
//starting point for the application.
function categorizeApp(divId, instructionContent, catNItemString, orderType, timeLevelString,count){
	instantiateGameBlock(divId, instructionContent, catNItemString, orderType, timeLevelString,count);
}

function instantiateGameBlock(divId, instructionContent, catNItemString, orderType,timeLevelString ,count){
  var gameDiv = document.getElementById(divId);
    var instructionHTML = instructionContent;
  if(gameDiv == undefined){
       gameDiv = document.createElement('div');
       gameDiv.id = divId;
       document.body.appendChild(gameDiv);
  }
  gameDiv.className = 'layout';

  var gameObject  = new GameData(divId);
  gameObject.instructionContent = instructionHTML;
  gameObject.categoryNItemString = catNItemString;
  gameObject.orderType = orderType;
  gameObject.count = count;
  gameObject.instructionBlock.instructionBlockContent = gameObject.instructionContent;
  gameObject.timeLevelString = timeLevelString;
  var timeArray = timeLevelString.split("\n");
  gameObject.numberOfLevels  = timeArray.length;
  for(var x=0;x<gameObject.numberOfLevels;x++){
     gameObject.levelTimeMap[x+1] = timeArray[x];
  }
  gameCache[gameObject.id] = gameObject;
  displayInstructions(gameObject,divId);
  displayGameProgressBar(divId);
  disPlayStartGame(divId);
}

function displayInstructions(obj,gameDiv){
  var instrBlockDiv = document.createElement('div');
  instrBlockDiv.id = gameDiv+"#gameBlock";
  instrBlockDiv.className = "gameDiv";
  instrBlockDiv.innerHTML = "<div>"+obj.instructionContent+"</div>";
  var gameDivBlock = document.getElementById(gameDiv);
  gameDivBlock.appendChild(instrBlockDiv);
}

function disPlayStartGame(gameDiv){
  var gameControlPanel = document.createElement('div');
  gameControlPanel.id = gameDiv+"#controlPanel";
  gameControlPanel.className = "gameControlPanel";
  var startButton = document.createElement('button');
  startButton.setAttribute("onclick","startGame("+gameDiv+")");
  startButton.innerHTML = "START";
  startButton.className = "startButton";
  gameControlPanel.appendChild(startButton);
  var gameDivBlock = document.getElementById(gameDiv);  
  gameDivBlock.appendChild(gameControlPanel);

}

function startGame(id){
  populateCategoriesItems(id);
  shuffle(id);  
  createReadyDisplay(id);
  var gameControlPanel = document.getElementById(id+"#controlPanel");
    gameControlPanel.innerHTML = "";
    createGameControlPanel(id);
   prepareProgressBar(id);
}

function displayGameProgressBar(id){
  var gameObject  = gameCache[id];
  var progressBarDiv = document.createElement('div');
  progressBarDiv.className = 'gameProgressBarLayout';
  progressBarDiv.id = id+'#progressBar';
   document.getElementById(id).appendChild(progressBarDiv);
}

function prepareProgressBar(id){
  var gameObject  = gameCache[id];
  var progressBarDiv = document.getElementById(id+'#progressBar');
  progressBarDiv.className = 'gameProgressBarPlay gameProgressBarLayout';

  for(var x=0;x<gameObject.count;x++){
   var progressBarBlock = document.createElement('div');
   progressBarBlock.id = id+'#progressBlock'+ x;
   progressBarBlock.className = 'progressBarBlock';
   progressBarBlock.style.width = (Math.floor(100/gameObject.count))+ '%';
   progressBarBlock.innerHTML = " ";
   progressBarDiv.appendChild(progressBarBlock);
  }
}

function createLevelDropDown(id){
   var levelDiv = document.createElement("div");
   levelDiv.className = "levelDiv";
   var level = document.createElement("select");
   level.id = id+'level';
   var gameObject = gameCache[id];
   for(var x=0;x<gameObject.numberOfLevels;x++){
     var op = new Option();
      op.value = x+1;
      op.text = "Level "+ op.value;
      level.options.add(op);
   }
   levelDiv.appendChild(level);
 return levelDiv;
}


function generateGameLayout(id){ 
	var itemDiv = document.getElementById(id+"#itemLayout");
  if(itemDiv != null || itemDiv!=undefined){
	 itemDiv.innerHTML = "";
   populateItemLayout(id);
  }
}

function generateItemLayout(id){
  var gameLayout = document.getElementById(id+"#gameBlock");
  var dataObject = gameCache[id];
  var itemDiv = document.createElement('div');
  itemDiv.id = id+'#itemLayout';
  itemDiv.className = 'itemLayout';
  //itemDiv.innerHTML = dataObject.items[dataObject.move];
  gameLayout.appendChild(itemDiv);
}

function populateItemLayout(id){
    var dataObject = gameCache[id];
  var itemLayout = document.getElementById(id+'#itemLayout');
  itemLayout.innerHTML = dataObject.items[dataObject.move];
}

function generateCategoryLayout(id){
 // var gameLayout = document.getElementById(id+"#gameBlock");
  var dataObject = gameCache[id];
  var categoriesDiv = document.createElement('div');
  categoriesDiv.id = id+"#categoryLayout";
  categoriesDiv.className = 'categoryLayout';

    for(var count=0;count<dataObject.categories.length;count++){
    var catValue = document.createElement('div');
    var val = dataObject.categories[count];
    catValue.className = "categoryDiv";
      catValue.innerHTML = val;
      catValue.onclick = function(){
      checkMove(id,this.innerHTML);
    }
      categoriesDiv.appendChild(catValue);
  }
  return categoriesDiv;
  //gameLayout.appendChild(categoriesDiv);
}


function createGameControlPanel(id){
   var obj = gameCache[id];
   var controlPanelObject = document.getElementById(id+"#controlPanel");
	 
	 var levelDiv = document.createElement('div');
	 levelDiv.appendChild(createLevelDropDown(id));
     controlPanelObject.appendChild(levelDiv);
     controlPanelObject.appendChild(createRestart(id));
	   controlPanelObject.appendChild(playGame(id));
	  // controlPanelObject.appendChild(pauseGame(id));
     controlPanelObject.appendChild(gameSound(id));
     controlPanelObject.appendChild(createTimer(id));
     controlPanelObject.appendChild(gameScorer(id));
}


function populateCategoriesItems(id){
	var obj = gameCache[id];
	var categoryItemString = obj.categoryNItemString;
	var catItemCollection = categoryItemString.split('<#cat#>');
	for(var count=0;count<catItemCollection.length;count++){
	 var catg = catItemCollection[count].split('\n');
	 obj.categories[count] = catg[0];
	 for(var index=1;index<catg.length;index++){
		 obj.itemsMap[catg[index]] = catg[0];
		 obj.items.push(catg[index]);
	 }
   }


}

function shuffle(id) {
	var object = gameCache[id];

	var counter = object.items.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        var temp = object.items[counter];
        object.items[counter] = object.items[index];
        object.items[index] = temp;

    }
 //   alert('end');
}
function checkMove(id,value){

  var allChildNodes = document.getElementById(id).getElementsByTagName('*');

	var gameObject = gameCache[id];
	if(gameObject.itemsMap[gameObject.items[gameObject.move]] === value){
       gameObject.score = Math.ceil(gameObject.score + (100/gameObject.count));
       if(gameObject.score > 100){
          gameObject.score = 100;
       }
       if(gameObject.isSoundEnable){
       correctChoice.play();
     }
	  
    document.getElementById(id+'#progressBlock'+gameObject.move).className = 'progressBarBlockCorrect progressBarBlock';
	}else{
    if(gameObject.isSoundEnable){
    wrongChoice.play();
   }
	  
    document.getElementById(id+'#progressBlock'+gameObject.move).className = 'progressBarBlockInCorrect progressBarBlock';
	}
	gameObject.move = gameObject.move + 1;

    if(gameObject.move === gameObject.count){
      
      gameObject.timer.clear();
      clearInterval(gameObject.timer.intervalObject);
      updateScoreField(id);
      alert('Game Over \n Your final score is '+gameObject.score);
      return;
    }
	if(gameObject.move < gameObject.count){
		setTimeout(function() {
					generateGameLayout(id);
          gameObject.timer.reset();
			}, 1000);
	}
  updateScoreField(id);
  
  // for(var i = 0; i < allChildNodes.length; i++){
  //  allChildNodes[i].disabled = false;
  // }
}

function createTimer(id){
    var timerDiv  = document.createElement('div');
    timerDiv.className = "timerDiv";

	// var timerImage = document.createElement('img');
 //    timerImage.setAttribute('src','images/time.png');
 //    timerImage.setAttribute('alt','Restart');
 //    timerImage.className = "restartImage";

   var timeLable = document.createElement('p');
   timeLable.className = 'scoreLable';
   timeLable.innerHTML = 'Time ';
   timerDiv.appendChild(timeLable); 
    
    var timerFieldDiv = document.createElement('div');
    timerFieldDiv.className = 'timerFieldDiv';
    var timerField = document.createElement('input');
    timerField.id = id+'timer';
    timerField.setAttribute('type','text');
    timerField.className = 'timerField';
    timerFieldDiv.appendChild(timerField);
    //timerDiv.appendChild(timerImage);
    timerDiv.appendChild(timerFieldDiv);
    return timerDiv;

}



function createReadyDisplay(id){
  var divObj = document.getElementById(id+'#gameBlock');
  divObj.innerHTML = "";

  var readyMessageBlock = document.createElement('p');
    readyMessageBlock.innerHTML = "Please select the level for the game and then click play icon to start the game.";
    readyMessageBlock.className = "readyMessage";
    divObj.appendChild(readyMessageBlock);
}

function playGame(id){
  var gameDataObject = gameCache[id];
	var playDiv  = document.createElement('div');
	playDiv.className = "restartDiv";
	var playImage = document.createElement('img');
	  playImage.id = "play_btn";
    playImage.setAttribute('src','images/play.png');
    playImage.setAttribute('alt','Play');
    playImage.className = "restartImage";
    
    playImage.onclick = function(){
      if(!gameDataObject.gameStarted){
        gameDataObject.gameStarted = true;
        gameDataObject.playPause = true;
        //debugger;
        var levelObj = document.getElementById(id+'level');
        gameDataObject.level = levelObj.options[levelObj.selectedIndex].value;
        var min = Math.floor(gameDataObject.levelTimeMap[gameDataObject.level]/60);
        var sec = Math.floor(gameDataObject.levelTimeMap[gameDataObject.level]%60);
        gameDataObject.countDownTimerString = min+':'+sec;
        gameDataObject.targetElementId = id+'timer';  
        gameDataObject.timer.setData(id);
        generateGameLayout(id);
        document.getElementById(id+'#gameBlock').innerHTML = "";
        generateItemLayout(id);
        populateItemLayout(id);
        document.getElementById(id+'#gameBlock').appendChild(generateCategoryLayout(id)); 
        gameDataObject.timer.start(id);
        gameDataObject.itemLayoutState = document.getElementById(id+'#itemLayout').innerHTML;
       // gameDataObject.categoryLayoutState = document.getElementById(id+'#categoryLayout').innerHTML;
      }
     
      if(gameDataObject.playPause){
        //play block
        gameDataObject.playPause = false;
         playImage.setAttribute('src','images/pause.png');
         document.getElementById(id+'#itemLayout').innerHTML = gameDataObject.itemLayoutState;
         document.getElementById(id+'#itemLayout').className = 'itemLayout';
         document.getElementById(id+'#gameBlock').className = 'gameDiv';
         document.getElementById(id+'#categoryLayout').style.display = 'block';
         gameDataObject.timer.continue();
         
      }else{
        //pause block
        gameDataObject.playPause = true;
         playImage.setAttribute('src','images/play.png'); 
         document.getElementById(id+'#gameBlock').className = 'gameDiv pauseState';
         document.getElementById(id+'#itemLayout').className = ' itemLayout pauseStateP';
         document.getElementById(id+'#itemLayout').innerHTML = "<p>Game is paused.<br>Please click PLAY to continue";
        document.getElementById(id+'#categoryLayout').style.display = 'none';
         gameDataObject.timer.pause();
      }
    };
    playDiv.appendChild(playImage);
    return playDiv;
	
}

function pauseStateObject(){
 // var gameObject = gameCache[id];
  var pauseObject = document.createElement('div');
  pauseObject.className = "gameDiv pauseState";
  pauseObject.innerHTML = "<p class='pauseStateP'>Game is paused. <br>Press PLAY to continue.</p>";
  return pauseObject;
}

function gameScorer(id){
  var gameObject  = gameCache[id];
  var scoreDiv = document.createElement('div');
  scoreDiv.id = id+'#scoreDiv';
  scoreDiv.className = 'scoreDiv';

  var scoreLable = document.createElement('p');
  scoreLable.className = 'scoreLable';
  scoreLable.innerHTML = 'Score ';
  scoreDiv.appendChild(scoreLable);

  var scoreField = document.createElement('input');
  scoreField.id = id+'#scoreField';
  scoreField.setAttribute('type','text');
  scoreField.className = 'scoreField';
  scoreField.value = gameObject.score;
  scoreDiv.appendChild(scoreField);
  return scoreDiv;
}

function updateScoreField(id){
  var gameObject = gameCache[id];
  document.getElementById(id+'#scoreField').value = gameObject.score; 
}

function createRestart(id){
	var restartDiv  = document.createElement('div');
	restartDiv.className = "restartDiv";
	var restartImage = document.createElement('img');
	restartImage.id = id+'restartButton';
    restartImage.setAttribute('src','images/restart.png');
    restartImage.setAttribute('alt','Restart');
    restartImage.className = "restartImage";
    var gameDataObject = gameCache[id];
    restartImage.onclick = function(){
      document.getElementById(gameDataObject.id).innerHTML = "";
      var id = gameDataObject.id , instructionContent = gameDataObject.instructionContent, categoryNItemString = gameDataObject.categoryNItemString,
      orderType = gameDataObject.orderType,timeLevelString=gameDataObject.timeLevelString,count = gameDataObject.count;
      gameDataObject.timer.restart = true;
      categorizeApp(id,instructionContent, categoryNItemString, orderType, timeLevelString, count);
    };
    restartDiv.appendChild(restartImage);
    return restartDiv;
}

function gameSound(id){
  var gameSoundDiv = document.createElement('div');
  gameSoundDiv.id = id+'#sound';
  gameSoundDiv.className = 'gameSoundDiv';
  var soundImage = document.createElement('img');
  soundImage.id = id+'#soundImage';
  soundImage.setAttribute('src','images/soundOn.png');
  soundImage.setAttribute('alt','Sound On');
  soundImage.className = 'restartImage';
  var gameObject = gameCache[id];
  soundImage.onclick = function(){
    if(gameObject.isSoundEnable){
      gameObject.isSoundEnable = false;
      soundImage.setAttribute('src','images/soundOff.png');
      soundImage.setAttribute('alt','Sound Off');
    }else{
      gameObject.isSoundEnable = true;
      soundImage.setAttribute('src','images/soundOn.png');
      soundImage.setAttribute('alt','Sound On');
    }
  }
  gameSoundDiv.appendChild(soundImage);
  return gameSoundDiv;
}


function readInstructions(id){
 // debugger;
  var gameObject = gameCache[id];
   $('#'+gameObject.id+'#gameBlock').load(gameObject.instructionURL);
  }




//vars
var isCharOneTurn = true;
var doubleCounter = 0;   
var player1JailCounter = 0;
var player2JailCounter = 0; 
let player1;
let player2;
let questCards = new Array();
var cubeRolls = new Array();
let propertyCards = new Array();
var moneyInTheBank = 0;
var players = new Array();
var selectedTheme;
var cardsArray = [ "div0",  "div1",  "div2",  "div3",  "div4",  "div5",  "div6",  "div7",  "div8",  "div9",
                  "div10", "div11", "div12", "div13", "div14", "div15", "div16", "div17", "div18", "div19",
                  "div20", "div21", "div22", "div23", "div24", "div25", "div26", "div27", "div28", "div29",
                  "div30", "div31", "div32", "div33", "div34", "div35", "div36", "div37", "div38", "div39"];



// methods
function turn(){
  //disabling the throw dice btn
  document.getElementById("diceButton").disabled = true;
  sleep(2700).then(() => { 
    document.getElementById("diceButton").disabled = false;
  });



  var charID = isCharOneTurn ? "#char1" : "#char2";
  if(!isInJail(charID)){
    rollDice(charID);
    sleep(2500).then(() => { 
      checkNewLocation(charID);
      updateStats(); 
    });
    // checkNewLocation(charID);
    // updateStats();
  }
  else
  {
  //change players turn
  alert("player cant play! hes in jail")
  isCharOneTurn = !isCharOneTurn;
  }
  console.log(charID + " turn has ended");
}
function moveTo(steps, charID){
    var startDiv = $(charID).parent('div').attr("id");
    var startIndex = getDivIndex(startDiv);
    var endIndex;
    var currentPlayer = isCharOneTurn ? player1 : player2;
    console.log(currentPlayer.name + " has moved to " + endIndex);
    if(startIndex+steps>39){
    currentPlayer.setCash(200);
    }
    // if larger than 39, start again from 0 
    endIndex = (startIndex + steps) % 40;
    sleep(2000).then(() => { 
      $("#div" + endIndex).append($("#div" + startIndex + "> " + charID));
      printf("move to -> current player = " + currentPlayer.name + " current player location = " + currentPlayer.location + " endIndex =" +  endIndex);
      currentPlayer.location = "#div" + endIndex;
    });
}
function rollDice(charID){
  cubeRolls=[];

  throwDice();
  let x = cubeRolls[0];
  let y = cubeRolls[1];

  console.log(x);
  console.log(y);
  var name = isCharOneTurn ? "player 1" : "player 2";
  console.log(name + " rolled dice");

  if(x==y)
  {
    if(doubleCounter == 2){
      console.log(name + " has 3 doubles in a row -> goes to jail" );
      goDirectly('#div10', charID);
      if(isCharOneTurn) player1JailCounter = 3;
      else player2JailCounter =3;
      doubleCounter = 0;
      return;
    }
    
    else {
      ++doubleCounter;
      console.log(name + " had a double");
    }
    
    moveTo(x+y, charID);
  }
  else{
    moveTo(x+y, charID);
    doubleCounter = 0;
  }
}
function goDirectly(waypoint, charID){
  console.log("goDirectly"+charID);
  startIndex = $(charID).parent('div').attr("id");
  $(waypoint).append($( "#"+startIndex + "> " + charID));
  printf("go directly -> charID = " +charID +" waypoint = " +waypoint );
  charID == "#char1" ? player1.location = waypoint : player2.location = waypoint;
}
function checkNewLocation(charID){
  var currentPlayer = isCharOneTurn ? player1 : player2;
  var otherPlayer = !isCharOneTurn ? player1 : player2;
  var newLocation = $(charID).parent('div').attr("id");
  console.log("checkNewLocation -> "+currentPlayer.name);
  switch(newLocation) {
    case "div0": // go
        currentPlayer.setCash(200);
        finishTurn(false);
      break;
    case "div2": case "div17": case "div33": // chest
     currentPlayer.setCash(moneyInTheBank * 0.7);
     moneyInTheBank = 0;
     finishTurn(false);
      break;
      case "div7": case "div22": case "div36": // chance

      toggleChancePopup(drawQuestCard());
      finishTurn(false);
      break;
    case "div4": // tax
        if(currentPlayer.cash < 200){
          window.localStorage.clear();
          alert("GAME OVER! " + currentPlayer.name + " has lost the game!");
          location.reload();
          return;
        }
        currentPlayer.setCash(-200);
        moneyInTheBank += 200;
        finishTurn(false);
      break;
    case "div38":// tax
        if(currentPlayer.cash < 100){
          window.localStorage.clear();
          alert("GAME OVER! " + currentPlayer.name + " has lost the game!");
          location.reload();
          return;
        }
        currentPlayer.setCash(-100);
        moneyInTheBank += 200;
        finishTurn(false);
      break;
    case "div30": // go to jail
        goDirectly('#div10', charID);
        isCharOneTurn ? player1JailCounter = 3 : player2JailCounter=3;
        doubleCounter = 0;
        finishTurn(false);
      break;
    case "div20":case "div10":
      finishTurn(false);
      break;
     // 
    default:
    // check if this card is purchsed
      var index = getDivIndex(newLocation);
    printf("index =" + index);

      var card = getCardFromIndex(index);
    printf(" card = " + card);

      if(card.owner == null){
        togglePropertyPopup(card);
        break;
      }

      // check if this card is owned by someone else
      else if(card.owner != currentPlayer.name){
        console.log(currentPlayer.name + " paid " +card.penaltyPrice + " to "  + otherPlayer.name);
        console.log(otherPlayer.name + " had " +otherPlayer.cash+ "$ and "+ currentPlayer.name + " had " + currentPlayer.cash + "$")
        if(currentPlayer.cash < card.penaltyPrice){
          window.localStorage.clear();
          alert("GAME OVER! " + currentPlayer.name + " has lost the game!");
          location.reload();
          return;
        }
        currentPlayer.setCash(-card.penaltyPrice);
        otherPlayer.setCash(card.penaltyPrice);
        console.log(otherPlayer.name + " now has " +otherPlayer.cash+ "$ and "+ currentPlayer.name + " now has " + currentPlayer.cash + "$")
      }
      break;
    }
  saveGame();
}
function isInJail(charID){
  if(charID == "#char1" && player1JailCounter > 0){
    --player1JailCounter;
    return true;
  } 
  if(charID == "#char2" && player2JailCounter > 0){
    --player2JailCounter;
    return true;
  }
  return false;
}
function initiateBoard()
{
  // init board img price and name
 for (let i = 0; i < 40 ; i++) {
  var someDiv = document.getElementById(cardsArray[i]);
  someDiv.children[0].innerHTML = '<p>'+gameData.Subjects[selectedTheme][i].name+'</p>';

  // go | tax | train | chance | chest| free parking | partner | ksp | bug
  if(gameData.Subjects[selectedTheme][i].group != "property" && gameData.Subjects[selectedTheme][i].group != "corner" ){
  someDiv.children[1].innerHTML = '<img src="'+gameData.Subjects[selectedTheme][i].image+'">';
  }




  if(gameData.Subjects[selectedTheme][i].group == "property" || gameData.Subjects[selectedTheme][i].group == "tax" || gameData.Subjects[selectedTheme][i].group == "train" || gameData.Subjects[selectedTheme][i].group == "management") 
  someDiv.children[2].innerHTML = '<p>'+gameData.Subjects[selectedTheme][i].price+'$</p>';
  }

  //init players stats
  for (let i = 0; i < 2 ; i++)
  {
    var someDiv = document.getElementById("player" + (i+1));
    document.getElementById("char" + (i+1)).innerHTML = ('<img src="'+players[i].fig+'">');
    someDiv.children[0].innerHTML = '<img src="'+players[i].fig+'">';
    someDiv.children[1].innerHTML = '<p>'+players[i].name+'</p>';
  }
  updateStats();

}
function initiateQuestCards(){
 var tempCard;
 for (let i = 0; i < gameData.Quests[selectedTheme].length; i++) {
   tempCard = new QuestCard(gameData.Quests[selectedTheme][i].group,
                            gameData.Quests[selectedTheme][i].content,
                            gameData.Quests[selectedTheme][i].effect
                           );
   questCards.push(tempCard);
 }
}
function drawQuestCard(){
  let random = Math.floor(Math.random() * questCards.length);
  switch(questCards[random].group) {
    case "move":
      
      // move the player to desired location
      var charID = isCharOneTurn ? "#char1" : "#char2";
      var startDiv = $(charID).parent('div').attr("id");

      //cal the steps from the desired div
      var startIndex = getDivIndex(startDiv);
      var endIndex = getDivIndex(questCards[random].effect);
      if(endIndex - startIndex < 0) moveTo(40 + endIndex - startIndex,charID);
      else moveTo(endIndex - startIndex,charID);

      sleep(5000).then(() => { 
        checkNewLocation(charID);
        isCharOneTurn = !isCharOneTurn;
      });
      
      return questCards[random].content;
    case "cash":
      var currentPlayer = isCharOneTurn ? player1 : player2;
      if(currentPlayer.cash + questCards[random].effect < 0){
        window.localStorage.clear();
        alert("GAME OVER! " + currentPlayer.name + " has lost the game!");
        location.reload();
      }
      currentPlayer.setCash(questCards[random].effect);
      return questCards[random].content;
    case "payToPlayer":
      var currentPlayer = isCharOneTurn ? player1 : player2;
      var payTo = !isCharOneTurn ? player1 : player2;
      currentPlayer.setCash(questCards[random].effect);
      payTo.setCash(-questCards[random].effect)
      return questCards[random].content;  
    default:
      // not gonna heppend!
  }   
}
function getDivIndex(startDiv){
  for (let i = 0; i < cardsArray.length; i++) {
    if (startDiv == cardsArray[i]) {
        return i;
    }
  }
  return -1;
}
function initiatePropertyCards(){
  var tempCard;
  for (let i = 0; i < gameData.Subjects[selectedTheme].length; i++) {
    if(gameData.Subjects[selectedTheme][i].group == "property" || gameData.Subjects[selectedTheme][i].group == "train" || gameData.Subjects[selectedTheme][i].group == "management"){
      tempCard = new PropertyCard(gameData.Subjects[selectedTheme][i].name,
                                  gameData.Subjects[selectedTheme][i].price,
                                  gameData.Subjects[selectedTheme][i].index,
                                  gameData.Subjects[selectedTheme][i].image
                                  );
      propertyCards.push(tempCard);
    }
  }
}
function getCardFromIndex(index){
  for (let i = 0; i < propertyCards.length; i++) {
    if(propertyCards[i].indexOnBoard == index)
    return propertyCards[i];
  }
  return null;
}
function updateStats(){
  var someDiv;
  // update players cash and cards
  for (let i = 0; i < 2 ; i++) {
    someDiv = document.getElementById("player" + (i+1));
    someDiv.children[2].innerHTML = '<p>Cash: '+players[i].cash+'$</p>';
    //players[i].setPoints();
    someDiv.children[3].innerHTML = '<p>Fortune: '+ players[i].points +'</p>';
    }

  //update chest
  someDiv = document.getElementById("chest");
  someDiv.children[2].innerHTML = '<p>Cash: '+moneyInTheBank+'$</p>';
  cubeRolls=[];
}
function getDiv(id){
  return document.getElementById(id);
}
function deleteBr(text){
  return text.replace("<br>"," ");
}
function buyCard(){
  var charID = isCharOneTurn ? "#char1" : "#char2";
  var currentPlayer = isCharOneTurn ? player1 : player2;
  var newLocation = $(charID).parent('div').attr("id");
  index = getDivIndex(newLocation);
  var card = getCardFromIndex(index);

  if(card == null){
    toggle();
    return;
  } 

  if(currentPlayer.cash < card.price) {
    alert("Unfortunately you don't have enough money to buy the property!");
    return;
  }
  console.log("buyCard "+currentPlayer.name);
  card.owner = currentPlayer.name;
  currentPlayer.addProperty(card);
  fillDivColor(currentPlayer,newLocation);
  saveGame();
  finishTurn(true);
}
function finishTurn(isToggleNeeded){
  doubleCounter > 0 ? isCharOneTurn = isCharOneTurn : isCharOneTurn = !isCharOneTurn;
  updateStats();
  if(isToggleNeeded) toggle();
  document.getElementById('moveDiceRight').classList.toggle('active')

}
function loadData(){
  if(allFieldsCompleted()){
    window.localStorage.clear();
    players.push(new Player(document.getElementById("player1Name").value,"images/player-images/fig" + getPlayerSelectedFigIndex(document.getElementById("myCheckbox1")) + ".png",parseInt(slider.value),"rgba(157, 189, 237, 0.527)"));
    players.push(new Player(document.getElementById("player2Name").value,"images/player-images/fig" + getPlayerSelectedFigIndex(document.getElementById("myCheckbox4")) + ".png",parseInt(slider.value),"rgba(237, 162, 157, 0.5)"));
    player1 = players[0];
    player2 = players[1];

    // init data into board

    initiateBoard();
    initiateQuestCards();
    initiatePropertyCards();
    scrollToBoard();


  }
  else alert("Please complete the form to play!");
}
function getPlayerSelectedFigIndex(label){
  var ul = label.parentElement.parentElement;

  for (let i = 0; i < 3; i++) {
    var li = ul.children[i].children[1].className.split(' ')
    for (let j = 0; j < 2; j++) {
        if(li[j] == "active")
        return ++i;
    }
  }
  return false;
}
function playerInfo(){
    var moveUp = document.getElementById('moveUp');
    moveUp.classList.toggle('active');

    var appearUp = document.getElementById('appearUp');
    appearUp.classList.toggle('active');
}
function chooseFig(player,label){
    if(player == 1){
        parallelLabel = (document.getElementById("myCheckbox" + (parseInt(label.htmlFor.charAt(label.htmlFor.length-1)) + 3)));
    }
    else{
        parallelLabel = (document.getElementById("myCheckbox" + (parseInt(label.htmlFor.charAt(label.htmlFor.length-1)) -3)));
    }
    
    if(parallelLabel.nextElementSibling.className.split(' ')[0] == "active") return;
    toggleFig(label);
}
function toggleFig(label){
    var ul = label.parentElement.parentElement;
    for (let i = 0; i < 3; i++) {
        var li = ul.children[i].children[1].className.split(' ')
        for (let j = 0; j < 2; j++) {
            if(li[j] == "active")
            ul.children[i].children[1].classList.toggle('active');
        }
    }
    label.classList.toggle('active');
}
function toggleTheme(label,int){
    var ul = label.parentElement.parentElement;
    label.classList.toggle('active');
    if(int ==1){
         if(ul.children[1].children[1].className.split(' ')[0] == "active"){
            ul.children[1].children[1].classList.toggle('active');
            welcomediv.classList.toggle("fooden");
         }
         welcomediv.classList.toggle("video-game");
         if(selectedTheme == 0){
           selectedTheme = null;
           return;
         }
         selectedTheme = 0;
    }
    else{
        if(ul.children[0].children[1].className.split(' ')[0] == "active"){
            ul.children[0].children[1].classList.toggle('active');
            welcomediv.classList.toggle("video-game");
            
        }
        welcomediv.classList.toggle("fooden");
        if(selectedTheme == 1){
          selectedTheme = null;
          return;
        }
        selectedTheme = 1;
    }
}
function allFieldsCompleted(){
  if(document.getElementById("player1Name").value != null && document.getElementById("player2Name").value && getPlayerSelectedFigIndex(document.getElementById("myCheckbox1")) && getPlayerSelectedFigIndex(document.getElementById("myCheckbox4")) && (selectedTheme != null) )
  return true;
  else return false;
}
function scrollToBoard(){
    $('html, body').animate({
        scrollTop: $("#grid-container").offset().top
    }, 1100);
}
function throwDice() {
  cubeRolls =[];
    const dice = [...document.querySelectorAll(".die-list")];
    dice.forEach(die => {
      toggleClasses(die);
      die.dataset.roll = getRandomNumber(1, 6);
      cubeRolls.push(parseInt(die.dataset.roll));
    });
}
function toggleClasses(die) {
    die.classList.toggle("odd-roll");
    die.classList.toggle("even-roll");
}
function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function togglePropertyPopup(card){
  div = getDiv("popup");
  document.getElementById('moveDiceRight').classList.toggle('active')
  div.children[0].children[0].innerHTML = '<h3>'+ deleteBr(card.name) +'</h3>';
  div.children[0].children[1].innerHTML = '<img src="'+card.img+'">';
  div.children[0].children[2].innerHTML = '<h3>Buy for '+ card.price +'$?</h3>';
  div.children[0].children[3].innerHTML = '';
  toggle();

  printf("toggled");

}
function toggleChancePopup(content){
  //change the btns
  document.getElementById("OKbtn").classList.toggle('appearnce');
  document.getElementById("NObtn").classList.toggle('appearnce');
  // document.getElementById("CLOSEbtn").classList.toggle('appearnce');
  div = getDiv("popup");
  div.classList.toggle('quest');
  div.children[0].children[0].innerHTML = '<h3>Chance Card Opened!</h3>';
  div.children[0].children[1].innerHTML = '<img src="images/video-game/chance.png">';
  div.children[0].children[2].innerHTML = '';
  div.children[0].children[3].innerHTML = '<h3>'+ content +'</h3>';
  toggle();
  sleep(3000).then(() => { 
  document.getElementById('moveDiceRight').classList.toggle('active')

    toggle();
    sleep(500).then(() => { 
      div.classList.toggle('quest');
      document.getElementById("OKbtn").classList.toggle('appearnce');
      document.getElementById("NObtn").classList.toggle('appearnce');
    });
  });
  


}
function propertyClickInfo(div){
  printf("clicked on div")
  var card = getCardFromIndex(getDivIndex(div));
  var popupDiv = getDiv("popup");

  popupDiv.children[0].children[0].innerHTML = '<h3>'+ deleteBr(card.name) +'</h3>';
  popupDiv.children[0].children[1].innerHTML = '<img src="'+card.img+'">';
  popupDiv.children[0].children[2].innerHTML = '<h3>Current no. of houses: ' + card.houses + '</h3>';
  popupDiv.children[0].children[3].innerHTML = '';
  toggleBtn(false);
  //toggle();
  
}
function printf(txt){
  console.log(txt);
} 
function toggleBtn(bool){
  if(!bool){
  document.getElementById("OKbtn").classList.toggle('appearnce');
  document.getElementById("NObtn").classList.toggle('appearnce');
  document.getElementById("CLOSEbtn").classList.toggle('appearnce');
  toggle();
  }
  else{
    toggle();
    sleep(500).then(() => { 
      document.getElementById("OKbtn").classList.toggle('appearnce');
  document.getElementById("NObtn").classList.toggle('appearnce');
  document.getElementById("CLOSEbtn").classList.toggle('appearnce');
    });
  }
  
  
}
function fillDivColor(player,divID){
  var elem = document.querySelector("#"+divID);
  elem.style.backgroundColor = player.color;
  saveGame();
}
function isLocalStorage(){
  //default scrolling to the top!
  $('html, body').animate({
    scrollTop: $("#startinglocation").offset().top
}, 1100);

  if(localStorage.length != 0){
    document.getElementById("ContinueBTN").classList.toggle('active');
  }
  return;
}
function loadLocalStorge(){
  printf("Loading last game data");
  //Property Cards
  propertyCards = JSON.parse(localStorage.propertyCards);

  //Local Vars
  isCharOneTurn = JSON.parse(localStorage.isCharOneTurn);
  doubleCounter = JSON.parse(localStorage.doubleCounter);
  player1JailCounter = JSON.parse(localStorage.player1JailCounter);
  player2JailCounter = JSON.parse(localStorage.player2JailCounter);
  moneyInTheBank = JSON.parse(localStorage.moneyInTheBank);
  selectedTheme = JSON.parse(localStorage.selectedTheme);
  printf("data loaded");

  printf("Loading Board and init");
  players.push(new Player(JSON.parse(localStorage.player1Name),JSON.parse(localStorage.player1Fig),JSON.parse(localStorage.player1Cash),JSON.parse(localStorage.player1Color)));
  players[0].ownedCards = JSON.parse(localStorage.player1Cards);
  players[0].points = JSON.parse(localStorage.player1Points);
  players[0].location = JSON.parse(localStorage.player1location);

  players.push(new Player(JSON.parse(localStorage.player2Name),JSON.parse(localStorage.player2Fig),JSON.parse(localStorage.player2Cash),JSON.parse(localStorage.player2Color)));
  players[1].ownedCards = JSON.parse(localStorage.player2Cards);
  players[1].points = JSON.parse(localStorage.player2Points);
  players[1].location = JSON.parse(localStorage.player2location);


  player1 = players[0];
  player2 = players[1];

  // init data into board
  initiateBoard();
  initiateQuestCards();
  initiatePropertyCards();
  scrollToBoard();
  loadOwnedCards();
  goDirectly(player1.location,"#char1");
  goDirectly(player2.location,"#char2");
}
function saveGame(){
  //Player1 Data
  localStorage.player1Name = JSON.stringify(player1.name);
  localStorage.player1Color = JSON.stringify(player1.color);
  localStorage.player1Cards = JSON.stringify(player1.ownedCards);
  localStorage.player1Fig = JSON.stringify(player1.fig);
  localStorage.player1Cash = JSON.stringify(player1.cash);
  localStorage.player1Points = JSON.stringify(player1.points);
  localStorage.player1location = JSON.stringify(player1.location);

  
  //Player2 Data
  localStorage.player2Name = JSON.stringify(player2.name);
  localStorage.player2Color = JSON.stringify(player2.color);
  localStorage.player2Cards = JSON.stringify(player2.ownedCards);
  localStorage.player2Fig = JSON.stringify(player2.fig);
  localStorage.player2Cash = JSON.stringify(player2.cash);
  localStorage.player2Points = JSON.stringify(player2.points);
  localStorage.player2location = JSON.stringify(player2.location);


  //Property Cards
  localStorage.propertyCards = JSON.stringify(propertyCards);
  
  //Local Vars
  localStorage.isCharOneTurn = JSON.stringify(isCharOneTurn);
  localStorage.doubleCounter = JSON.stringify(doubleCounter);
  localStorage.player1JailCounter = JSON.stringify(player1JailCounter);
  localStorage.player2JailCounter = JSON.stringify(player2JailCounter);
  localStorage.moneyInTheBank = JSON.stringify(moneyInTheBank);
  localStorage.selectedTheme = JSON.stringify(selectedTheme);
}
function loadOwnedCards(){
  for (let i = 0; i < propertyCards.length; i++) {
    if(propertyCards[i].owner != null){
      if(propertyCards[i].owner == player1.name) fillDivColor(player1,"div" + propertyCards[i].indexOnBoard);
      else fillDivColor(player2,"div" + propertyCards[i].indexOnBoard);
    }
  }
}

function endGame(){
  if(confirm("Are you sure?")){
    if(player1.points == player2.points){
      alert("IT'S A TIE!!!");
      alert("Game has ended");
      localStorage.clear();
      location.reload();
      return;
      }
    
      var player = player1.points < player2.points ? player2 : player1;
      alert(player.name + " WON THE GAME! with " + player.points + " points");
      alert("Game has ended");
      localStorage.clear();
      location.reload();
  }
  
}

function InstFunc()
{
  // Get the modal
var modal = document.getElementById("InstModal");

// Get the button that opens the modal
var btn = document.getElementById("InstBTN");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
}
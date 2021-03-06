// Player
function Player(name, fig,cash,color)
{
  this.color = color;
  this.ownedCards = new Array();
  this.name = name;
  this.fig = fig;
  this.cash = cash;
  this.setCash = setCash;
  this.points = cash;
  this.addProperty = addProperty;
  this.setPoints = setPoints;
  this.location = 0;
}

function setPoints(res){
    if(res == null){
        this.points = this.cash;
    }
    else this.points = this.cash + (res * 0.5);
}

function setCash(cash)
{
    this.cash += cash;
} 

function addProperty(property){
    if(this.ownedCards == null) return;
    this.ownedCards.push(property);
    this.setCash(-property.price);

    var res = 0;
    for (let i = 0; i < this.ownedCards.length; i++) {
        res += this.ownedCards[i].pricePerHouse;
    }
    this.setPoints(res);
}


// Quest Card
function QuestCard(group,content,effect){
this.group = group;
this.content = content;
this.effect = effect;
}


// Property Card
function PropertyCard(name,price,indexOnBoard,img)
{
    this.indexOnBoard = indexOnBoard;
    this.owner = null;
    this.name = name;
    this.price = price;
    this.pricePerHouse = this.price / 2;
    this.houses = 0;
    this.buyHouse = buyHouse;
    this.penaltyPrice = ((this.price + this.houses * this.pricePerHouse) * 0.1);
    this.img = img;
}
function buyHouse(house)
{
    if(this.houses < 5){
        ++this.houses;  
    }
}


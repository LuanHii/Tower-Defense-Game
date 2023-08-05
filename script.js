const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;


// variaveis globais
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const defenders = [];
let numberOfResources = 300;



// mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
}

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function(){
    mouse.x = undefined;
    mouse.y = undefined;
});

// tabuleiro do jogo
const controlsBar = {
    width : canvas.width,
    height: cellSize,
}

class Cell { // classe da grid individual
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    };
    
    draw(){ //desenhando a grid
        if (mouse.x && mouse.y && collision(this,mouse)){
            ctx.strokeStyle = "black"; 
            ctx.strokeRect(this.x,this.y,this.width,this.height);
        }
       
    }
}

function createGrid(){ // criando as grids
    for (let y = cellSize; y < canvas.height; y += cellSize){
        for (let x = 0; x < canvas.width; x += cellSize ){
            gameGrid.push(new Cell(x, y));     
        }
    }
}
createGrid();

function handleGameGrid(){ // desenhando cada celula de grid individualmente
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    }
}

// balas

// defensores
class Defender { // criando molde de defensor
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
        this.shooting = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        }
        draw(){ //desenhando junto com vida
            ctx.fillStyle = "blue";
            ctx.fillRect(this.x,this.y, this.width, this.height);
            ctx.fillStyle = "gold";
            ctx.font = "30px Arial"
            ctx.fillText(Math.floor(this.health), this.x + 25,this.y + 25);
        }
}
canvas.addEventListener('click', function(){ // adicionando ao clicar
    const gridPositionX = mouse.x - (mouse.x % cellSize)
    const gridPositionY = mouse.y - (mouse.y % cellSize)
    if (gridPositionY < cellSize) return; // não deixando adicionar na barra de controle
    for (let i = 0; i < defenders.length; i++){ // não deixando adicionar em cima de um já existente
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) 
        return;
    }
    let defenderCost = 100;
    if (numberOfResources >= defenderCost){ // adicionando na array caso tenha recurso suficiente
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost //removendo recurso após conseguir colocar

    }
});

function handleDefenders(){
    for (let i = 0; i < defenders.length; i++){
        defenders[i].draw();
    }
}

// inimigos

//  recursos

// utilidades
function handleGameStatus(){ // lidando com status do jogo
    ctx.fillStyle = "gold";
    ctx.font = "30px Arial";
    ctx.fillText("Recursos: " + numberOfResources, 30,30); // texto e quantidade de recurso do jogador
}
function animate(){ 
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = "blue";  // preenchendo barra de controle com azul
    ctx.fillRect(0,0,controlsBar.width,controlsBar.height); 
    handleGameGrid();
    handleDefenders();
    handleGameStatus();
    requestAnimationFrame(animate);
}

animate();

function collision(first, second){ // detectar colisão na diagonal
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)

    ) {
        return true;
    }
}
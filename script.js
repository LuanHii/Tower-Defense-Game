const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;


// variaveis globais
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];

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
        ctx.strokeStyle = "black"; 
        ctx.strokeRect(this.x,this.y,this.width,this.height);
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

// inimigos

//  recursos

// utilidades
function animate(){
    ctx.fillStyle = "blue"; // preenchendo barra de controle com azul
    ctx.fillRect(0,0,controlsBar.width,controlsBar.height); 
    handleGameGrid();
    requestAnimationFrame(animate);
}

animate();
const gridX = document.querySelector(".grid-x");
const gridY = document.querySelector(".grid-y");
const grid = document.querySelector(".grid");
const testField = document.querySelector("#test-field");

const MAX_GRID_SIZE = 100;
const INIT_GRID_SIZE = 10;

const gridSize = {
    x: 0,
    y: 0,
};

// functions

function init(){
    gridX.value = gridY.value = gridSize.x = gridSize.y = INIT_GRID_SIZE;
    gridX.setAttribute("max", MAX_GRID_SIZE);
    gridY.setAttribute("max", MAX_GRID_SIZE);
    setGrid();
}

function setGrid(){
    const x = parseInt(gridSize.x);
    const y = parseInt(gridSize.y);
    grid.innerHTML = "";
    Array(x * y).fill().forEach((_, i) => {
        const li = document.createElement("li");
        li.innerText = i;
        li.classList.add(`list${i}`);
        grid.appendChild(li);
    });
    grid.style.gridTemplateColumns = `repeat(${x}, 1fr)`;
}

// events

gridX.addEventListener("input", event => {
    console.log(event);
    gridSize.x = event.target.value;
    setGrid();
});

gridY.addEventListener("input", event => {
    gridSize.y = event.target.value;
    setGrid();
});

// initiate

init();
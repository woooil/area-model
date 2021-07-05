const gridX = document.querySelector(".grid-x");
const gridY = document.querySelector(".grid-y");
const grid = document.querySelector(".grid");
const tileX = document.querySelector(".tile-x");
const tileY = document.querySelector(".tile-y");
const tile = document.querySelector(".tile");
const testField = document.querySelector("#test-field");

const MAX_GRID_SIZE = 100;
const INIT_GRID_SIZE = 10;
const MAX_TILE_SIZE = 10;
const INIT_TILE_SIZE = 1;
const UNIT_SIZE = "1.5rem";

const gridSize = {
    x: 0,
    y: 0,
};

const tileSize = {
    x: 0,
    y: 0,
};

// functions

function init() {
    gridX.value = gridY.value = gridSize.x = gridSize.y = INIT_GRID_SIZE;
    gridX.setAttribute("max", MAX_GRID_SIZE);
    gridY.setAttribute("max", MAX_GRID_SIZE);
    tileX.value = tileY.value = tileSize.x = tileSize.y = INIT_TILE_SIZE;
    tileX.setAttribute("max", MAX_TILE_SIZE);
    tileY.setAttribute("max", MAX_TILE_SIZE);
    setGrid();
    setTile();
}

function setGrid() {
    const x = parseInt(gridSize.x);
    const y = parseInt(gridSize.y);
    grid.innerHTML = "";
    Array(x * y).fill().forEach((_, i) => {
        const li = document.createElement("li");
        li.innerText = i;
        li.classList.add(`list${i}`);
        li.style.width = li.style.height = UNIT_SIZE;
        grid.appendChild(li);
    });
    grid.style.gridTemplateColumns = `repeat(${x}, 1fr)`;
}

function setTile() {
    // const li = document.createElement("li");
    // li.style.width = li.style.height = UNIT_SIZE;
    // li.style.backgroundColor = "gray";

    const x = parseInt(tileSize.x);
    const y = parseInt(tileSize.y);
    tile.innerHTML = "";
    Array(x * y).fill().forEach((_, i) => {
        const li = document.createElement("li");
        li.innerText = i;
        li.classList.add(`list${i}`);
        li.style.width = li.style.height = UNIT_SIZE;
        tile.appendChild(li);
    });
    tile.style.gridTemplateColumns = `repeat(${x}, 1fr)`;
}

// events

gridX.addEventListener("input", event => {
    gridSize.x = event.target.value;
    setGrid();
});

gridY.addEventListener("input", event => {
    gridSize.y = event.target.value;
    setGrid();
});

tileX.addEventListener("input", event => {
    tileSize.x = event.target.value;
    setTile();
});

tileY.addEventListener("input", event => {
    tileSize.y = event.target.value;
    setTile();
});

tile.addEventListener("touchmove", event => {
    const touchLocation = event.targetTouches[0];
    tile.style.left = touchLocation.pageX + 'px';
    tile.style.top = touchLocation.pageY + 'px';
})

// initiate

init();
const gridWidth = document.querySelector(".grid-width");
const gridHeight = document.querySelector(".grid-height");
const grid = document.querySelector(".grid");
const tileWidth = document.querySelector(".tile-width");
const tileHeight = document.querySelector(".tile-height");
const tile = document.querySelector(".tile");
const testField = document.querySelector("#test-field");

const MAX_GRID_SIZE = 100;
const INIT_GRID_SIZE = 10;
const MAX_TILE_SIZE = 10;
const INIT_TILE_SIZE = 5;
const UNIT_SIZE = "1.5rem";

const gridSize = {
    width: 0,
    height: 0,
};
const tileSize = {
    width: 0,
    height: 0,
};
const tileOffset = {
    x: 0,
    y: 0,
};

// functions

function init() {
    gridWidth.value = gridHeight.value = gridSize.width = gridSize.height = INIT_GRID_SIZE;
    gridWidth.setAttribute("max", MAX_GRID_SIZE);
    gridHeight.setAttribute("max", MAX_GRID_SIZE);
    tileWidth.value = tileHeight.value = tileSize.width = tileSize.height = INIT_TILE_SIZE;
    tileWidth.setAttribute("max", MAX_TILE_SIZE);
    tileHeight.setAttribute("max", MAX_TILE_SIZE);
    setGrid();
    setTile();
}

function setGrid() {
    const width = parseInt(gridSize.width);
    const height = parseInt(gridSize.height);
    grid.innerHTML = "";
    Array(width * height).fill().forEach((_, i) => {
        const li = document.createElement("li");
        li.innerText = i;
        li.classList.add(`list${i}`);
        li.style.width = li.style.height = UNIT_SIZE;
        grid.appendChild(li);
    });
    grid.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
}

function setTile() {
    const width = parseInt(tileSize.width);
    const height = parseInt(tileSize.height);
    tile.innerHTML = "";
    Array(width * height).fill().forEach((_, i) => {
        const li = document.createElement("li");
        li.innerText = i;
        li.classList.add(`list${i}`);
        li.setAttribute("draggable", "false");
        li.style.width = li.style.height = UNIT_SIZE;
        tile.appendChild(li);
    });
    tile.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
}

// events

gridWidth.addEventListener("input", event => {
    gridSize.width = event.target.value;
    setGrid();
});

gridHeight.addEventListener("input", event => {
    gridSize.height = event.target.value;
    setGrid();
});

tileWidth.addEventListener("input", event => {
    tileSize.width = event.target.value;
    setTile();
});

tileHeight.addEventListener("input", event => {
    tileSize.height = event.target.value;
    setTile();
});

tile.addEventListener("touchstart", event => {
    const tileRect = tile.getBoundingClientRect();
    const touchLocation = event.targetTouches[0];
    tileOffset.x = touchLocation.pageX - tileRect.x;
    tileOffset.y = touchLocation.pageY - tileRect.y;
    console.log(touchLocation);
})

tile.addEventListener("touchmove", event => {
    const touchLocation = event.targetTouches[0];
    tile.style.left = (touchLocation.pageX - tileOffset.x)+ 'px';
    tile.style.top = (touchLocation.pageY - tileOffset.y) + 'px';
})

// tile.addEventListener("dragstart", event => {
//     const tileRect = tile.getBoundingClientRect();
//     tileOffset.x = event.pageX - tileRect.x;
//     tileOffset.y = event.pageY - tileRect.y;
// })

// tile.addEventListener("dragover", event => {
//     tile.style.left = (event.pageX - tileOffset.x)+ 'px';
//     tile.style.top = (event.pageY - tileOffset.y) + 'px';
// })

// initiate

init();
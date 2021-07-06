const gridWidth = document.querySelector(".grid-width");
const gridHeight = document.querySelector(".grid-height");
const grid = document.querySelector(".grid");
const tileWidth = document.querySelector(".tile-width");
const tileHeight = document.querySelector(".tile-height");
const tileContainer = document.querySelector(".tile-container");
const testField = document.querySelector("#test-field");

const MAX_GRID_SIZE = 100;
const INIT_GRID_SIZE = 10;
const MAX_TILE_SIZE = 10;
const INIT_TILE_SIZE = 5;
const UNIT_SIZE = 1.5;
const PIXEL_PER_REM = parseFloat(getComputedStyle(document.documentElement).fontSize);

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

let tileCount = 0;
let newTile = null;

// functions

function init() {
    gridWidth.value = gridHeight.value = gridSize.width = gridSize.height = INIT_GRID_SIZE;
    gridWidth.setAttribute("max", MAX_GRID_SIZE);
    gridHeight.setAttribute("max", MAX_GRID_SIZE);
    tileWidth.value = tileHeight.value = tileSize.width = tileSize.height = INIT_TILE_SIZE;
    tileWidth.setAttribute("max", MAX_TILE_SIZE);
    tileHeight.setAttribute("max", MAX_TILE_SIZE);
    setUnits(grid, gridSize);
    createTile();
}

function setUnits(cont, size) {
    const width = size.width;
    const height = size.height;
    cont.innerHTML = "";
    Array(width * height).fill().forEach((_, i) => {
        const li = document.createElement("li");
        li.innerText = i;
        li.setAttribute("list-index", i);
        li.classList.add(`list${i}`);
        li.style.width = li.style.height = UNIT_SIZE + "rem";
        cont.insertBefore(li, cont.querySelector(`[list-index='${i - width - i % width}']`));
    });
    cont.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
}

/*
function anchorTile():
use 
*/

function anchorTile(event) {
    const changedTouch = event.changedTouches[0];
    const elem = Object.entries(document.elementsFromPoint(changedTouch.clientX, changedTouch.clientY));
    const isInGrid = elem.filter(item =>
        (item[1].parentElement && item[1].parentElement.classList.contains("grid"))
    );
    if (isInGrid.length) itemTouchDown = isInGrid[0][1];
    else return;
    const offsetX = parseInt(event.target.attributes["list-index"].value) % tileSize.width * UNIT_SIZE * PIXEL_PER_REM;
    const offsetY = parseInt(parseInt(event.target.attributes["list-index"].value) / tileSize.width) * UNIT_SIZE * PIXEL_PER_REM;
    event.target.parentElement.style.left = itemTouchDown.offsetLeft - offsetX + "px";
    event.target.parentElement.style.top = itemTouchDown.offsetTop - offsetY + "px";
}

function createTile() {
    const tile = document.createElement("ul");
    tile.classList.add("tile");
    tile.setAttribute("tile-index", tileCount);
    setUnits(tile, tileSize);
    tile.addEventListener("touchstart", event => {
        const touchLocation = event.targetTouches[0];
        tileOffset.x = touchLocation.pageX - tile.offsetLeft;
        tileOffset.y = touchLocation.pageY - tile.offsetTop;
    });
    tile.addEventListener("touchmove", event => {
        event.preventDefault();
        const touchLocation = event.targetTouches[0];
        tile.style.left = (touchLocation.pageX - tileOffset.x) + 'px';
        tile.style.top = (touchLocation.pageY - tileOffset.y) + 'px';
    });
    tile.addEventListener("touchend", event => {
        anchorTile(event);
        if (parseInt(event.target.parentElement.attributes["tile-index"].value) === tileCount - 1) createTile();
    });
    tileContainer.appendChild(tile);
    newTile = document.querySelector(`ul[tile-index="${tileCount}"]`);
    tileCount++;
}

// events

gridWidth.addEventListener("input", event => {
    gridSize.width = parseInt(event.target.value);
    setUnits(grid, gridSize);
});

gridHeight.addEventListener("input", event => {
    gridSize.height = parseInt(event.target.value);
    setUnits(grid, gridSize);
});

tileWidth.addEventListener("input", event => {
    tileSize.width = parseInt(event.target.value);
    setUnits(newTile, tileSize);
});

tileHeight.addEventListener("input", event => {
    tileSize.height = parseInt(event.target.value);
    setUnits(newTile, tileSize);
});

// initiate

init();
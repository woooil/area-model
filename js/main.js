const gridWidth = document.querySelector(".grid-width");
const gridHeight = document.querySelector(".grid-height");
const grid = document.querySelector(".grid");
const tileWidth = document.querySelector(".tile-width");
const tileHeight = document.querySelector(".tile-height");
const tileContainer = document.querySelector(".tile-container");
const testField = document.querySelector("#test-field");

const MAX_GRID_SIZE = 100;
const MAX_TILE_SIZE = 10;
const UNIT_SIZE = 1.5;
const PIXEL_PER_REM = parseFloat(getComputedStyle(document.documentElement).fontSize);

const gridSize = {
    width: 11,
    height: 7,
};
const tileSize = {
    width: 5,
    height: 3,
};
const tileOffset = {
    x: 0,
    y: 0,
};

let tileCount = 0;
let newTile = null;

// functions

function unitsToPx(units){
    return units * UNIT_SIZE * PIXEL_PER_REM;
}

function init() {
    gridWidth.value = gridSize.width;
    gridHeight.value = gridSize.height;
    gridWidth.setAttribute("max", MAX_GRID_SIZE);
    gridHeight.setAttribute("max", MAX_GRID_SIZE);
    tileWidth.value = tileSize.width;
    tileHeight.value = tileSize.height;
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
How a function anchorTile works:
    A tile finds and remembers the coordinates on the grid under the tile unit with index of 0.
    Whenever the size of the grid is updated, anchorTile is called.
*/

function isInGrid(tile) {
    const halfUnitPx = unitsToPx(0.5);
    const left = tile.offsetLeft
    const top = tile.offsetTop
    if (left + halfUnitPx < grid.offsetLeft || top + halfUnitPx < grid.offsetTop || left + tile.offsetWidth - halfUnitPx > grid.offsetLeft + grid.offsetWidth || top + tile.offsetHeight - halfUnitPx > grid.offsetTop + grid.offsetHeight){ 
        console.log("error!");
        return false;
    }
    const gridUnitIndex = parseInt(Object.entries(document.elementsFromPoint(left + halfUnitPx, top + tile.offsetHeight - halfUnitPx)).filter(item =>
        (item[1].parentElement && item[1].parentElement.classList.contains("grid"))
    )[0][1].getAttribute("list-index"));
    tile.setAttribute("anchor-x", gridUnitIndex % gridSize.width);
    tile.setAttribute("anchor-y", parseInt(gridUnitIndex / gridSize.width));
    return true;
}

function anchorTile(tile) {
    const gridUnit = grid.querySelector(`[list-index="${parseInt(tile.getAttribute("anchor-x")) + parseInt(tile.getAttribute("anchor-y")) * gridSize.width}"]`);
    tile.style.left = gridUnit.offsetLeft + "px";
    tile.style.top = gridUnit.offsetTop - tile.offsetHeight + unitsToPx(1) + "px";
}

function createTile() {
    const tile = document.createElement("ul");
    tile.classList.add("tile");
    tile.setAttribute("tile-index", tileCount);
    tile.setAttribute("anchor-x", "0");
    tile.setAttribute("anchor-y", "0");
    setUnits(tile, tileSize);
    tileContainer.appendChild(tile);
    newTile = document.querySelector(`ul[tile-index="${tileCount}"]`);
    tileCount++;
    tile.addEventListener("touchstart", event => {
        const touchLocation = event.targetTouches[0];
        tileOffset.x = touchLocation.pageX - tile.offsetLeft;
        tileOffset.y = touchLocation.pageY - tile.offsetTop;
    });
    tile.addEventListener("touchmove", event => {
        event.preventDefault();
        const tile = event.target.parentElement;
        const touchLocation = event.targetTouches[0];
        tile.style.left = (touchLocation.pageX - tileOffset.x) + 'px';
        tile.style.top = (touchLocation.pageY - tileOffset.y) + 'px';
    });
    tile.addEventListener("touchend", event => {
        const tile = event.target.parentElement;
        if (isInGrid(tile)) anchorTile(tile);
        if (parseInt(tile.attributes["tile-index"].value) === tileCount - 1) createTile();
    });
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
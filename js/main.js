const gridWidth = document.querySelector(".grid-width");
const gridHeight = document.querySelector(".grid-height");
const gridContainer = document.querySelector(".grid-container");
const grid = gridContainer.querySelector(".grid");
const xAxis = gridContainer.querySelector(".x-axis");
const yAxis = gridContainer.querySelector(".y-axis");
const tileWidth = document.querySelector(".tile-width");
const tileHeight = document.querySelector(".tile-height");
const tileContainer = document.querySelector(".tile-container");
const testField = document.querySelector("#test-field");

const MAX_GRID_SIZE = 100;
const MAX_TILE_SIZE = 10;
const UNIT_SIZE = 1.5;
const PIXEL_PER_REM = parseFloat(getComputedStyle(document.documentElement).fontSize);
const HALF_UNIT_IN_PX = 0.5 * UNIT_SIZE * PIXEL_PER_REM;

class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}
const gridSize = new Size(11, 7);
const tileSize = new Size(2, 3);
const tileOffset = {
    x: 0,
    y: 0,
};

let tileCount = 0;

// functions

function init() {
    gridWidth.value = gridSize.width;
    gridHeight.value = gridSize.height;
    gridWidth.setAttribute("max", MAX_GRID_SIZE);
    gridHeight.setAttribute("max", MAX_GRID_SIZE);
    tileWidth.value = tileSize.width;
    tileHeight.value = tileSize.height;
    tileWidth.setAttribute("max", MAX_TILE_SIZE);
    tileHeight.setAttribute("max", MAX_TILE_SIZE);
    setGrid();
    createTile();
}

function setUnits(cont, size) {
    const width = size.width;
    const height = size.height;
    cont.innerHTML = "";
    cont.style.width = `${width * UNIT_SIZE}rem`;
    cont.style.height = `${height * UNIT_SIZE}rem`;
    cont.appendChild(document.createElement("div"));
    cont.appendChild(document.createElement("div"));
    [{line: cont.firstChild, repeat: height}, {line: cont.lastChild, repeat: width}].forEach((item, idx) => {
        item.line.classList.add(`${idx ? "col" : "row"}`);
        for(let i = 0; i < item.repeat; i++){
            const div = document.createElement("div");
            div.setAttribute("index", i);
            div.innerText = i;
            item.line.appendChild(div);
        }
        item.line.style.position = "absolute";
        item.line.style.width = `${width * UNIT_SIZE}rem`;
        item.line.style.height = `${height * UNIT_SIZE}rem`;
        item.line.style.display = "grid";
        if (idx) item.line.style.gridTemplateColumns = `repeat(${item.repeat}, 1fr)`;
        else item.line.style.gridTemplateRows = `repeat(${item.repeat}, 1fr)`;
        cont.appendChild(item.line);
    })
}

function setGrid(){
    setUnits(grid, gridSize);
    gridContainer.style.gridTemplateColumns = `1fr ${gridSize.width}fr`;
    // Object.values(tileContainer.children).forEach(item => anchorTile(item));
    [{axis: xAxis, repeat: gridSize.width}, {axis: yAxis, repeat: gridSize.height}].forEach((item, idx) => {
        item.axis.innerHTML = "";
        for(let i = 0; i < item.repeat; i++){
            const div = document.createElement("div");
            div.setAttribute("index", i);
            div.innerText = i + 1;
            div.style.width = div.style.height = UNIT_SIZE + "rem";
            item.axis.appendChild(div);
        };
    });
}

function isInGrid(tile) {
    const left = tile.offsetLeft;
    const top = tile.offsetTop;
    return !(left + HALF_UNIT_IN_PX < grid.offsetLeft || top + HALF_UNIT_IN_PX < grid.offsetTop || left + tile.offsetWidth - HALF_UNIT_IN_PX > grid.offsetLeft + grid.offsetWidth || top + tile.offsetHeight - HALF_UNIT_IN_PX > grid.offsetTop + grid.offsetHeight);
}

function giveCoords(tile) {
    const gridUnitIndex = parseInt(Object.entries(document.elementsFromPoint(tile.offsetLeft + HALF_UNIT_IN_PX - window.pageXOffset, tile.offsetTop + tile.offsetHeight - HALF_UNIT_IN_PX - window.pageYOffset)).filter(item =>
        (item[1].parentElement && item[1].parentElement.classList.contains("grid"))
    )[0][1].getAttribute("unit-index"));
    tile.setAttribute("anchor-x", gridUnitIndex % gridSize.width);
    tile.setAttribute("anchor-y", parseInt(gridUnitIndex / gridSize.width));
}

function anchorTile(tile) {
    const gridUnit = grid.querySelector(`[unit-index="${parseInt(tile.getAttribute("anchor-x")) + parseInt(tile.getAttribute("anchor-y")) * gridSize.width}"]`);
    tile.style.left = gridUnit.offsetLeft + "px";
    tile.style.top = gridUnit.offsetTop - tile.offsetHeight + UNIT_SIZE * PIXEL_PER_REM + "px";
}

function createTile() {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.setAttribute("tile-index", tileCount);
    tile.setAttribute("anchor-x", 0);
    tile.setAttribute("anchor-y", 0);
    setUnits(tile, tileSize);
    tileContainer.appendChild(tile);
    // anchorTile(tile);
    tile.addEventListener("touchstart", event => {
        const touchLocation = event.targetTouches[0];
        tileOffset.x = touchLocation.pageX - tile.offsetLeft;
        tileOffset.y = touchLocation.pageY - tile.offsetTop;
    });
    tile.addEventListener("touchmove", event => {
        event.preventDefault();
        const tile = event.target.parentElement.parentElement;
        const touchLocation = event.targetTouches[0];
        tile.style.left = (touchLocation.pageX - tileOffset.x) + 'px';
        tile.style.top = (touchLocation.pageY - tileOffset.y) + 'px';
    });
    tile.addEventListener("touchend", event => {
        const tile = event.target.parentElement.parentElement;
        if (isInGrid(tile)){
            giveCoords(tile);
            anchorTile(tile);
        }
        else tile.remove();
        if (parseInt(tile.attributes["tile-index"].value) === tileCount - 1) createTile();
    });
    tileCount++;
}

// events

gridWidth.addEventListener("input", event => {
    gridSize.width = parseInt(event.target.value);
    setGrid();
});

gridHeight.addEventListener("input", event => {
    gridSize.height = parseInt(event.target.value);
    setGrid();
});

tileWidth.addEventListener("input", event => {
    tileSize.width = parseInt(event.target.value);
    setUnits(document.querySelector(`ul[tile-index="${tileCount - 1}"]`), tileSize);
    anchorTile(document.querySelector(`ul[tile-index="${tileCount - 1}"]`));
});

tileHeight.addEventListener("input", event => {
    tileSize.height = parseInt(event.target.value);
    setUnits(document.querySelector(`ul[tile-index="${tileCount - 1}"]`), tileSize);
    anchorTile(document.querySelector(`ul[tile-index="${tileCount - 1}"]`));
});

// initiate

init();
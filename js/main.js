const gridWidth = document.querySelector(".grid-width");
const gridHeight = document.querySelector(".grid-height");
const gridContainer = document.querySelector(".grid-container");
const grid = gridContainer.querySelector(".grid");
const xAxis = gridContainer.querySelector(".x-axis");
const yAxis = gridContainer.querySelector(".y-axis");
const tileWidth = document.querySelector(".tile-width");
const tileHeight = document.querySelector(".tile-height");
const tileContainer = document.querySelector(".tile-container");
const gridMode = document.querySelector(".grid-mode");
const magnetMode = document.querySelector(".magnet-mode");
const testField = document.querySelector("#test-field");

const MAX_GRID_SIZE = 100;
const MAX_TILE_SIZE = 10;
const UNIT_SIZE = 1.5;
const PIXEL_PER_REM = parseFloat(getComputedStyle(document.documentElement).fontSize);
const UNIT_IN_PX = UNIT_SIZE * PIXEL_PER_REM;
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
let isGridMode = gridMode.checked;
let isMagnetMode = magnetMode.checked;

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
    createTile(true);
    createTile();
    createTile();
}

function setUnits(cont, size) {
    const width = size.width;
    const height = size.height;
    cont.innerHTML = "";
    cont.style.width = `${width * UNIT_SIZE}rem`;
    cont.style.height = `${height * UNIT_SIZE}rem`;
    cont.append(document.createElement("div"));
    cont.append(document.createElement("div"));
    [{
        line: cont.firstChild,
        repeat: height
    }, {
        line: cont.lastChild,
        repeat: width
    }].forEach((item, idx) => {
        item.line.classList.add(`${idx ? "col" : "row"}`);
        item.line.style.pointerEvents = "none";
        for (let i = 0; i < item.repeat; i++) {
            const div = document.createElement("div");
            div.style.pointerEvents = "none";
            div.setAttribute("index", i);
            // div.innerText = i;
            idx ? item.line.append(div) : item.line.prepend(div);
        }
        item.line.style.position = "absolute";
        item.line.style.width = `${width * UNIT_SIZE}rem`;
        item.line.style.height = `${height * UNIT_SIZE}rem`;
        item.line.style.display = "grid";
        if (idx) item.line.style.gridTemplateColumns = `repeat(${item.repeat}, 1fr)`;
        else item.line.style.gridTemplateRows = `repeat(${item.repeat}, 1fr)`;
        cont.append(item.line);
    })
}

function setGrid() {
    setUnits(grid, gridSize);
    gridContainer.style.gridTemplateColumns = `1fr ${gridSize.width}fr`;
    Object.values(tileContainer.children).forEach(item => anchorTile(item));
    [{
        axis: xAxis,
        repeat: gridSize.width
    }, {
        axis: yAxis,
        repeat: gridSize.height
    }].forEach((item, idx) => {
        item.axis.innerHTML = "";
        for (let i = 0; i < item.repeat; i++) {
            const div = document.createElement("div");
            div.setAttribute("index", i);
            div.innerText = i;
            div.style.width = div.style.height = UNIT_SIZE + "rem";
            item.axis.append(div);
        };
    });
}

function isInGrid(tile) {
    const left = tile.offsetLeft;
    const top = tile.offsetTop;
    if (isMagnetMode) {
        return !(left + tile.offsetWidth / 2 < grid.offsetLeft || top + tile.offsetHeight / 2 < grid.offsetTop || left + tile.offsetWidth / 2 > grid.offsetLeft + grid.offsetWidth || top + tile.offsetHeight / 2 > grid.offsetTop + grid.offsetHeight);
    } else {
        return !(left + HALF_UNIT_IN_PX < grid.offsetLeft || top + HALF_UNIT_IN_PX < grid.offsetTop || left + tile.offsetWidth - HALF_UNIT_IN_PX > grid.offsetLeft + grid.offsetWidth || top + tile.offsetHeight - HALF_UNIT_IN_PX > grid.offsetTop + grid.offsetHeight);
    }
}

function giveCoords(tile, targetTile) {
    if (!targetTile) targetTile = tile;
    const tileHeight = parseInt(tile.querySelector(".row").childElementCount);
    const x = Math.round((tile.offsetLeft - grid.offsetLeft) / UNIT_IN_PX);
    const y = gridSize.height - Math.round((tile.offsetTop - grid.offsetTop) / UNIT_IN_PX) - tileHeight;
    if (isMagnetMode) {
        class Direction {
            constructor(dir, dis, tile) {
                this.dir = dir;
                this.dis = dis;
                this.tile = tile;
            }
        }
        const directions = [
            new Direction([-1, 0], null, null), // left
            new Direction([0, -1], null, null), // top
            new Direction([+1, 0], null, null), // right
            new Direction([0, +1], null, null), // bottom
        ];
        directions.forEach((item, idx) => {
            let temp, loop, dis;
            switch (idx) {
                case (0):
                    loop = x;
                    break;
                case (1):
                    loop = gridSize.height - y;
                    break;
                case (2):
                    loop = gridSize.width - x;
                    break;
                case (3):
                    loop = y;
                    break;
            }
            for (let i = 1; i <= loop; i++) {
                const temp = Object.values(document.elementsFromPoint(tile.offsetLeft + tile.offsetWidth / 2 - window.pageXOffset + item.dir[0] * i * UNIT_IN_PX, tile.offsetTop + tile.offsetHeight / 2 - window.pageYOffset + item.dir[1] * i * UNIT_IN_PX)).filter(item2 =>
                    item2.classList.contains("tile") && item2.getAttribute("tile-index") !== tile.getAttribute("tile-index"));
                if (temp.length !== 0) {
                    switch (idx) {
                        case (0):
                            dis = tile.offsetLeft - temp[0].offsetLeft - temp[0].offsetWidth;
                            break;
                        case (1):
                            dis = tile.offsetTop - temp[0].offsetTop - temp[0].offsetHeight;
                            break;
                        case (2):
                            dis = temp[0].offsetLeft - tile.offsetLeft - tile.offsetWidth;
                            break;
                        case (3):
                            dis = temp[0].offsetTop - tile.offsetTop - tile.offsetHeight;
                            break;
                    }
                    item.dis = dis;
                    item.tile = temp[0];
                    break;
                }
            }
        });
        let nearIdx = null;
        directions.forEach((item, idx) => {
            if (item.dis !== null && (nearIdx === null || directions[nearIdx].dis > item.dis)) nearIdx = idx;
        })
        if (nearIdx === null) return false;
        const nearTile = directions[nearIdx].tile;
        const nearX = parseInt(nearTile.getAttribute("anchor-x"));
        const nearY = parseInt(nearTile.getAttribute("anchor-y"));
        targetTile.setAttribute("anchor-x", nearX - directions[nearIdx].dir[0] * nearTile.offsetWidth / UNIT_IN_PX);
        targetTile.setAttribute("anchor-y", nearY + directions[nearIdx].dir[1] * nearTile.offsetHeight / UNIT_IN_PX);
        return true;
    } else {
        targetTile.setAttribute("anchor-x", x);
        targetTile.setAttribute("anchor-y", y);
        return true;
    }
}

function anchorTile(tile) {
    const tileHeight = parseInt(tile.querySelector(".row").childElementCount);
    tile.style.left = grid.offsetLeft + parseInt(tile.getAttribute("anchor-x")) * UNIT_IN_PX + "px";
    tile.style.top = grid.offsetTop + (gridSize.height - parseInt(tile.getAttribute("anchor-y")) - tileHeight) * UNIT_IN_PX + "px";
    return true;
}

function createTile(isGhost) {
    const tile = document.createElement("div");
    if (isGhost) {
        tile.classList.add("ghost-tile");
        tile.style.visibility = "hidden";
    } else {
        tile.classList.add("tile");
        tile.setAttribute("tile-index", tileCount);
    }
    tile.setAttribute("anchor-x", 0);
    tile.setAttribute("anchor-y", 0);
    setUnits(tile, tileSize);
    tileContainer.append(tile);
    anchorTile(tile);
    if (isGhost) return;
    tile.addEventListener("touchstart", event => {
        const touchLocation = event.targetTouches[0];
        tileOffset.x = touchLocation.pageX - tile.offsetLeft;
        tileOffset.y = touchLocation.pageY - tile.offsetTop;
    });
    tile.addEventListener("touchmove", event => {
        event.preventDefault();
        const tile = event.target;
        const touchLocation = event.targetTouches[0];
        tile.style.left = (touchLocation.pageX - tileOffset.x) + 'px';
        tile.style.top = (touchLocation.pageY - tileOffset.y) + 'px';
        const ghostTile = document.querySelector(".ghost-tile");
        if (isInGrid(tile) && giveCoords(tile, ghostTile) && anchorTile(ghostTile) && isInGrid(ghostTile)){
            ghostTile.style.visibility = "visible";
        } else {
            ghostTile.style.visibility = "hidden";
        }
    });
    tile.addEventListener("touchend", event => {
        const tile = event.target;
        const ghostTile = document.querySelector(".ghost-tile");
        if (isInGrid(tile) && isInGrid(ghostTile)) {
            giveCoords(tile);
            anchorTile(tile);
        } else tile.remove();
        if (parseInt(tile.attributes["tile-index"].value) === tileCount - 1) createTile();
        document.querySelector(".ghost-tile").style.visibility = "hidden";
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
    const newTile = document.querySelector(`div[tile-index="${tileCount - 1}"]`);
    tileSize.width = parseInt(event.target.value);
    setUnits(newTile, tileSize);
    anchorTile(newTile);
});

tileHeight.addEventListener("input", event => {
    const newTile = document.querySelector(`div[tile-index="${tileCount - 1}"]`);
    tileSize.height = parseInt(event.target.value);
    setUnits(newTile, tileSize);
    anchorTile(newTile);
});

const gridModeStyle = document.createElement("style");
document.head.append(gridModeStyle);
gridMode.addEventListener("click", event => {
    isGridMode = gridMode.checked;
    gridModeStyle.innerHTML = `.row, .col {visibility: ${isGridMode ? "visible" : "hidden"}}`;
});

magnetMode.addEventListener("click", event => {
    isMagnetMode = magnetMode.checked;
});

// initiate

init();
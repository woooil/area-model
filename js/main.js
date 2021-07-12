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
const PIXEL_PER_REM = parseFloat(getComputedStyle(document.documentElement).fontSize);

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

let unitSize;
let unitInPx;
let halfUnitInPx;

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
    resizeUnits();
    setGridMode();
    createTile(isGhost = true);
    createTile();
    createTile();
}

function setUnits(cont, size, isGhost) {
    const width = size.width;
    const height = size.height;
    cont.innerHTML = "";
    cont.style.width = `${width * unitSize}rem`;
    cont.style.height = `${height * unitSize}rem`;
    if (isGhost) return;
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
        item.line.style.width = "100%";
        item.line.style.height = "100%";
        item.line.style.display = "grid";
        if (idx) item.line.style.gridTemplateColumns = `repeat(${item.repeat}, 1fr)`;
        else item.line.style.gridTemplateRows = `repeat(${item.repeat}, 1fr)`;
        cont.append(item.line);
    })
}

function setGrid() {
    setUnits(grid, gridSize);
    gridContainer.style.gridTemplateColumns = `1fr ${gridSize.width}fr`;
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
            div.innerText = i + 1;
            div.style.width = div.style.height = div.style.lineHeight = unitSize + "rem";
            item.axis.append(div);
        };
    });
    xAxis.style.marginLeft = yAxis.style.marginBottom = grid.style.marginTop = 0.5 * unitSize + "rem";
    Object.values(tileContainer.children).forEach(item => anchorTile(item));
}

function isInGrid(tile) {
    const left = tile.offsetLeft;
    const top = tile.offsetTop;
    if (isMagnetMode) {
        return !(left + tile.offsetWidth / 2 < grid.offsetLeft || top + tile.offsetHeight / 2 < grid.offsetTop || left + tile.offsetWidth / 2 > grid.offsetLeft + grid.offsetWidth || top + tile.offsetHeight / 2 > grid.offsetTop + grid.offsetHeight);
    } else {
        return !(left + halfUnitInPx < grid.offsetLeft || top + halfUnitInPx < grid.offsetTop || left + tile.offsetWidth - halfUnitInPx > grid.offsetLeft + grid.offsetWidth || top + tile.offsetHeight - halfUnitInPx > grid.offsetTop + grid.offsetHeight);
    }
}

function giveCoords(tile, targetTile) {
    if (!targetTile) targetTile = tile;
    const tileHeight = parseInt(tile.querySelector(".row").childElementCount);
    const x = Math.round((tile.offsetLeft - grid.offsetLeft) / unitInPx);
    const y = gridSize.height - Math.round((tile.offsetTop - grid.offsetTop) / unitInPx) - tileHeight;
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
                const temp = Object.values(document.elementsFromPoint(tile.offsetLeft + tile.offsetWidth / 2 - window.pageXOffset + item.dir[0] * i * unitInPx, tile.offsetTop + tile.offsetHeight / 2 - window.pageYOffset + item.dir[1] * i * unitInPx)).filter(item2 =>
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
        targetTile.setAttribute("anchor-x", Math.round(nearX - directions[nearIdx].dir[0] * nearTile.offsetWidth / unitInPx));
        targetTile.setAttribute("anchor-y", Math.round(nearY + directions[nearIdx].dir[1] * nearTile.offsetHeight / unitInPx));
        return true;
    } else {
        targetTile.setAttribute("anchor-x", x);
        targetTile.setAttribute("anchor-y", y);
        return true;
    }
}

function anchorTile(tile) {
    tile.style.left = grid.offsetLeft + parseInt(tile.getAttribute("anchor-x")) * unitInPx + "px";
    tile.style.top = grid.offsetTop + (gridSize.height - parseInt(tile.getAttribute("anchor-y"))) * unitInPx - tile.offsetHeight + "px";
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
    setUnits(tile, tileSize, isGhost);
    tileContainer.append(tile);
    anchorTile(tile);
    if (isGhost) return;
    tile.addEventListener("touchstart", event => {
        const tile = event.target;
        const touchLocation = event.targetTouches[0];
        tileOffset.x = touchLocation.pageX - tile.offsetLeft;
        tileOffset.y = touchLocation.pageY - tile.offsetTop;
        const ghostTileSize = new Size(tile.offsetWidth / unitInPx, tile.offsetHeight / unitInPx);
        setUnits(ghostTile, ghostTileSize, true);
    });
    tile.addEventListener("touchmove", event => {
        event.preventDefault();
        const tile = event.target;
        const touchLocation = event.targetTouches[0];
        tile.style.left = (touchLocation.pageX - tileOffset.x) + 'px';
        tile.style.top = (touchLocation.pageY - tileOffset.y) + 'px';
        if (isInGrid(tile) && giveCoords(tile, ghostTile) && anchorTile(ghostTile) && isInGrid(ghostTile)) {
            ghostTile.style.visibility = "visible";
        } else {
            ghostTile.style.visibility = "hidden";
        }
    });
    tile.addEventListener("touchend", event => {
        const tile = event.target;
        if (isInGrid(tile) && isInGrid(ghostTile)) {
            giveCoords(tile);
            anchorTile(tile);
        } else tile.remove();
        if (parseInt(tile.attributes["tile-index"].value) === tileCount - 1) createTile();
        ghostTile.style.visibility = "hidden";
    });
    tileCount++;
}

function setGridMode() {
    isGridMode = gridMode.checked;
    gridModeStyle.innerHTML = `.row, .col {visibility: ${isGridMode ? "visible" : "hidden"}}`;
}

function resizeUnits() {
    const oldUnitSize = unitSize;
    const oldUnitInPx = unitInPx;
    unitSize = Math.min(document.body.offsetWidth / gridSize.width, (document.body.offsetHeight - gridContainer.offsetTop) / gridSize.height) * 0.8 / PIXEL_PER_REM;
    if (unitSize !== oldUnitSize) {
        unitInPx = unitSize * PIXEL_PER_REM;
        halfUnitInPx = 0.5 * unitSize * PIXEL_PER_REM;
        Object.values(tileContainer.children).forEach((item, idx) => {
            const width = Math.round(item.offsetWidth / oldUnitInPx) * unitSize;
            const height = Math.round(item.offsetHeight / oldUnitInPx) * unitSize;
            item.style.width = `${width}rem`;
            item.style.height = `${height}rem`;
        });
    }
    setGrid();
    axisShowStyle.innerHTML = `.x-axis, .y-axis {visibility: ${unitSize > 2 ? "visible" : "hidden"}}`;
}

// events

window.addEventListener("orientationchange", e => {
    var afterOrientationChange = function() {
        resizeUnits();
        window.removeEventListener('resize', afterOrientationChange);
    };
    window.addEventListener('resize', afterOrientationChange);
});

gridWidth.addEventListener("input", event => {
    const value = event.target.value;
    if (!value) return;
    gridSize.width = parseInt(value);
    resizeUnits();
});

gridHeight.addEventListener("input", event => {
    const value = event.target.value;
    if (!value) return;
    gridSize.height = parseInt(value);
    resizeUnits();
});

tileWidth.addEventListener("input", event => {
    const value = event.target.value;
    if (!value) return;
    const newTile = tileContainer.querySelector(`[tile-index="${tileCount - 1}"]`);
    tileSize.width = parseInt(value);
    setUnits(newTile, tileSize);
    anchorTile(newTile);
    setUnits(originTile, tileSize);
    anchorTile(originTile);
});

tileHeight.addEventListener("input", event => {
    const value = event.target.value;
    if (!value) return;
    const newTile = tileContainer.querySelector(`[tile-index="${tileCount - 1}"]`);
    tileSize.height = parseInt(value);
    setUnits(newTile, tileSize);
    anchorTile(newTile);
    setUnits(originTile, tileSize);
    anchorTile(originTile);
});

const gridModeStyle = document.createElement("style");
document.head.append(gridModeStyle);
gridMode.addEventListener("click", setGridMode);

magnetMode.addEventListener("click", event => isMagnetMode = magnetMode.checked);

const axisShowStyle = document.createElement("style");
document.head.append(axisShowStyle);

// initiate

init();
const ghostTile = tileContainer.querySelector(".ghost-tile");
const originTile = tileContainer.querySelector('[tile-index="0"]');
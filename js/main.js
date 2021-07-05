const gridX = document.querySelector(".grid-x");
const gridY = document.querySelector(".grid-y");
const grid = document.querySelector(".grid");
const testField = document.querySelector("#test-field");

const gridSize = {
    x: "0",
    y: "0",
};

// functions

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
    gridSize.x = event.target.value;
    setGrid();
});

gridY.addEventListener("input", event => {
    gridSize.y = event.target.value;
    setGrid();
});
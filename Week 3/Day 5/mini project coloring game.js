const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#577590', '#4cc9f0', '#7209b7', '#ff006e', '#ffffff', '#000000', '#9b7653'];

const palette = document.createElement('div');
palette.className = 'palette';

const grid = document.createElement('div');
grid.className = 'grid';

let selectedColor = colors[0];
let isDrawing = false;

colors.forEach((color) => {
  const swatch = document.createElement('div');
  swatch.className = 'color-swatch';
  swatch.style.backgroundColor = color;
  swatch.title = color;

  swatch.addEventListener('click', () => {
    selectedColor = color;
    document.querySelectorAll('.color-swatch').forEach((item) => {
      item.style.border = '2px solid transparent';
    });
    swatch.style.border = '2px solid #fff';
  });

  palette.appendChild(swatch);
});

for (let i = 0; i < 400; i++) {
  const cell = document.createElement('div');
  cell.className = 'pixel';
  cell.addEventListener('mousedown', () => {
    isDrawing = true;
    cell.style.backgroundColor = selectedColor;
  });

  cell.addEventListener('mouseover', () => {
    if (isDrawing) {
      cell.style.backgroundColor = selectedColor;
    }
  });

  grid.appendChild(cell);
}

document.addEventListener('mouseup', () => {
  isDrawing = false;
});

document.body.appendChild(palette);
document.body.appendChild(grid);

const style = document.createElement('style');
style.textContent = `
  body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #1b1b1b;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px;
  }

  .palette {
    display: grid;
    grid-template-columns: repeat(6, 30px);
    gap: 10px;
  }

  .color-swatch {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    box-sizing: border-box;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(20, 20px);
    gap: 2px;
    background: #333;
    padding: 6px;
    border-radius: 6px;
  }

  .pixel {
    width: 20px;
    height: 20px;
    background: white;
    border: 1px solid #ddd;
    box-sizing: border-box;
    cursor: crosshair;
  }
`;
document.head.appendChild(style);

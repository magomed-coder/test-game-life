// Место действия игры — размеченная на клетки плоскость, которая может быть безграничной, ограниченной или замкнутой.
// Каждая клетка на этой поверхности имеет восемь соседей, окружающих её, и может находиться в двух состояниях: быть «живой» (заполненной) или «мёртвой» (пустой).
// Распределение живых клеток в начале игры называется первым поколением. 
// Каждое следующее поколение рассчитывается на основе предыдущего по таким правилам:
// 1) в пустой (мёртвой) клетке, с которой соседствуют три живые клетки, зарождается жизнь;
// 2) если у живой клетки есть две или три живые соседки, то эта клетка продолжает жить; 
// в противном случае (если живых соседей меньше двух или больше трёх) клетка умирает («от одиночества» или «от перенаселённости»).
// 3) Игра прекращается, если на поле не останется ни одной «живой» клетки;

// - Для игрового поля предлагается использовать эмуляцию поверхности тора (каждая крайняя правая клетка является соседом крайней левой клетки с тем же Y и каждая крайняя верхняя клетка является соседом крайней нижней клетки с тем же X).
// -Поле может быть любых размеров. Должна быть возможность изменять размерность поля через графический интерфейс.
// - Генерацию первого поколения предлагаем сделать с помощью мыши и/или сгенерировать случайным образом. (должно работать оба варианта)
// - Время генерации нового поколения отобразите на экране в любом удобном вам виде



const gridSize = 100; // Размер поля 
let lifeProbability = 0.7
const timeInterval = 1000

class GameOfLife {
    constructor(gridSize) {

        this.gridSize = gridSize;

        this.intervalId = null
        this.isGame = false
        this.cellsElements = null

        this.startTime = 0;

        this.clickedCells = [];
        this.grid = [];
        this.nextGrid = [];

        this.container = document.querySelector('.container')
        this.gridSizeEl = document.querySelector('.grid_size')
        this.timerElement = document.querySelector('.timer');

        this.container.addEventListener('click', this.handleCellClick)

        this.addElements(this)
        this.createGrid()
    }

    startGame(interval = timeInterval) {

        if (this.clickedCells.length == 0) this.randomGridState()

        this.isGame = true;
        this.startTime = Date.now()

        this.intervalId = setInterval(() => {

            this.updateTimerUI();
            this.updateGrid();
        }, interval);

        console.log('Start', this.intervalId)
    }

    stopGame() {
        this.isGame = false;
        this.clickedCells = []

        clearInterval(this.intervalId);

        this.startTime = null;
        this.updateTimerUI();

        console.log('Stop', this.intervalId)
    }


    // Обновление сетки в соответствии с правилами игры
    updateGrid() {
        this.isGame = false;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {


                const neighborsCount = this.countNeighbors(i, j);
                // Если клетка сейчас жива
                if (this.grid[i][j] === 1) {
                    // и у нее меньше 2 или больше 3 соседей, то в слудующем поколоении она умирет
                    if (neighborsCount < 2 || neighborsCount > 3) {
                        this.nextGrid[i][j] = 0;
                    } else {
                        // В противном случае, в слудующем поколоении клетка жива
                        this.nextGrid[i][j] = 1;
                        this.isGame = true;
                    }
                } else { // Если клетка мертва
                    // и у нее 3 соседа, то в слудующем поколоении клетка она оживает
                    if (neighborsCount === 3) {
                        this.nextGrid[i][j] = 1;
                        this.isGame = true;
                    }
                }
            }
        }

        if (!this.isGame) this.stopGame();
        this.updateUIState()

        console.log('updateGrid')
    }


    // Подсчет соседей
    countNeighbors(row, col) {
        let count = 0;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (!(i === 0 && j === 0)) {
                    const x = (row + i + this.gridSize) % this.gridSize;
                    const y = (col + j + this.gridSize) % this.gridSize;

                    count += this.grid[x][y];
                }
            }
        }
        return count;
    }


    // добавляет классы клеткам. 
    // Живым элементам (состояние "1") добавляет класс "alive"
    // Мертвым элементам(состояние "0") убирает класс "alive"
    updateUIState() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = this.nextGrid[i][j];
                const state = this.grid[i][j]

                const cellIndex = (i * this.gridSize) + j;
                const cell = this.cellsElements[cellIndex];
                // const cell = this.container.querySelector(`[data-row="${i}"][data-col="${j}"]`);

                if (state == 1) {
                    cell.classList.add('alive')
                } else {
                    cell.classList.remove('alive');
                }
            }
        }

        console.log("updateUIState")
    }

    // создания сетки с клетками нужного размера и количества -> оптимизировать добавление в документ
    createGrid() {
        this.grid = [];
        this.nextGrid = [];

        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            this.nextGrid[i] = [];

            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = 0;
                this.nextGrid[i][j] = 0;
            }
        }

        console.log("createGrid: ", this.grid)
        this.createCells()
    }

    createCells() {
        this.totalElements = this.gridSize * this.gridSize
        this.batchSize = 50000
        this.currentIndex = 0

        this.container.innerHTML = '';

        const newLng = Math.floor(1000 / this.gridSize)
        this.container.style.gridTemplateColumns = `repeat(${this.gridSize}, ${newLng}px)`;

        console.log("createCells: ")

        this.addElements(newLng)
    }

    addElements(lng) {

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < this.batchSize && this.currentIndex < this.totalElements; i++) {
            const cell = document.createElement('div');

            cell.dataset.row = Math.floor(this.currentIndex / this.gridSize); // Находим строку
            cell.dataset.col = this.currentIndex % this.gridSize; // Находим столбец

            cell.style.width = `${lng}px`;
            cell.style.height = `${lng}px`;

            fragment.appendChild(cell);
            this.currentIndex++;
        }

        this.container.appendChild(fragment);

        if (this.currentIndex < this.totalElements) {
            requestAnimationFrame(this.addElements(lng));
        }

        if (this.currentIndex == this.totalElements) {

            this.cellsElements = this.container.querySelectorAll('div');
            console.log("addElements: ", this.cellsElements)
        }

    }

    // Нажатие на контейнер меняет состояние клетки 
    handleCellClick = (e) => {
        const cell = e.target

        if (!cell.closest("[data-row]")) return
        if (this.isGame) return

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (this.grid[row][col] === 1) {

            this.grid[row][col] = 0;
            cell.classList.remove('alive');

            this.clickedCells = this.clickedCells.filter(item => item !== `${row}-${col}`);
        } else {

            this.grid[row][col] = 1;
            cell.classList.add('alive');

            this.clickedCells.push(`${row}-${col}`)
        }

        console.log(`handleCellClick`, this.clickedCells);
    }

    // добавляет случайное состояние для клеток(1 - живая клетка, 0 - мертвая) 
    randomGridState() {
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            this.nextGrid[i] = [];

            for (let j = 0; j < this.gridSize; j++) {
                const randomState = Math.random() > lifeProbability ? 1 : 0;

                this.grid[i][j] = randomState
                this.nextGrid[i][j] = randomState
            }
        }

        console.log("randomGridState/ grid:", this.grid)
    }

    // при изменении значения в документе считывается значение и перерисовываются клетки(метод this.createGrid)
    changeGridSize() {
        const newSize = this.gridSizeEl.value;

        if (!isNaN(newSize) && newSize > 0) {
            this.stopGame();

            this.gridSize = Number(newSize);
            this.createGrid();

        } else {
            alert('Введите корректное число.');
        }

        console.log('changeGridSize', this.gridSize)
    }

    clearGrid() {
        this.stopGame();

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = 0;
                this.nextGrid[i][j] = 0;
            }
        }
        this.updateUIState();
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateTimerUI() {

        let elapsedTime = Date.now() - this.startTime;
        if (!this.startTime) elapsedTime = 0

        if (this.timerElement) {
            this.timerElement.textContent = this.formatTime(elapsedTime);
        }
    }

}


const game = new GameOfLife(gridSize);
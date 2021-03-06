"use strict";

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");
    var playgroundContainer = document.getElementById("playground-container");
    var navItems = document.getElementsByClassName("nav-item");
    var playgroundGrid = document.getElementById("playgroundGrid");
    var navbar = document.getElementById("navbar");
    var controlsMainContainer = document.getElementById("controls-main-container");
    var controlContainer = document.getElementById("control-container");
    var modal = document.getElementById("modal-number");
    var controlsPlay = document.getElementById("control-container-play");
    var controlsSolve = document.getElementById("control-container-solve");
    var controlsDownload = document.getElementById("control-container-download");
    var modalNewSudoku = document.getElementById("modal-newSudoku");
    var newSudokuButton = document.getElementById("newSudoku-btn");
    var newSudokuEasy = document.getElementById("newSudoku-easy");
    var newSudokuMedium = document.getElementById("newSudoku-medium");
    var newSudokuHard = document.getElementById("newSudoku-hard");
    var solutionSudokuBtn = document.getElementById("solutionSudoku-btn");
    var solveSudokuBtn = document.getElementById("solveSudoku-btn");
    var printContainer = document.getElementById("print-container");
    var printCanvas = document.getElementById("printCanvas");
    var printLoader = document.getElementById("printLoader");
    var noSolutionNote = document.getElementById("noSolutionNote");

    var printDifficultyEasy = document.getElementById("printDifficultyEasy");
    var printDifficultyMedium = document.getElementById("printDifficultyMedium");
    var printDifficultyHard = document.getElementById("printDifficultyHard");
    var numberOfPages1 = document.getElementById("numberOfPages1");
    var numberOfPages3 = document.getElementById("numberOfPages3");
    var numberOfPages5 = document.getElementById("numberOfPages5");
    var numberOfPages10 = document.getElementById("numberOfPages10");
    var numberOfPages25 = document.getElementById("numberOfPages25");

    var innerWidth = window.innerWidth;
    var innerHeight = window.innerHeight;
    var inPlayState = false;

    var difficulty = {
        easy: 45,
        medium: 36,
        hard: 28
    };

    var playgroundController = {
        cellDimension: 60,
        gridDimension: 540,
        playgroundHeight: 600,
        canHover: true
    };

    var sudokuController = {
        isEditableGrid: [],
        numbersGrid: [],
        originalGrid: [],
        updateGridNumber: function updateGridNumber(number) {
            this.numbersGrid[this.clickedRow][this.clickedColumn] = number;
            writeSudokuToView(this.numbersGrid);
        },
        writeGridToView: function writeGridToView() {
            writeSudokuToView(this.numbersGrid);
        },

        clickedRow: 0,
        clickedColumn: 0,
        isSolved: false
    };

    var modalNumberController = {
        numberStateArray: [true, true, true, true, true, true, true, true, true, true],
        getNumberState: function getNumberState(i) {
            return this.numberStateArray[i];
        }
    };

    // getting a top distance of the palyground
    function getPlaygroundTop() {
        return playgroundContainer.offsetTop;
    }
    // getting the height of the Controls Height Container
    function getControlsContainerHeight() {
        return controlsMainContainer.clientHeight;
    }

    // Load Play State of application
    function loadPlayState(dif, old) {
        playgroundContainer.style.display = "flex";
        printContainer.style.display = "none";
        controlsPlay.style.display = "flex";
        controlsSolve.style.display = "none";
        controlsDownload.style.display = "none";
        printCanvas.style.display = "none";
        inPlayState = true;
        createSudokuGrid();

        // If a sudoku grid is stored in local storage, load it.
        if (localStorage.numbersGrid && localStorage.editableGrid && localStorage.originalGrid && old) {
            getGridsToLocalStorage();
        } else {
            // Creates a new sudoku.
            createMainPlaySudoku(dif);
        }
        sudokuController.writeGridToView();
    }

    // Load Solve State of application
    function loadSolveState() {
        playgroundContainer.style.display = "flex";
        printContainer.style.display = "none";
        controlsPlay.style.display = "none";
        controlsSolve.style.display = "flex";
        controlsDownload.style.display = "none";
        printCanvas.style.display = "none";

        inPlayState = false;
        sudokuController.isSolved = false;
        solveSudokuBtn.innerText = "Solve";

        createSudokuGrid();
        createEmptySudokuToBeSolved();
        sudokuController.writeGridToView();
    }

    // Load Print State of application
    function loadPrintState() {
        printContainer.style.display = "block";
        controlsPlay.style.display = "none";
        controlsSolve.style.display = "none";
        controlsDownload.style.display = "flex";

        playgroundContainer.style.display = "none";
    }

    // Writes numbers from the array to view 
    function writeSudokuToView(sudokuGrid) {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                var cell = document.getElementById(i + "_" + j);
                if (sudokuGrid[i][j] > 0) {
                    cell.innerText = sudokuGrid[i][j];
                } else {
                    cell.innerText = "";
                }
            };
        };
    }

    function closeModal(elem) {
        elem.style.display = "none";
    }
    function openModal(elem) {
        elem.style.display = "flex";
    }

    function updateNumberModal(row, col, sudokuGrid) {
        var possibleRow = possibleFromRow(row, sudokuGrid);
        var possibleColumn = possibleFromColumn(col, sudokuGrid);
        var possibleSquare = possibleFromSquare(row, col, sudokuGrid);

        var num1 = intersectTwoArrays(possibleRow, possibleColumn);
        var possibleNumbers = intersectTwoArrays(num1, possibleSquare);

        for (var i = 1; i < 10; i++) {
            var modalNumElementView = document.getElementById("modalNumber_" + i);
            if (possibleNumbers.length > 0 && possibleNumbers.indexOf(i) >= 0 || sudokuGrid[row][col] == i) {
                modalNumElementView.classList.remove("notClickableModalNumber");
                modalNumberController.numberStateArray[i] = true;
            } else {
                modalNumElementView.classList.add("notClickableModalNumber");
                modalNumberController.numberStateArray[i] = false;
            }
        }
    }

    function getGridsToLocalStorage() {
        if (localStorage.numbersGrid && localStorage.editableGrid && localStorage.originalGrid) {
            sudokuController.numbersGrid = JSON.parse(localStorage.getItem("numbersGrid"));
            sudokuController.isEditableGrid = JSON.parse(localStorage.getItem("editableGrid"));
            sudokuController.originalGrid = JSON.parse(localStorage.getItem("originalGrid"));
            updateEditableCellView(JSON.parse(localStorage.getItem("originalGrid")));
        }
    }

    function setGridsToLocalStorage() {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem("numbersGrid", JSON.stringify(sudokuController.numbersGrid));
            localStorage.setItem("editableGrid", JSON.stringify(sudokuController.isEditableGrid));
            localStorage.setItem("originalGrid", JSON.stringify(sudokuController.originalGrid));
        } else {
            Console.log("Sorry, I can not use your local storage, please allow it.");
        }
    }

    // Event to resize the playground, the grid and all grid cells + set the fontSize of the numbers in the view.
    var resizeControl = void 0;
    window.addEventListener("resize", function () {
        clearTimeout(resizeControl);
        resizeControl = setTimeout(function () {
            checkSudokuDimensions();
            setPlaygroundGridDimension(playgroundController.gridDimension, playgroundController.playgroundHeight);

            var viewSudokuCells = document.getElementsByClassName("sudokuCell");
            for (var i = 0; i < viewSudokuCells.length; i++) {
                setPlaygroundCellDimension(viewSudokuCells[i], playgroundController.cellDimension);
            }
        }, 200);
    });

    // Closes a modal, if the outer (dark) space is clicked
    modal.addEventListener("click", function (e) {
        if (e.target == modal) {
            closeModal(modal);
        }
    });

    // Click event for modal number

    var _loop = function _loop(i) {
        var modalNumberItem = document.getElementById("modalNumber_" + i);
        modalNumberItem.addEventListener("click", function () {
            if (modalNumberController.getNumberState(i)) {
                sudokuController.updateGridNumber(i);
                if (inPlayState) {
                    setGridsToLocalStorage();
                }
                closeModal(modal);
            }
        });
    };

    for (var i = 0; i < 10; i++) {
        _loop(i);
    }

    // If a new sudoku button is clicked, a modal with difficulty option will open.
    newSudokuButton.addEventListener("click", function () {
        openModal(modalNewSudoku);
    });
    // Closes the difficulty option modal, if the darker outer space is clicked.
    modalNewSudoku.addEventListener("click", function (e) {
        if (e.target == modalNewSudoku) {
            closeModal(modalNewSudoku);
        }
    });

    newSudokuEasy.addEventListener("click", function () {
        loadPlayState(difficulty.easy, false);
        closeModal(modalNewSudoku);
    });
    newSudokuMedium.addEventListener("click", function () {
        loadPlayState(difficulty.medium, false);
        closeModal(modalNewSudoku);
    });
    newSudokuHard.addEventListener("click", function () {
        loadPlayState(difficulty.hard, false);
        closeModal(modalNewSudoku);
    });

    solutionSudokuBtn.addEventListener("click", function () {
        var result = solveSudoku(sudokuController.originalGrid);
        if (result) {
            writeSudokuToView(sudokuController.originalGrid);
            sudokuController.numbersGrid = sudokuController.originalGrid;
        } else {}
    });

    solveSudokuBtn.addEventListener("click", function () {
        if (!sudokuController.isSolved) {

            var result = solveSudoku(sudokuController.numbersGrid);
            if (result) {
                sudokuController.isSolved = true;
                writeSudokuToView(sudokuController.numbersGrid);
                solveSudokuBtn.innerText = "New grid";
            } else {
                noSolutionNote.style.display = "flex";
                setTimeout(function () {
                    noSolutionNote.style.display = "none";
                }, 2000);
            }
        } else {
            loadSolveState();
        }
    });

    document.addEventListener("touchstart", function () {
        playgroundController.canHover = false;
        var gridCells = document.getElementsByClassName("sudokuCell");
        for (var i = 0; i < gridCells.length; i++) {
            gridCells[i].classList.remove("canHover");
        }
    });
    // Adding an event listener for a Navigation Toggle

    var _loop2 = function _loop2(i) {
        if (navItems[i].classList.contains("active")) {
            loadPlayState(difficulty.easy, true);
        }
        // Adding an event listeners to a navigation item
        navItems[i].addEventListener("click", function () {
            if (!navItems[i].classList.contains("active")) {
                var active = document.getElementsByClassName("active")[0];
                active.classList.remove("active");
                navItems[i].classList.add("active");

                switch (navItems[i].id) {
                    case "navPlay":
                        loadPlayState(difficulty.easy, true);
                        break;
                    case "navSolve":
                        loadSolveState();
                        break;
                    case "navPrint":
                        loadPrintState();
                        break;
                }
            }
        });
    };

    for (var i = 0; i < navItems.length; i++) {
        _loop2(i);
    };

    // Creting a Sudoku grid with cells
    function createSudokuGrid() {
        // Clearing whole Sudoku grid
        clearSudokuGrid();
        // Checking and setting the grid dimensions
        checkSudokuDimensions();
        setPlaygroundGridDimension(playgroundController.gridDimension, playgroundController.playgroundHeight);
        // Creating sudoku's grid cells

        var _loop3 = function _loop3(i) {
            var _loop4 = function _loop4(j) {
                // Creating a div elemnt = the sudoku cell
                var gridCell = document.createElement("div");
                // Adding class to the created element
                gridCell.classList.add("sudokuCell");
                if (playgroundController.canHover) {
                    gridCell.classList.add("canHover");
                }
                setPlaygroundCellDimension(gridCell, playgroundController.cellDimension);
                // Checking if a background of the cell should be darker (in view);
                if (checkForSudokuDarkerCell(i, j)) {
                    gridCell.classList.add("darkerCellBg");
                }
                // Setting the ID to the element
                gridCell.id = i + "_" + j;
                // Appandeing the grid cell to the sudoku grid
                playgroundGrid.appendChild(gridCell);

                // EVENT LISTENER -> CLICK
                gridCell.addEventListener("click", function () {
                    sudokuController.clickedRow = i;
                    sudokuController.clickedColumn = j;

                    if (sudokuController.isEditableGrid[i][j]) {
                        updateNumberModal(i, j, sudokuController.numbersGrid);
                        openModal(modal);
                    }
                });
            };

            for (var j = 0; j < 9; j++) {
                _loop4(j);
            }
        };

        for (var i = 0; i < 9; i++) {
            _loop3(i);
        }
    }

    function clearSudokuGrid() {
        while (playgroundGrid.firstChild) {
            playgroundGrid.removeChild(playgroundGrid.firstChild);
        }
    }

    function checkForSudokuDarkerCell(i, j) {
        var result = false;
        if (i >= 0 && i < 3 || i > 5 && i < 9) {
            result = j >= 0 && j < 3 || j > 5 && j < 9 ? true : false;
        } else {
            result = j > 2 && j < 6 ? true : false;
        }
        return result;
    }

    function checkSudokuDimensions() {
        var dimensionSpace = 50;
        var playgroundMaxWidth = window.innerWidth - dimensionSpace;
        var playgroundMaxHeight = window.innerHeight - getPlaygroundTop() - getControlsContainerHeight() - 20;

        var minimum = Math.min(playgroundMaxWidth, playgroundMaxHeight);
        var cellDimension = Math.floor(minimum / 9);
        playgroundController.cellDimension = cellDimension;
        playgroundController.gridDimension = cellDimension * 9;
        playgroundController.playgroundHeight = playgroundMaxHeight;
    }

    function setPlaygroundGridDimension(width, height) {
        playgroundGrid.style.width = width + "px";
        playgroundContainer.style.width = width + "px";
        controlContainer.style.width = width + "px";
        playgroundContainer.style.height = height + "px";
        printContainer.style.height = height + "px";
    }
    function setPlaygroundCellDimension(element, dim) {
        element.style.width = dim + "px";
        element.style.height = dim + "px";
        if (dim < 25) {
            element.style.fontSize = 10 + "px";
        } else if (dim < 40) {
            element.style.fontSize = 20 + "px";
        } else if (dim < 50) {
            element.style.fontSize = 28 + "px";
        } else {
            element.style.fontSize = 40 + "px";
        }
    }

    // Create sudoku array
    function createMainPlaySudoku(difficulty) {
        // A Play Array
        var sudoku = createSudoku(difficulty);
        var numbersSudoku = copyGrid(sudoku);
        sudokuController.originalGrid = copyGrid(sudoku);
        sudokuController.numbersGrid = numbersSudoku;
        sudokuController.isEditableGrid = isEditableSudokuGrid(sudoku);

        if (typeof localStorage !== "undefined") {
            localStorage.setItem("numbersGrid", JSON.stringify(sudokuController.numbersGrid));
            localStorage.setItem("editableGrid", JSON.stringify(sudokuController.isEditableGrid));
            localStorage.setItem("originalGrid", JSON.stringify(sudokuController.originalGrid));
        } else {
            Console.log("Sorry, I can not use your local storage, please allow it.");
        }

        updateEditableCellView(numbersSudoku);
    }
    function createEmptySudokuToBeSolved() {
        var isEditableGrid = [];
        var numberGrid = [];
        for (var i = 0; i < 9; i++) {
            isEditableGrid[i] = [];
            numberGrid[i] = [];
            for (var j = 0; j < 9; j++) {
                numberGrid[i][j] = 0;
                isEditableGrid[i][j] = true;
            }
        }
        sudokuController.numbersGrid = numberGrid;
        sudokuController.isEditableGrid = isEditableGrid;
        updateEditableCellView(numberGrid);
    }

    // Creates a filled sudoku grid.
    function helpFunctionForSudokuCreation() {
        var sudokuFilledArray = [];
        for (var i = 0; i < 9; i++) {
            sudokuFilledArray[i] = [];
            for (var j = 0; j < 9; j++) {
                sudokuFilledArray[i][j] = 0;
            };
        };
        // Fill diagonal squares
        // X00
        // 0X0
        // 00X
        for (var _i = 0; _i < 3; _i++) {
            putSquareToMainGrid(_i * 4, createBaseSquareArray(), sudokuFilledArray);
        }
        solveSudoku(sudokuFilledArray);
        return sudokuFilledArray;
    }

    // The function creates a 3x3 array wit numbers 1-9, the array is base for creating whole filled sudoku
    function createBaseSquareArray() {
        var array = new Array();
        var mainNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (var i = 0; i < 3; i++) {
            array[i] = new Array();
            for (var j = 0; j < 3; j++) {
                var arrayPosition = Math.floor(Math.random() * mainNumbers.length);
                var number = mainNumbers[arrayPosition];
                mainNumbers.splice(arrayPosition, 1);
                array[i][j] = number;
            }
        }
        return array;
    }

    // removes item from an array
    function removeFromArray(arr, num) {
        var index = arr.indexOf(num);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }
    // Function intersets two array and return common values
    function intersectTwoArrays(array1, array2) {
        var helpArray1 = array1.slice(0);
        var helpArray2 = array2.slice(0);
        if (helpArray1 && helpArray2) {
            return helpArray1.filter(function (n) {
                return helpArray2.indexOf(n) >= 0;
            });
        } else {
            return 0;
        }
    }

    // Fills main sudoku square wit values from a small square.
    function putSquareToMainGrid(squareNumber, squareArray, mainGrid) {
        var col = squareNumber % 3;
        var row = squareNumber > 6 ? 2 : squareNumber > 3 ? 1 : 0;
        for (var i = 0; i < squareArray.length; i++) {
            for (var j = 0; j < squareArray[i].length; j++) {
                mainGrid[3 * row + i][3 * col + j] = squareArray[i][j];
            }
        }
    }

    // Get possible numbers from the row
    function possibleFromRow(row, grid) {
        var array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (var i = 1; i < 10; i++) {
            if (grid[row].indexOf(i) >= 0) {
                removeFromArray(array, i);
            }
        }
        return array;
    }
    // Get possible numbers from the column
    function possibleFromColumn(column, grid) {
        var array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (var i = 0; i < 9; i++) {
            if (grid[i][column] > 0) {
                removeFromArray(array, grid[i][column]);
            }
        }
        return array;
    }
    // Get possible numbers from the square
    function possibleFromSquare(row, column, grid) {
        var array = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        var x = row - row % 3;
        var y = column - column % 3;
        for (var i = x; i < x + 3; i++) {
            for (var j = y; j < y + 3; j++) {
                if (grid[i][j] > 0) {
                    removeFromArray(array, grid[i][j]);
                }
            }
        }
        return array;
    }
    // Get possible numbers for all empty cells in a sudoku grid.
    function getPossibleNumbersArray(sudokuGrid) {
        var possibleNumbersArray = [];
        for (var i = 0; i < 9; i++) {
            possibleNumbersArray[i] = [];
            for (var j = 0; j < 9; j++) {
                if (sudokuGrid[i][j] == 0) {
                    var possibleRow = possibleFromRow(i, sudokuGrid);
                    var possibleColumn = possibleFromColumn(j, sudokuGrid);
                    var possibleSquare = possibleFromSquare(i, j, sudokuGrid);

                    var num1 = intersectTwoArrays(possibleRow, possibleColumn);
                    var possibleNumbers = intersectTwoArrays(num1, possibleSquare);
                    shuffleArray(possibleNumbers);

                    possibleNumbersArray[i][j] = possibleNumbers;
                } else {
                    possibleNumbersArray[i][j] = 0;
                }
            }
        }
        return possibleNumbersArray;
    }

    // Durstenfeld array shuffle algorithm.
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    // 3 functions checking, if the number is allowed to the position in a grid.
    function isAllowedRow(row, mainGrid, number) {
        return mainGrid[row].indexOf(number) >= 0 ? false : true;
    }
    function isAllowedColumn(column, mainGrid, number) {
        for (var i = 0; i < mainGrid.length; i++) {
            if (mainGrid[i][column] == number) {
                return false;
            }
        }
        return true;
    }
    function isAllowedSquare(row, column, mainGrid, number) {
        var x = row - row % 3;
        var y = column - column % 3;
        for (var i = x; i < x + 3; i++) {
            for (var j = y; j < y + 3; j++) {
                if (mainGrid[i][j] == number) {
                    return false;
                }
            }
        }
        return true;
    }
    function numberIsAllowed(row, column, mainGrid, number) {
        if (isAllowedRow(row, mainGrid, number) && isAllowedColumn(column, mainGrid, number) && isAllowedSquare(row, column, mainGrid, number)) {
            return true;
        } else {
            return false;
        }
    }

    // Solve sudoku :)
    function solveSudoku(sudokuGrid) {
        var possibleNumbersArray = getPossibleNumbersArray(sudokuGrid);
        var result = solveHelp(sudokuGrid, possibleNumbersArray);
        return result;
    }
    // A recursion function to solve Sudoku
    function solveHelp(sudokuGrid, possibleNumbersArray) {
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                if (sudokuGrid[row][col] == 0) {
                    var possibleNumbers = possibleNumbersArray[row][col];
                    for (var number = 0; number < possibleNumbers.length; number++) {
                        if (numberIsAllowed(row, col, sudokuGrid, possibleNumbers[number])) {
                            sudokuGrid[row][col] = possibleNumbers[number];
                            if (solveHelp(sudokuGrid, possibleNumbersArray)) {
                                return true;
                            } else {
                                sudokuGrid[row][col] = 0;
                            }
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    function createSudoku(difficulty) {
        // A filled array
        var solvedSudokuArray = helpFunctionForSudokuCreation();
        // A Play Array
        var sudoku = removeNumbersFromSudokuGrid(solvedSudokuArray, difficulty);
        return sudoku;
    }

    function removeNumbersFromSudokuGrid(filledSudokuGrid, difficulty) {
        var numbersToRemove = 81 - difficulty;
        var allNumbers = [];

        for (var i = 0; i < 81; i++) {
            allNumbers[i] = i;
        }

        for (var _i2 = 0; _i2 < numbersToRemove; _i2++) {
            var randomPosition = Math.floor(Math.random() * allNumbers.length);
            var number = allNumbers[randomPosition];
            allNumbers.splice(randomPosition, 1);

            var coordinates = getCoordinatesFromNumber(number);
            var row = coordinates[0];
            var col = coordinates[1];

            filledSudokuGrid[row][col] = 0;
        }
        return filledSudokuGrid;
    }
    function getCoordinatesFromNumber(num) {
        var row = Math.floor(num / 9);
        var column = num % 9;
        return [row, column];
    }

    function isEditableSudokuGrid(sudokuGrid) {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (sudokuGrid[i][j] == 0) {
                    sudokuGrid[i][j] = true;
                } else {
                    sudokuGrid[i][j] = false;
                }
            }
        }
        return sudokuGrid;
    }

    function copyGrid(grid) {
        var newGrid = [];
        for (var i = 0; i < 9; i++) {
            newGrid[i] = [];
            for (var j = 0; j < 9; j++) {
                newGrid[i][j] = grid[i][j];
            }
        }
        return newGrid;
    }

    function updateEditableCellView(editGrid) {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (editGrid[i][j] === null || editGrid[i][j] === 0) {
                    document.getElementById(i + "_" + j).classList.add("editableCell");
                } else {
                    document.getElementById(i + "_" + j).classList.remove("editableCell");
                }
            }
        }
    }

    var context = printCanvas.getContext("2d");
    context.beginPath();
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, printCanvas.width, printCanvas.height);

    var numberOfPages = 1;
    var difficultyPrintedSudokus = difficulty.easy;

    function createGridOnCanvas(left, top, cellWidth, sudokuGrid) {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {

                if (i < 3 || i > 5) {
                    if (j < 3 || j > 5) {
                        context.beginPath();
                        context.fillStyle = "#bfbfbf";
                        context.rect(j * cellWidth + left, i * cellWidth + top, cellWidth, cellWidth);
                        context.fill();
                    }
                } else {
                    if (j > 2 && j < 6) {
                        context.beginPath();
                        context.fillStyle = "#bfbfbf";
                        context.rect(j * cellWidth + left, i * cellWidth + top, cellWidth, cellWidth);
                        context.fill();
                    }
                }
                context.beginPath();
                context.rect(j * cellWidth + left, i * cellWidth + top, cellWidth, cellWidth);
                context.stroke();

                if (sudokuGrid[i][j] > 0) {
                    writeNumberOnCanvas(j * cellWidth + left, i * cellWidth + top, cellWidth, sudokuGrid[i][j]);
                }
            }
        }
        context.beginPath();
        context.rect(left, top, 9 * cellWidth, 9 * cellWidth);
        context.stroke();
    }

    function writeNumberOnCanvas(left, top, cellWidth, number) {
        context.beginPath();
        context.font = "28px Arial";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.fillText(number, left + cellWidth / 2, top + cellWidth * 0.75);
    }

    function createSudokuPage(difficulty) {
        context.clearRect(0, 0, printCanvas.width, printCanvas.height);
        context.beginPath();
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, printCanvas.width, printCanvas.height);

        context.lineWidth = "1";
        context.strokeStyle = "black";
        var canvasWidth = printCanvas.width;
        var canvasHeight = printCanvas.height;
        var cellWidth = 42;
        var canvasGridWidth = cellWidth * 9;

        var canvasTops = [];
        canvasTops[0] = 82;
        var helpTop = (canvasHeight - 2 * canvasTops[0] - 3 * canvasGridWidth) / 2;
        canvasTops[1] = canvasTops[0] + canvasGridWidth + helpTop;
        canvasTops[2] = canvasTops[0] + (canvasGridWidth + helpTop) * 2;

        var canvasLefts = [];
        canvasLefts[0] = 85;
        canvasLefts[1] = 9 * cellWidth + canvasLefts[0] + (canvasWidth - (9 * cellWidth + canvasLefts[0]) * 2);

        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < 3; j++) {
                var sudokuGrid = createSudoku(difficulty);
                createGridOnCanvas(canvasLefts[i], canvasTops[j], cellWidth, sudokuGrid);
            }
        }
    }

    function clearDifficultyActiveClassFromBtns() {
        var printDiff = document.getElementsByClassName("print-options-diff");
        for (var i = 0; i < printDiff.length; i++) {
            printDiff[i].classList.remove("print-active");
        }
    }
    printDifficultyEasy.addEventListener("click", function () {
        clearDifficultyActiveClassFromBtns();
        printDifficultyEasy.classList.add("print-active");
        difficultyPrintedSudokus = difficulty.easy;
    });
    printDifficultyMedium.addEventListener("click", function () {
        clearDifficultyActiveClassFromBtns();
        printDifficultyMedium.classList.add("print-active");
        difficultyPrintedSudokus = difficulty.medium;
    });
    printDifficultyHard.addEventListener("click", function () {
        clearDifficultyActiveClassFromBtns();
        printDifficultyHard.classList.add("print-active");
        difficultyPrintedSudokus = difficulty.hard;
    });

    function clearNumbersActiveClassFromBtns() {
        var printNum = document.getElementsByClassName("print-options-num");
        for (var i = 0; i < printNum.length; i++) {
            printNum[i].classList.remove("print-active");
        }
    }
    var printNum = document.getElementsByClassName("print-options-num");

    var _loop5 = function _loop5(i) {
        printNum[i].addEventListener("click", function (e) {
            var numHelp = printNum[i].id.split("_");
            var num = parseInt(numHelp[1]);
            numberOfPages = num;
            clearNumbersActiveClassFromBtns();
            printNum[i].classList.add("print-active");
        });
    };

    for (var i = 0; i < printNum.length; i++) {
        _loop5(i);
    }

    controlsDownload.addEventListener("click", function () {
        printLoader.style.display = "flex";

        setTimeout(function () {
            var pdf = new jsPDF();
            var pdfWidth = pdf.internal.pageSize.width;
            var pdfHeight = pdf.internal.pageSize.height;

            for (var i = 0; i < numberOfPages; i++) {
                createSudokuPage(difficultyPrintedSudokus);

                var imgData = printCanvas.toDataURL("image/jpeg", 1.0);
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

                if (i + 1 !== numberOfPages) {
                    pdf.addPage();
                }
            }
            printLoader.style.display = "none";
            pdf.save("sudoku.pdf");
        }, 30);
    });
});
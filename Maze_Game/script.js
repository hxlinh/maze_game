var dirs = ["n", "s", "e", "w"];
var modDir = {
  n: {
    y: -1,
    x: 0,
    o: "s"
  },
  s: {
    y: 1,
    x: 0,
    o: "n"
  },
  e: {
    y: 0,
    x: 1,
    o: "w"
  },
  w: {
    y: 0,
    x: -1,
    o: "e"
  }
};

Array.prototype.findElement = function(x, y){
  for(var i = 0; i < this.length; i++)
    if(this[i].x == x && this[i].y == y)  return i;
  return -1;
}

function rand(max) {
    return Math.floor(Math.random() * max);
  }
  
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
   
  function displayVictoryMess(moves) {
    document.getElementById("moves").innerHTML = "You Moved " + moves + " Steps.";
    toggleVisablity("Message-Container");  
  }
  
  function toggleVisablity(id) {
    if (document.getElementById(id).style.visibility == "visible") {
      document.getElementById(id).style.visibility = "hidden";
    } else {
      document.getElementById(id).style.visibility = "visible";
    }
  }
  
  function Maze(width, height) {
    var mazeMap;
    var startCoord, endCoord;
  
    function genMap() {
      mazeMap = new Array(height);
      for (y = 0; y < height; y++) {
        mazeMap[y] = new Array(width);
        for (x = 0; x < width; ++x) {
          mazeMap[y][x] = {
            n: false,
            s: false,
            e: false,
            w: false,
            visited: false,
            priorPos: null
          };
        }
      }
    }
  
    function defineMaze() {
      var isComp = false;
      var move = false;
      var cellsVisited = 1;
      var pos = {
        x: 0,
        y: 0
      };
      var numCells = width * height;

      while (!isComp) {
        move = false;
        mazeMap[pos.x][pos.y].visited = true;
          shuffle(dirs);

        for (index = 0; index < dirs.length; index++) {
          var direction = dirs[index];
          var nx = pos.x + modDir[direction].x;
          var ny = pos.y + modDir[direction].y;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            //Check if the tile is already visited
            if (!mazeMap[nx][ny].visited) {
              //Carve through walls from this tile to next
              mazeMap[pos.x][pos.y][direction] = true;
              mazeMap[nx][ny][modDir[direction].o] = true; 
              //Set Currentcell as next cells Prior visited
              mazeMap[nx][ny].priorPos = pos;
              //Update Cell position to newly visited location
              pos = {
                x: nx,
                y: ny
              };
              cellsVisited++;
              //Recursively call this method on the next tile
              move = true;
              break;
            }
          }
        }

        if (!move) {
          //  If it failed to find a direction,
          //  move the current position back to the prior cell and Recall the method.
          pos = mazeMap[pos.x][pos.y].priorPos;
        }
        if (numCells == cellsVisited) {
          isComp = true;
        }
      }
    }
  
    function defineStartEnd() {
      switch (rand(4)) {
        case 0:
          startCoord = {
            x: 0,
            y: 0
          };
          endCoord = {
            x: height - 1,
            y: width - 1
          };
          break;
        case 1:
          startCoord = {
            x: 0,
            y: width - 1
          };
          endCoord = {
            x: height - 1,
            y: 0
          };
          break;
        case 2:
          startCoord = {
            x: height - 1,
            y: 0
          };
          endCoord = {
            x: 0,
            y: width - 1
          };
          break;
        case 3:
          startCoord = {
            x: height - 1,
            y: width - 1
          };
          endCoord = {
            x: 0,
            y: 0
          };
          break;
      }
    }
  
    this.map = function() {
      return mazeMap;
    };
    this.startCoord = function() {
      return startCoord;
    };
    this.endCoord = function() {
      return endCoord;
    };
  
    genMap();
    defineStartEnd();
    defineMaze();
  }
  
  function DrawMaze(Maze, ctx, endSprite) {
    var map = Maze.map();
    ctx.lineWidth = cellSize / 40;
  
    function drawCell(xCord, yCord, cell) {
      var x = xCord * cellSize;
      var y = yCord * cellSize;
  
      if (cell.n === false) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
        ctx.stroke();
      }
      if (cell.s === false) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (cell.e === false) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (cell.w === false) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellSize);
        ctx.stroke();
      }
    }
  
    function drawMap() {
      for (x = 0; x < map.length; x++) {
        for (y = 0; y < map[x].length; y++) {
          drawCell(x, y, map[x][y]);
        }
      }
    }
  
    function drawEndSprite() {
      var coord = Maze.endCoord();
      ctx.drawImage(
        endSprite,
        coord.x * cellSize + cellSize * 0.2,
        coord.y * cellSize + cellSize * 0.2,
        cellSize * 0.7,
        cellSize * 0.7
      );
    }
    
    function clear() {
      var canvasSize = cellSize * map.length;
      ctx.clearRect(0, 0, canvasSize, canvasSize);
    }
  
    clear();
    drawMap();
    drawEndSprite();
  }
  
  function Player(maze, c, onComplete, sprite) {
  //  var ctx = c.getContext("2d");
    var moves = 0;
    var map = maze.map();
    var cellCoords = {
      x: maze.startCoord().x,
      y: maze.startCoord().y
    };

    this.cellCoords = function() {
      return cellCoords;
    };
  
    function drawSpriteImg(coord) {
      ctx.drawImage(
        sprite,
        coord.x * cellSize + cellSize * 0.2,
        coord.y * cellSize + cellSize * 0.2,
        cellSize * 0.7,
        cellSize * 0.7
      );
      // if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      //   onComplete(moves);
      //   player.unbindKeyDown();
      // }
    }
  
    function removeSprite(coord) {
      ctx.clearRect(
        coord.x * cellSize + cellSize * 0.2,
        coord.y * cellSize + cellSize * 0.2,
        cellSize * 0.7,
        cellSize * 0.7
      );
    }
  
    function check(e) {
      var cell = map[cellCoords.x][cellCoords.y];
      moves++;
      switch (e.keyCode) {
        case 65:
        case 37: // west
          if (cell.w == true) {
            removeSprite(cellCoords);
            cellCoords = {
              x: cellCoords.x - 1,
              y: cellCoords.y
            };
            var z = hintArr.findElement(cellCoords.x, cellCoords.y);
            if(z != -1)  hintArr.splice(z, 1);
            drawSpriteImg(cellCoords);
            if (cellCoords.x === maze.endCoord().x && cellCoords.y === maze.endCoord().y) {
              onComplete(moves);
              player.unbindKeyDown();
            }
          }
          break;
        case 87:
        case 38: // north
          if (cell.n == true) {
            removeSprite(cellCoords);
            cellCoords = {
              x: cellCoords.x,
              y: cellCoords.y - 1
            };
            var z = hintArr.findElement(cellCoords.x, cellCoords.y);
            if(z != -1)  hintArr.splice(z, 1);
            drawSpriteImg(cellCoords);
            if (cellCoords.x === maze.endCoord().x && cellCoords.y === maze.endCoord().y) {
              onComplete(moves);
              player.unbindKeyDown();
            }
          }
          break;
        case 68:
        case 39: // east
          if (cell.e == true) {
            removeSprite(cellCoords);
            cellCoords = {
              x: cellCoords.x + 1,
              y: cellCoords.y
            };
            var z = hintArr.findElement(cellCoords.x, cellCoords.y);
            if(z != -1)  hintArr.splice(z, 1);
            drawSpriteImg(cellCoords);
            if (cellCoords.x === maze.endCoord().x && cellCoords.y === maze.endCoord().y) {
              onComplete(moves);
              player.unbindKeyDown();
            }
          }
          break;
        case 83:
        case 40: // south
          if (cell.s == true) {
            removeSprite(cellCoords);
            cellCoords = {
              x: cellCoords.x,
              y: cellCoords.y + 1
            };
            var z = hintArr.findElement(cellCoords.x, cellCoords.y);
            if(z != -1)  hintArr.splice(z, 1);
            drawSpriteImg(cellCoords);
            if (cellCoords.x === maze.endCoord().x && cellCoords.y === maze.endCoord().y) {
              onComplete(moves);
              player.unbindKeyDown();
            }
          }
          break;
      }
    }
  
    this.bindKeyDown = function() {
      window.addEventListener("keydown", check);
  
      $("#view").swipe({
        swipe: function(
          event,
          direction,
          distance,
          duration,
          fingerCount,
          fingerData
        ) {
          switch (direction) {
            case "up":
              check({
                keyCode: 38
              });
              break;
            case "down":
              check({
                keyCode: 40
              });
              break;
            case "left":
              check({
                keyCode: 37
              });
              break;
            case "right":
              check({
                keyCode: 39
              });
              break;
          }
        },
        threshold: 0
      });
    };
  
    this.unbindKeyDown = function() {
      window.removeEventListener("keydown", check);
      $("#view").swipe("destroy");
    };
  
    drawSpriteImg(maze.startCoord());
    this.bindKeyDown();
  }
  
var mazeCanvas = document.getElementById("mazeCanvas");
var ctx = mazeCanvas.getContext("2d");
var sprite;
var finishSprite;
var hintSprite;
var maze, player;
var cellSize;
var difficulty;
var hintArr = [];
window.onload = function() { 
    //Load and edit sprites
  var completeOne = false;
  var completeTwo = false;
  var completeThree = false;

  var isComplete = () => {
    if(completeOne === true && completeTwo === true && completeThree === true)
    {
      console.log("Runs");
      setTimeout(function(){
      makeMaze();
          }, 500);         
        }
    };

    sprite = new Image();
    sprite.src =
      "./key.png" +
      "?" +
      new Date().getTime(); 
    sprite.setAttribute("crossOrigin", " "); 
    sprite.onload = function() {
      completeOne = true;
      console.log("Player: " + completeOne + "!");
      isComplete();
    };
  
    finishSprite = new Image();
    finishSprite.src = "./home.png"+
    "?" +
    new Date().getTime();
    finishSprite.setAttribute("crossOrigin", " ");
    finishSprite.onload = function() {
      completeTwo = true;
      console.log("Destination: " + completeTwo + "!");
      isComplete();
    }; 

    hintSprite = new Image();
    hintSprite.src = "./hint.png"+
    "?" +
    new Date().getTime();
    hintSprite.setAttribute("crossOrigin", " ");
    hintSprite.onload = function() {
      completeThree = true;
      console.log("Hint: " + completeThree + "!");
      isComplete();
    }; 
  };
  
function makeMaze() {
    if (player != undefined) {
        player.unbindKeyDown();
        player = null;
    }
    hintArr = [];

    var e = document.getElementById("diffSelect");
    difficulty = e.options[e.selectedIndex].value;
    cellSize = mazeCanvas.width / difficulty;
    maze = new Maze(difficulty, difficulty);
    DrawMaze(maze, ctx, finishSprite);
    player = new Player(maze, mazeCanvas, displayVictoryMess, sprite);

    if (document.getElementById("mazeContainer").style.opacity < "100") {
        document.getElementById("mazeContainer").style.opacity = "100";
    }
}



function showHint() {
      var startPos = {
          x: player.cellCoords().x,
          y: player.cellCoords().y
      };
      var endPos = maze.endCoord();
      var path = findPath(startPos, endPos);
      drawHintPath(path);

function getKey(pos) {
  return pos.x + ", " + pos.y;
}

function getNeighbors(pos, maze) {
  var neighbors = [];

  for (var i = 0; i < dirs.length; i++) {
      var dir = dirs[i];
      var nx = pos.x + modDir[dir].x;
      var ny = pos.y + modDir[dir].y;

      if (nx >= 0 && nx < maze.map().length && ny >= 0 && ny < maze.map().length) {
          if (maze.map()[pos.x][pos.y][dir]) {
              neighbors.push({ x: nx, y: ny });
          }
      }
  }
  return neighbors;
}

function findPath(startPos, endPos) {
  var stack = []; 
  var visited = [];
  var path = [];

  stack.push(startPos);
  while (stack.length > 0) {
    var currentPos = stack.pop();
    if (currentPos.x === endPos.x && currentPos.y === endPos.y) {
            while (currentPos) {
                path.push(currentPos);
                currentPos = currentPos.parent;
            }
            break;
        }
        visited[getKey(currentPos)] = true;
        var neighbors = getNeighbors(currentPos, maze);
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];
            if (!visited[getKey(neighbor)]) {
                stack.push(neighbor);
                neighbor.parent = currentPos; 
            }
        }
    }
    return path.reverse();
}

function drawHintPath(path) {
  var num = 0;
  switch(difficulty){
    case '10':
      num = 5;
      break;
    case '15':
      num = 10;
      break;
    case '25':
      num = 15;
      break;
      case '3':
      num = 5;
      break;
  }
 // if(path.length - 2 < num) num = path.length - 2;
  if(path.length  - 2 - hintArr.length < num) num = path.length  - 2 - hintArr.length;

  for (var i = 0; i < num; i++) {
    var index = 0;
    while(index === 0 || hintArr.findElement(path[index].x, path[index].y) != -1){
      index = rand(path.length - 1);
    }
    hintArr.push(path[index]);

    ctx.drawImage(
      hintSprite,
      (path[index].x + 0.35) * cellSize, 
      (path[index].y + 0.35) * cellSize, 
      cellSize * 0.3,
      cellSize * 0.3
    );
  } 
}
}

const readline = require("readline");
const WebSocket = require("ws");

class Lift {
    constructor(name, currentFloor) {
        this.name = name;
        this.currentFloor = currentFloor;
        this.destinationFloors = [];
    }

  addDestination(floor) {
    if (!this.destinationFloors.includes(floor)) {
      this.destinationFloors.push(floor);
    }
  }

  move() {
    for(let i=0; i<this.destinationFloors.length; i++){
        let nextFloor = this.destinationFloors[i]
        if(this.currentFloor < nextFloor) {
          while(this.currentFloor !== nextFloor)
            this.currentFloor += 1;
        } else if (this.currentFloor > nextFloor) {
          while(this.currentFloor !== nextFloor)
            this.currentFloor -= 1;
        } else {
          this.destinationFloors.shift(); //removed first element we are using like queue
        }
       this.currentFloor = nextFloor; 
      }
      const liftStatus = {
        lift: this.name,
        currentFloor: this.currentFloor,
        destinationFloors: this.destinationFloors,
      };
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(liftStatus));
      });
    
  }
}

class Building {
  constructor(floors, numLifts) {
    this.floors = floors;
    this.lifts = [];

    for (let i = 1; i <= numLifts; i++) {
      const liftName = `lift${i}`;
      this.lifts.push(new Lift(liftName, 1));
    }
  }

  requestLift(userFloor, destinationFloor) {
    let nearestLift = null;
    let nearestDistance = Number.MAX_VALUE;
    for (const lift of this.lifts) {
      const distance = Math.abs(userFloor - lift.currentFloor) //calculating distance and returning minimum distance
      if (distance < nearestDistance) {
        nearestLift = lift;
        nearestDistance = distance;
      }
    }

    if (nearestLift) {

      nearestLift.addDestination(userFloor);//come to user
      nearestLift.addDestination(destinationFloor);//drop the user
      console.log(
        `Lift ${nearestLift.name} present at ${nearestLift.currentFloor} (Lift location)`
      );
      console.log(
        `Lift ${nearestLift.name} assigned to floor ${userFloor} (User's location)`
      );
      console.log(
        `Lift ${nearestLift.name} added destination floor ${destinationFloor} (User's destination)`
      );
    } else {
      console.log(
        "No available lifts at the moment. Please try again later."
      );
    }
  }
  

  updateLifts() {
    for (const lift of this.lifts) {
      lift.move();
    }
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const building = new Building(10, 2);

console.log("Building initialized with 10 floors and 2 lifts.");

rl.setPrompt("Enter user floor and user destination floor (e.g., '3 7') or 'q' to quit: ");

rl.prompt();

rl.on("line", (input) => {
  switch (input) {
    case "q":
      rl.close();
      break;
    default:
      const [userFloor, destinationFloor] = input.split(" ");
      if (!isNaN(userFloor) && !isNaN(destinationFloor) && userFloor >= 1 && userFloor <= 10 && destinationFloor >= 1 && destinationFloor <= 10) {
        building.requestLift(parseInt(userFloor), parseInt(destinationFloor));
      } else {
        console.log("Invalid input. Please try again.");
      }
      break;
  }

  building.updateLifts();

  rl.prompt();
});

rl.on("close", () => {
  console.log("Program terminated.");
  process.exit(0);
});

// WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });

console.log("WebSocket server started on port 8080.");

wss.on("connection", (ws) => {
  console.log("A client connected.");

  // Send initial lift statuses to the newly connected client
  building.lifts.forEach(lift => {
    const liftStatus = {
      lift: lift.name,
      currentFloor: lift.currentFloor,
      destinationFloors: lift.destinationFloors,
    };
    ws.send(JSON.stringify(liftStatus));
  });
});


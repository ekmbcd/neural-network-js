const N = 100

const carCanvas = document.getElementById('carCanvas')
carCanvas.height = window.innerHeight
carCanvas.width = 200
const carCtx = carCanvas.getContext("2d")

const networkCanvas = document.getElementById('networkCanvas')
networkCanvas.height = window.innerHeight
networkCanvas.width = 300
const networkCtx = networkCanvas.getContext("2d")

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9)

const cars = generateCars(N)
let bestCar = cars[0]
if (localStorage.getItem('bestBrain')) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'))
    if (i !== 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.1)
    }
  }
}

const traffic = [
  new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(2), -400, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(0), -800, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(2), -1000, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(1), -1200, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(0), -1200, 30, 50, "DUMMY", 2),
]

animate()

function save() {
  localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
}

function discard () {
  localStorage.removeItem('bestBrain')
}

function generateCars(N) {
  const cars = []
  for (let i = 0; i < N; i++) {
    cars.push(new Car(
      road.getLaneCenter(1), 100, 30, 50, "AI"
    ))
  }
  return cars
}

function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, [])
  }

  for (const car of cars) {
    car.update(road.borders, traffic)
  }

  bestCar = cars.find(car => 
    car.y === Math.min(...cars.map(car => car.y))
  )

  // resizing the canvas also clears it
  carCanvas.height = window.innerHeight
  networkCanvas.height = window.innerHeight

  carCtx.save()
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7)

  road.draw(carCtx)
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx, "red")
  }

  carCtx.globalAlpha = 0.2
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx ,"blue")
  }

  carCtx.globalAlpha = 1
  bestCar.draw(carCtx, "green", true)


  carCtx.restore()

  networkCtx.lineDashOffset = -time / 50
  Visualizer.drawNetwork(networkCtx, bestCar.brain)

  requestAnimationFrame(animate)
}
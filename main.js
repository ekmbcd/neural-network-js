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

const cars = generateCars(10)
const traffic = [
  new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)
]

animate()

function generateCars(N) {
  const cars = []
  for (let i = 1; i < N; i++) {
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

  // resizing the canvas also clears it
  carCanvas.height = window.innerHeight
  networkCanvas.height = window.innerHeight

  carCtx.save()
  carCtx.translate(0, -cars[0].y + carCanvas.height * 0.7)

  road.draw(carCtx)
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx, "red")
  }

  carCtx.globalAlpha = 0.2
  for (const car of cars) {
    car.draw(carCtx, "blue")
  }
  carCtx.globalAlpha = 1


  carCtx.restore()

  networkCtx.lineDashOffset = -time / 50
  Visualizer.drawNetwork(networkCtx, cars[0].brain)

  requestAnimationFrame(animate)
}
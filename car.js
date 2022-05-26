class Car {
  constructor(x, y, width, height, controlType, maxSpeed = 3) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height

    this.speed = 0
    this.acceleration = 0.2
    this.maxSpeed = maxSpeed
    this.friction = 0.05
    this.angle = 0
    this.damaged = false

    this.useBrain = controlType === "AI"

    if (controlType !== "DUMMY") {
      this.sensor = new Sensor(this)
      this.brain = new NeuralNetwork(
        [this.sensor.rayCount, 6, 4]
      )
    }
    this.controls = new Controls(controlType)

    this.polygon = []
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move()
      this.polygon = this.#createPolygon()
      this.damaged = this.#assessDamage(roadBorders, traffic)
    }

    if (this.sensor) {
      this.sensor.update(roadBorders, traffic)
      const offsets = this.sensor.readings.map(
        // the value is higher if the object is close
        x => x === null ? 0 : 1 - x.offset
      )
      const outputs = NeuralNetwork.feedForward(
        offsets, this.brain
      )
      // console.log(outputs)

      if (this.useBrain) {
        this.controls.forward = outputs[0]
        this.controls.left = outputs[1]
        this.controls.rigth = outputs[2]
        this.controls.reverse = outputs[3]
      }
    }
  }

  #assessDamage(roadBorders, traffic) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) {
        return true
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygon, traffic[i].polygon)) {
        return true
      }
    }
    return false
  }

  // get corners of the car
  #createPolygon() {
    const points = []
    const rad = Math.hypot(this.width, this.height) / 2
    const alpha = Math.atan2(this.width, this.height)

    // top-right
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    })
    // top-left
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    })
    // bottom-left
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    })
    // bottom-right
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    })

    return points
  }

  #move() {
    // move car
    if (this.controls.forward) {
      this.speed += this.acceleration
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration
    }

    // steer
    if (this.speed !== 0) {
      const flip = this.speed > 0 ? 1 : -1
      if (this.controls.rigth) {
        this.angle -= 0.03 * flip
      }
      if (this.controls.left) {
        this.angle += 0.03 * flip
      }
    }

    // cap speed
    if (this.speed > this.maxSpeed){
      this.speed = this.maxSpeed
    }
    if (this.speed < -this.maxSpeed / 2){
      this.speed = -this.maxSpeed / 2
    }

    // add friction
    if (this.speed > 0) {
      this.speed -= this.friction
    }
    if (this.speed < 0) {
      this.speed += this.friction
    }

    // solve weird stuff when speed is very small
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0
    }

    this.x -= Math.sin(this.angle) * this.speed
    this.y -= Math.cos(this.angle) * this.speed
  }

  draw(ctx, color) {
    // // rotation
    // ctx.save()
    // ctx.translate(this.x, this.y)
    // ctx.rotate(-this.angle)

    // // draw a rect
    // ctx.beginPath()
    // ctx.rect(
    //   -this.width / 2,
    //   -this.height / 2,
    //   this.width,
    //   this.height
    // )
    // ctx.fill()
    // ctx.restore()

    if (this.damaged) {
      ctx.fillStyle = "gray"
    } else {
      ctx.fillStyle = color
    }
    ctx.beginPath()
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y)
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
    }
    ctx.fill()

    if (this.sensor) {
      this.sensor.draw(ctx)
    }
  }
}
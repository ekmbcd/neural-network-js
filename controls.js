class Controls{
  constructor(type) {
    this.rigth = false 
    this.left = false 
    this.forward = false 
    this.reverse = false 

    switch (type){
      case "KEYS":
        this.#addKeyboardListeners()
        break
      case "DUMMY":
        this.forward = true
        break
    }
  }

  #addKeyboardListeners() {
    document.onkeydown = event => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = true
          break
        case "ArrowRight":
          this.rigth = true
          break
        case "ArrowUp":
          this.forward = true
          break
        case "ArrowDown":
          this.reverse = true
          break
      }
    }

    document.onkeyup = event => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = false
          break
        case "ArrowRight":
          this.rigth = false
          break
        case "ArrowUp":
          this.forward = false
          break
        case "ArrowDown":
          this.reverse = false
          break
      }
    }
  }
}
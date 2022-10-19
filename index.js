var red = document.querySelector('.crt')
var counter = new Date()

function setProperty(duration) {
  red.style.setProperty('--animation-time', duration + 's')
}

function changeAnimationTime() {
  var animationDuration =
    (Math.random() + 1.5) / Math.max(((new Date() - counter) / 10000) * 2, 1)
  setProperty(animationDuration)
}

var animationInterval = setInterval(changeAnimationTime, 1000)

function toggleAnimation() {
  if (animationInterval) {
    setProperty(1_000_000_000)
    clearInterval(animationInterval)
    animationInterval = 0
  } else {
    counter = new Date()
    setProperty(1.73)
    animationInterval = setInterval(changeAnimationTime, 1000)
  }
}

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

setInterval(changeAnimationTime, 1000)

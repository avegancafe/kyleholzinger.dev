var red = document.querySelector('.crt')

function setProperty(duration) {
  red.style.setProperty('--animation-time', duration + 's')
}

function changeAnimationTime() {
  var animationDuration = Math.random() + 1.5
  setProperty(animationDuration)
}

setInterval(changeAnimationTime, 1000)

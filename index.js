var el = document.querySelector('.crt')
var counter = new Date()

function setAnimationTime(duration) {
  el.style.setProperty('--animation-time', duration + 's')
}

function changeAnimationTime() {
  var animationDuration =
    (Math.random() + 1.5) / Math.max(((new Date() - counter) / 10000) * 2, 1)
  setAnimationTime(animationDuration)
}

var animationInterval

function startAnimationInterval() {
  animationInterval = setInterval(changeAnimationTime, 1000)
}

startAnimationInterval()

function toggleAnimation() {
  if (el.style.webkitAnimationPlayState != 'paused') {
    el.style.webkitAnimationPlayState = 'paused'
    el.style.mozAnimationPlayState = 'paused'
    el.style.animationPlayState = 'paused'

    clearInterval(animationInterval)
  } else {
    counter = new Date()
    el.style.webkitAnimationPlayState = 'running'
    el.style.mozAnimationPlayState = 'running'
    el.style.animationPlayState = 'running'

		startAnimationInterval()
  }
}
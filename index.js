const el = document.querySelector('.crt')
let counter = new Date()

function setAnimationTime(duration) {
  el.style.setProperty('--animation-time', duration + 's')
}

function changeAnimationTime() {
  var animationDuration =
    (Math.random() + 1.5) / Math.max(((new Date() - counter) / 100000) * 2, 1)
  setAnimationTime(animationDuration)
}

var animationInterval

function startAnimationInterval() {
  animationInterval = setInterval(changeAnimationTime, 1000)
}

startAnimationInterval()

function toggleAnimation(e) {
  e.stopPropagation()
  e.preventDefault()
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

const links = document.querySelectorAll('.stabilizer')

for (let link of links) {
  link.onclick = toggleAnimation
}
const iSpeed = 10
const iScrollAt = 20
const destination = document.getElementById('typedtext')

function write() {
  let iIndex = 0
  let iArrLength = aText[0].text.length
  let iTextPos = 0
  let sContents = ''
  let iRow

  function typewriter() {
    sContents = ' '
    iRow = Math.max(0, iIndex - iScrollAt)

    while (iRow < iIndex) {
      const { text, elType } = aText[iRow]
      sContents += `<${elType}>${text}</${elType}>` + '\n'
      iRow++
    }

    const { text, elType } = aText[iRow]

    if (iIndex == aText.length - 1) {
      destination.innerHTML =
        sContents + `<${elType}>${text.substring(0, iTextPos)}</${elType}>`
    } else {
      destination.innerHTML =
        sContents + `<${elType}>${text.substring(0, iTextPos)}_</${elType}>`
    }

    if (iTextPos++ == iArrLength) {
      iTextPos = 0
      iIndex++
      if (iIndex != aText.length) {
        iArrLength = aText[iIndex].text.length
        setTimeout(typewriter, 500)
      }
    } else {
      if (
        text.substring(0, iTextPos).slice(-1)[0] == ' ' &&
        text.substring(0, iTextPos).slice(-3, -1).indexOf(' ') == -1
      ) {
        setTimeout(typewriter, iSpeed + Math.random() * 60)
      } else {
        setTimeout(typewriter, iSpeed + Math.random() * 10)
      }
    }
  }

  typewriter()
}

let aText
if (content && destination) {
  aText = Array.from(content.children).map((x) => ({
    text: x.innerText,
    elType: x.tagName,
  }))
  content.remove()

  write()
}

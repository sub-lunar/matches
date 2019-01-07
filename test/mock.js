import test from 'ava'
import jsdom from 'jsdom'
import SandboxedModule from 'sandboxed-module'

// mock up before import
const dom = new jsdom.JSDOM(`

<!DOCTYPE html>
<html>
  <body>

    <!-- A List like in the README Example -->

    <ul class="my-list">
      <li class="my-list__item">
        <img class="my-list__image" src="" alt="" />
        <a class="my-list__link" href="/">Click me</a>
      </li>
      <li class="my-list__item">
        <img class="my-list__image" src="" alt="" />
        <a class="my-list__link" href="/">Click me</a>
      </li>
      <li class="my-list__item">
        <img class="my-list__image" src="" alt="" />
        <a class="my-list__link" href="/">Click me</a>
      </li>
    </ul>

    <!-- An example with nested divs to show a non-match -->

    <div class="wrapper">
      <div class="want-to-match">
        <div class="click-me">
        </div>
      </div>
      <div class="match-me-not">
        <div class="click-me">
        </div>
      </div>
    </div>

  </body>
</html>
`)

const document = dom.window.document

// also a function to trigger events, copied from StackOverflow
// https://stackoverflow.com/a/2706236/3254410
function eventFire(el, etype) {
  if (el.fireEvent) {
    el.fireEvent('on' + etype)
  } else {
    var evObj = document.createEvent('Events')
    evObj.initEvent(etype, true, false)
    el.dispatchEvent(evObj)
  }
}

const matches = SandboxedModule.require('../dist/matches', {
  globals: { document },
})

test('matches if target is child', t => {
  t.plan(9) // from outer space

  const myList = document.querySelector('.my-list')

  let numberMatches = 0
  let lastMatch = null

  myList.addEventListener('click', event => {
    const match = matches(event.target, '.my-list__item')
    if (match) {
      numberMatches++
      lastMatch = match
    }
  })

  const links = document.querySelectorAll('.my-list__link')

  // second link first, just for fun
  eventFire(links[1], 'click')

  t.is(numberMatches, 1)
  t.is(lastMatch.className, 'my-list__item')
  t.is(lastMatch.tagName, 'LI')

  lastMatch = null

  // then first one
  eventFire(links[0], 'click')

  t.is(numberMatches, 2)
  t.is(lastMatch.className, 'my-list__item')
  t.is(lastMatch.tagName, 'LI')

  lastMatch = null

  // then last one
  eventFire(links[2], 'click')

  t.is(numberMatches, 3)
  t.is(lastMatch.className, 'my-list__item')
  t.is(lastMatch.tagName, 'LI')
})

test('matches if target matches selector directly', t => {
  t.plan(9)

  const myList = document.querySelector('.my-list')

  let numberMatches = 0
  let lastMatch = null

  myList.addEventListener('click', event => {
    const match = matches(event.target, '.my-list__item')
    if (match) {
      numberMatches++
      lastMatch = match
    }
  })

  const items = document.querySelectorAll('.my-list__item')

  eventFire(items[2], 'click')

  t.is(numberMatches, 1)
  t.is(lastMatch.className, 'my-list__item')
  t.is(lastMatch.tagName, 'LI')

  lastMatch = null

  eventFire(items[1], 'click')

  t.is(numberMatches, 2)
  t.is(lastMatch.className, 'my-list__item')
  t.is(lastMatch.tagName, 'LI')

  lastMatch = null

  eventFire(items[0], 'click')

  t.is(numberMatches, 3)
  t.is(lastMatch.className, 'my-list__item')
  t.is(lastMatch.tagName, 'LI')
})

test('matches and non-matches', t => {
  t.plan(10)

  const wrapper = document.querySelector('.wrapper')
  const wantToMatch = document.querySelector('.want-to-match')
  const matchMeNot = document.querySelector('.match-me-not')
  const clickMes = document.querySelectorAll('.click-me')

  let numberMatches = 0
  let lastMatch = null

  wrapper.addEventListener('click', ({ target }) => {
    const match = matches(target, 'div.want-to-match')

    if (match) {
      numberMatches++
      lastMatch = match
    }
  })

  eventFire(clickMes[0], 'click')

  t.is(numberMatches, 1)
  t.is(lastMatch, wantToMatch)

  lastMatch = null

  eventFire(clickMes[1], 'click')

  t.is(numberMatches, 1)
  t.is(lastMatch, null)

  eventFire(wantToMatch, 'click')

  t.is(numberMatches, 2)
  t.is(lastMatch, wantToMatch)

  lastMatch = null

  eventFire(matchMeNot, 'click')

  t.is(numberMatches, 2)
  t.is(lastMatch, null)

  eventFire(wrapper, 'click')

  t.is(numberMatches, 2)
  t.is(lastMatch, null)
})

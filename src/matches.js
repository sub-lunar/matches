/**
 * A matches function that climbs up the document tree,
 * kind of like what gator.js does.
 *
 * Author: Emanuel Tannert <post@etannert.de>
 * Repository: https://github.com/sub-lunar/match
 *
 * This is useful for event delegation. Example:
 * You have a list with many items and want to
 * listen for clicks on a list item. Instead of
 * attaching an eventListener on each and every
 * list item, you just attach one eventListener
 * on the whole list, which is more efficient,
 * because click events bubble up. Now you want
 * to detect wether a click was on a list item
 * or just on whitespace within the list. The
 * problem is that your list items have nested
 * child elements, and if the user clicks on one
 * of them, the browser gives you that nested
 * child as the event.target instead of the list
 * item. So you need a way to find out wether
 * your event.target or any of its parent elements
 * match a certain selector. This is what this
 * bubbling match function is for.
 *
 * Maybe you know gator.js; it does exactly that.
 * But it also registers the eventListener for you
 * and it sneaks in the matched element as this
 * into your callback function instead of using
 * a regular argument, which is kind of weird and
 * you can't for example use an ES6 arrow function
 * as a callback if you need the element.
 * This module is much more basic than gator.js.
 * It just exports a match function that you call
 * with the event.target (or any other element)
 * and a selector string and it returns you the
 * matched element, if any, or null.
 * Note that it doesn't actually implement a matches
 * method. If it doesn't find one in the browser,
 * it throws an error, so you may want to use an
 * element.matches polyfill if you are targeting
 * legacy browsers.
 *
 * Code Example:
 *
 * import matches from '@sub-lunar/matches'
 *
 * const list = document.querySelector('.my-list')
 *
 * list.addEventListener('click', event => {
 *
 *   if (matches(event.target, '.my-list__item')) {
 *     console.log('click inside list item')
 *   } else {
 *     console.log('click on whitespace')
 *   }
 * })
 */
if (typeof window !== 'undefined') {
  const matchMethod = getMatchMethod()

  module.exports = function matches (element, selector) {
    while (element.tagName !== 'HTML' && element.tagName !== 'html') {
      if (element[matchMethod](selector)) {
        return element
      }
      if (!element.parentNode) {
        return null
      }
      element = element.parentNode
    }
    return null
  }
  
  function getMatchMethod () {
    const body = document.body
    const methods = [
      'matches',
      'matchesSelector',
      'mozMatchesSelector',
      'webkitMatchesSelector',
      'msMatchesSelector',
    ]
    for (let i = 0; i < methods.length; i++) {
      if (Object.prototype.toString.call(body[methods[i]])
          === '[object Function]') {
        return methods[i]
      }
    }
    throw new Error('No matches or similiar method found on document.body')
  }
}

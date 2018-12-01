'use strict'

import { factory } from '../../utils/factory'

const name = 'parser'
const dependencies = ['typed', 'math', 'expression.Parser']

export const createParser = /* #__PURE__ */ factory(name, dependencies, ({ typed, math, expression: { Parser } }) => {
  /**
   * Create a parser. The function creates a new `math.expression.Parser` object.
   *
   * Syntax:
   *
   *    math.parser()
   *
   * Examples:
   *
   *     const parser = new math.parser()
   *
   *     // evaluate expressions
   *     const a = parser.eval('sqrt(3^2 + 4^2)') // 5
   *     const b = parser.eval('sqrt(-4)')        // 2i
   *     const c = parser.eval('2 inch in cm')    // 5.08 cm
   *     const d = parser.eval('cos(45 deg)')     // 0.7071067811865476
   *
   *     // define variables and functions
   *     parser.eval('x = 7 / 2')                 // 3.5
   *     parser.eval('x + 3')                     // 6.5
   *     parser.eval('function f(x, y) = x^y')    // f(x, y)
   *     parser.eval('f(2, 3)')                   // 8
   *
   *     // get and set variables and functions
   *     const x = parser.get('x')                // 7
   *     const f = parser.get('f')                // function
   *     const g = f(3, 2)                        // 9
   *     parser.set('h', 500)
   *     const i = parser.eval('h / 2')           // 250
   *     parser.set('hello', function (name) {
   *       return 'hello, ' + name + '!'
   *     })
   *     parser.eval('hello("user")')           // "hello, user!"
   *
   *     // clear defined functions and variables
   *     parser.clear()
   *
   * See also:
   *
   *    eval, compile, parse
   *
   * @return {Parser} Parser
   */
  return typed(name, {
    '': function () {
      return new Parser(math)
    }
  })
})

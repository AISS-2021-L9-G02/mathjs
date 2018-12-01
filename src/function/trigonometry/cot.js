'use strict'

import { factory } from '../../utils/factory'
import { deepMap } from '../../utils/collection'

const name = 'cot'
const dependencies = ['typed', 'type.BigNumber', 'type.Unit']

export const createCot = /* #__PURE__ */ factory(name, dependencies, ({ typed, type: { BigNumber, Unit } }) => {
  /**
   * Calculate the cotangent of a value. Defined as `cot(x) = 1 / tan(x)`.
   *
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.cot(x)
   *
   * Examples:
   *
   *    math.cot(2)      // returns number -0.45765755436028577
   *    1 / math.tan(2)  // returns number -0.45765755436028577
   *
   * See also:
   *
   *    tan, sec, csc
   *
   * @param {number | Complex | Unit | Array | Matrix} x  Function input
   * @return {number | Complex | Array | Matrix} Cotangent of x
   */
  const cot = typed(name, {
    'number': function (x) {
      return 1 / Math.tan(x)
    },

    'Complex': function (x) {
      return x.cot()
    },

    'BigNumber': function (x) {
      return new BigNumber(1).div(x.tan())
    },

    'Unit': function (x) {
      if (!x.hasBase(Unit.BASE_UNITS.ANGLE)) {
        throw new TypeError('Unit in function cot is no angle')
      }
      return cot(x.value)
    },

    'Array | Matrix': function (x) {
      return deepMap(x, cot)
    }
  })

  return cot
})

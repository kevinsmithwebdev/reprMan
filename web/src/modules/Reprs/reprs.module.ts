/* eslint-disable no-useless-constructor */
import reprs1Fix from '../../state/reprs/__FIXTURES__/reprs1'

import { Reprs } from './reprs.types'

class ReprsModule {
  private static instance: ReprsModule

  private _reprs: Reprs = reprs1Fix

  get reprs() {
    return this._reprs
  }

  // eslint-disable-next-line no-empty-function
  private constructor() {}

  public static getInstance(): ReprsModule {
    if (!ReprsModule.instance) {
      ReprsModule.instance = new ReprsModule()
    }

    return ReprsModule.instance
  }
}

export default ReprsModule.getInstance()

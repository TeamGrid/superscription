import { _ } from 'meteor/underscore'
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { ReactiveVar } from 'meteor/reactive-var'

export class Superscription {
  constructor(name, ...args) {
    const opts = _.isString(name) ? { name, args } : name

    this.options = _.defaults(opts, {
      connection: Meteor.connection,
    })

    this.subscription = this.options.connection.subscribe.apply(
      this.options.connection,
      [this.options.name].concat(this.options.args)
    )

    this.subscriptionId = this.subscription.subscriptionId

    this._readyCallbacks = []
    this._allReadyCallbacks = []
    this._readyAutorunCallbacks = []
    this._isReady = new ReactiveVar(false)
    this._areAllReady = new ReactiveVar(false)
    this._subs = new ReactiveVar({})

    Tracker.autorun(() => {
      if (this.subscription.ready()) {
        this._readyCallbacks.forEach((fn) => Tracker.nonreactive(() => fn.call(this)))
        this._readyAutorunCallbacks.forEach((fn) => Tracker.autorun((computation) => {
          const sub = fn.call(this, this._registerSubscription.bind(this), computation)
          if (sub && sub.subscriptionId) this._registerSubscription(sub, computation)
        }))
      }
      this._isReady.set(this.subscription.ready())
    })

    Tracker.autorun(() => {
      this._areAllReady.set(this.isReady() && _.every(_.values(this._subs.get())))
    })

    Tracker.autorun(() => {
      if (this.areAllReady()) {
        this._allReadyCallbacks.forEach((fn) => Tracker.nonreactive(() => fn.call(this)))
      }
    })
  }

  _registerSubscription(sub, computation) {
    if (computation) {
      computation.onInvalidate(() => {
        const current = this._subs.get()
        if (!current[sub.subscriptionId]) {
          delete current[sub.subscriptionId]
          this._subs.set(current)
        }
      })
    }
    const current = Tracker.nonreactive(() => this._subs.get())
    const ready = sub.areAllReady ? sub.areAllReady() : sub.ready()
    if (current[sub.subscriptionId] !== ready) {
      current[sub.subscriptionId] = ready
      this._subs.set(current)
    }
  }

  isReady() { return this._isReady.get() }
  areAllReady() { return this._areAllReady.get() }

  ready(fn) {
    this._readyCallbacks.push(fn)
    return this
  }

  allReady(fn) {
    this._allReadyCallbacks.push(fn)
  }

  autorunReady(fn) {
    this._readyAutorunCallbacks.push(fn)
    return this
  }

}

export function superscribe(...args) {
  return new Superscription(...args)
  // return new (Function.prototype.bind.apply(Superscription, [null].concat(args)));
}

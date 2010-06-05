var stately = exports
  , sys = require ("sys")
  , EventEmitter = require ('events').EventEmitter
  
stately.define = function (callback) {
  var machine = new EventEmitter ()
    , privateState = null
    , validTransition = function (from, to) {
      var allowedTransitions = machine.transitions[from]
      if (from === to) return true
      else if (typeof allowedTransitions === 'undefined')
        machine.emit('error', new Error ("attempting to transition from unknown state: " + from))
      else if (typeof allowedTransitions === 'string') return to === allowedTransitions
      else return allowedTransitions.indexOf(to) > -1
    }

  machine.transition = function (desiredState) {
    var stateBefore = privateState
    if (validTransition (privateState, desiredState)) {
      machine.emit ('beforeTransition', privateState, desiredState)
      machine.emit ('beforeTransition:' + privateState + ":" + desiredState)
      machine.emit ('beforeExit:' + privateState)
      machine.emit ('beforeEnter:' + desiredState)
      privateState = desiredState
      machine.emit ('afterExit:' + stateBefore)
      machine.emit ('afterEnter:' + desiredState)
      machine.emit ('afterTransition:' + stateBefore + ":" + desiredState)
      machine.emit ('afterTransition', stateBefore, desiredState)
      return true
    } else {
      machine.emit ('illegalTransition', privateState, desiredState)
      machine.emit ('illegalTransition:' + privateState + ':' + desiredState)
      return false
    }
  }
  
  'illegalTransition beforeTransition afterTransition'.split(" ").forEach (function (evt) {
    machine [evt] = function () {
      if (arguments.length === 1) machine.addListener (evt, arguments [0])
      else machine.addListener (evt + ":" + arguments [0] + ":" + arguments [1], arguments [2])
    }
  })

  'beforeExit beforeEnter afterExit afterEnter'.split(" ").forEach (function (evt) {
    machine [evt] = function (state, fn) { machine.addListener (evt + ":" + state, fn) }
  })
  
  machine.start = function () {
    privateState = machine.startState
    return true
  }

  machine.__defineSetter__ ("state", function (desiredState) { machine.transition (desiredState) })
  machine.__defineGetter__ ("state", function () { return privateState })

  callback (machine)
  
  return machine
}

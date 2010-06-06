var stately = require ("./stately")
  , assert = require ("assert")
  , sys = require ('sys')


machine = stately.define (function (s) {
    s.startState = "off"

    s.transitions =
      { off: "neutral"
      , neutral: [ "off", "forward", "reverse", "stall" ]
      , forward: [ "neutral", "stall" ]
      , reverse: [ "neutral", "stall" ]
      , stall: "off"
      }

    s.beforeTransition ('off', 'neutral', function () { sys.puts ("starting engine") })
    s.beforeEnter ('stall', function () {sys.puts ("stalled out")})
    s.beforeExit ('stall', function () {sys.puts ("starting again")})


    s.beforeTransition (function (from, to) {
      sys.puts ("\n\ntransitioning from "+from+" to "+to+".")
    })

    s.afterTransition (function (from, to) {
      sys.puts ("successfully transitioned from "+from+" to "+to+".")
    })

    s.illegalTransition (function (from, to) {
      sys.puts ("\n\ncannot transition from " + from + " to " + to + "!")
      sys.puts ("Stalling...")
      s.state = 'stall'
    })
  })


assert.ok (machine.start ())
machine.state = 'neutral'
assert.equal ('neutral', machine.state)
assert.ok (machine.transition ('forward'))
assert.equal (false, machine.transition ('reverse')) //stdout: 'cannot transition from forward to reverse! \n stalled out'
assert.equal ('stall', machine.state)

//setters are pretty cool
machine.state = 'forward' //stdout: 'cannot transition from stall to forward'
assert.equal ('stall', machine.state)
machine.state = 'off'
machine.state = 'neutral'
machine.state = 'forward'
assert.equal ('forward', machine.state)
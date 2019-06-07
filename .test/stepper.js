"use module"
import tape from "tape"
import delay from "delay"
import immediate from "p-immediate"

//import readRolling from "async-iter-read/rolling.js"
import readFixed from "async-iter-read/fixed.js"
import Stepper from "../stepper.js"

tape( "can step by step through", async function( t){
	t.plan(7)
	const
	  VALS= [ 4, 2, 42],
	  gen= (async function*(){ yield*VALS})(),
	  stepper= new Stepper( gen),
	  readStepper= readFixed( stepper, 4)
	await delay( 3)
	t.equal( readStepper.complete, 0)
	for( const [i, val] of VALS.entries()){
		stepper.step()
		await delay( 3)
		t.equal( readStepper.complete, i+ 1)
		await Promise.resolve( readStepper.reads[ i]).then( function( read){
			t.equal( read, val)
		})
	}
	t.end()
})

tape( "can step multiple steps", async function( t){
	const
	  VALS= [ 4, 2, 42, 24, 424],
	  gen= (async function*(){ yield*VALS})(),
	  stepper= new Stepper( gen),
	  r4= stepper.next(),
	  r2= stepper.next(),
	  r42= stepper.next()

	let
	  step4= false,
	  step42= false,
	  step424= false
	async function makeTest( promise, n, tooSoon, set){
		const v= await promise
		if( tooSoon()){
			return t.fail( "saw progress without a step: "+ v.value)
		}
		t.equal( v.value, n)
		set( v)
	}
	makeTest( r4, 4, ()=> step4=== false, v=> step4= v.value)
	makeTest( r42, 42, ()=> step42=== false, v=> step42= v.value)
	//await immediate()
	await delay( 2)

	step4= true // about to make this legitemately true
	await stepper.step( 2)
	//await immediate()
	await delay( 2)
	t.equal( step4, 4, "got 4")
	t.equal( step42, false, "not yet 42")

	step42= true
	await stepper.step( 10) // overshoot

	// sample end late
	const
	  r424= stepper.next(),
	  rNo= stepper.next()
	step424= true
	makeTest( r424, 424, ()=> step424=== false, v=> step424= v)

	await delay( 2)
	t.equal( step42, 42, "got r42")
	t.equal( step424, 42, "got r42")

	t.end()
})

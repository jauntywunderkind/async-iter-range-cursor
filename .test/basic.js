"use module"
import tape from "tape"
import delay from "delay"

import Range from "../range.js"

tape( "step to end", async function( t){
	let touched= false
	const
	  range= new Range( 2),
	  r0= range.next(),
	  r1= range.next(),
	  ra0= range.next(),
	  ra1= range.next()
	ra0.then(()=> touched= true)
	ra1.then(()=> touched= true)

	await range.step( 2)
	await delay( 3)
	t.equal(( await r0).value, 0)
	t.equal(( await r1).value, 1)
	t.equal( touched, false, "has not terminated")
	t.end()
})

tape( "step into end", async function( t){
	const
	  range= new Range( 2),
	  r0= range.next(),
	  r1= range.next(),
	  ra0= range.next(),
	  ra1= range.next()
	range.step( 3)
	await delay( 3)
	t.equal(( await r0).value, 0)
	t.equal(( await r1).value, 1)
	t.equal(( await ra0).value, 0)
	t.equal(( await ra1).value, 0)
	t.end()
})

tape( "manual end without delay", async function( t){
	let touched= false
	const
	  range= new Range( 2),
	  r0= range.next(),
	  r1= range.next(),
	  ra0= range.next(),
	  ra1= range.next()
	ra0.then(()=> touched= true)
	ra1.then(()=> touched= true)

	range.step( 2)
	range.end()
	await delay( 3)

	t.equal(( await r0).value, 0)
	t.equal(( await r1).value, 1)
	t.equal(( await ra0).value, 0)
	t.equal(( await ra1).value, 0)
	t.equal( touched, true, "has terminated")
	t.end()
})

tape( "manual end with delay", async function( t){
	let touched= false
	const
	  range= new Range( 2),
	  r0= range.next(),
	  r1= range.next(),
	  ra0= range.next(),
	  ra1= range.next()
	ra0.then(()=> touched= true)
	ra1.then(()=> touched= true)

	range.step( 2)
	await delay( 3)
	range.end()
	await delay( 3)

	t.equal(( await r0).value, 0)
	t.equal(( await r1).value, 1)
	t.equal(( await ra0).value, 0)
	t.equal(( await ra1).value, 0)
	t.equal( touched, true, "has terminated")
	t.end()
})

tape( "basic consume first", async function( t){
	const
	  r= new Range( 5),
	  r0= r.next(),
	  r1= r.next(),
	  r2= r.next(),
	  r3= r.next(),
	  r4= r.next(),
	  ra0= r.next(),
	  ra1= r.next(),
	  ra2= r.next()

	let agg= 0;
	[ r0, r1, r2, r3, r4, ra0, ra1].forEach( async function add( val){
		val= Number.parseInt(( await val).value)
		agg+= val
	})

	await delay( 3)
	t.equal( agg, 0, "no steps run")

	r.step( 2)
	await delay( 3)
	t.equal( agg, 1, "first step run") // 0 + 1

	r.step( 2)
	await delay( 3)
	t.equal( agg, 6, "second batch run") // + 2 + 3

	r.step( 0)
	await delay( 3)
	t.equal( agg, 6, "no steps run")

	r.step( 3)
	await delay( 3)
	t.equal( agg, 10, "finish range")

	t.end()
})

tape( "produce all first", async function( t){
	const range= new Range( 2)
	range.step( 3)

	t.equal(( await range.next()).value, 0)
	t.equal(( await range.next()).value, 1)
	const last= await range.next()
	t.equal( last.value, 0)
	t.equal( last.done, true)
	t.end()
})

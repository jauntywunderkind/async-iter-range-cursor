"use module"
import tape from "tape"
import delay from "delay"

import Range from "../range.js"

tape( "basic consume first", async function( t){
	const
	  r= new Range( 5),
	  r0= r.next(),
	  r1= r.next(),
	  r2= r.next(),
	  r3= r.next(),
	  r4= r.next(),
	  ra0= r.next(),
	  ra1= r.next()

	let agg= 0;
	[ r0, r1, r2, r3, r4, ra0, ra1].forEach( async function add( val){
		val= Number.parseInt(( await val).value)
		agg+= val
	})

	await delay( 3)
	t.equal( agg, 0, "no steps run")

	r.step( 1)
	await delay( 3)
	t.equal( agg, 0, "first step run")

	r.step( 2)
	await delay( 3)
	t.equal( agg, 3, "second batch run")

	r.step( 0)
	await delay( 3)
	t.equal( agg, 3, "no steps run")

	r.step( 2)
	await delay( 3)
	t.equal( agg, 10, "second batch run")

	r.step( 3)
	await delay( 3)
	t.equal( agg, 10, "all steps run")

	console.log({r0, r1, r2, r3, r4, ra0, ra1})
	t.end()
})

tape( "produce first", async function( t){
	t.end()
})

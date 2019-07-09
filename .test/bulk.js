"use module"
import tape from "tape"
import delay from "delay"

import Range from ".."

class DelayedRange extends Range{
	produce(){
		const
		  val= super.produce(),
		  n= Math.floor( Math.random() * 12) - 5
		return val
		if (n > 0){
			return delay( n).then(()=> val)
		}else{
			return val
		}
	}
}

tape( "test", async function( t){
	let current= 0
	const r= new DelayedRange()
	function accept( value){
		t.equal( value, current++)
	}

	let iters= 5
	let balance= 0	
	let reads= []
	async function getValue( x){
		return (await x).value
	}
	function read( n){
		for( let i= 0; i< n; ++i){
			reads.push( getValue( r.next()))
		}
	}
	while( --iters>= 0){
		const path= Math.floor( Math.random()* 3)
		let count= Math.floor( Math.random()* 5)+ 1
		if( path=== 0){
			r.step( count)
			read( count)
		}else if( path=== 1){
			if( balance< 0){
				// insure ahead by count
				count-= balance
			}
			balance+= count
			r.step( count)
		}else if( path=== 2){
			if( balance> 0){
				count+= balance
			}
			balance-= count
			read( count)
		}
		await delay(3)
	}
	if( balance< 0){
		r.step( -balance)
	}
	let found= await Promise.all( reads)
	for( let i= 0; i< found.length; ++i){
		t.equal( found[ i], i)
	}
	t.end()
}, { timeout: 10000})

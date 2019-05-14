"use module"
import tape from "tape"
import delay from "delay"

import Range from "../range.js"


class DelayedRange extends Range{
	produce(){
		const
		  val= super.produce(),
		  n= Math.floor( Math.random() * 12) - 5
		return val
		if (n > 0){
			console.log(`produce:${val[0]} n:${n}`)
			return delay( n).then(()=> val)
		}else{
			console.log(`produce:${val[0]}`)
			return val
		}
	}
}



tape( "test", async function( t){
	let current= 0
	const r= new DelayedRange()
	function accept( value){
		console.log( "accept", JSON.stringify({value}))
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
		let count= Math.floor( Math.random()* 5)
		console.log(JSON.stringify({count, path, balance}))
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
	console.log( "ok")
	console.log( await Promise.all(reads))
}, { timeout: 10000})

"use module"
import Deferrant from "deferrant"

export function range( max= Number.POSITIVE_INFINITY){
	async function *range(){
		while( true){
			if( range.queue.length){
				const val= range.queue.shift()
				yield val
			}else if( range.atEnd){
				return
			}else{
				range.waiting= Deferrant()
				await range.waiting
			}
		}
	}
	range.next= 0 // next value to enqueue
	range.queue= [] // values ready to be consumed
	range.waiting= null // defer if we need to wait for an enqueue
	range.enqueue= function( n= 1){
		while( !range.atEnd&& n> 0){
			--n
			const next= range.next++
			if( next>= max){
				console.log("enq-end")
				range.atEnd= true
			}else{
				console.log("enq-val", next)
				range.queue.push( next)
			}
		}
		if( range.waiting){
			console.log("enq-wake")
			range.waiting.resolve()
			range.waiting= undefined
		}
	}
	range.atEnd= false
	range.end= function(){
		range.atEnd= true
	}
	return range
}

"use module"
import Deferrant from "deferrant"


/**
* Like normal or operator `||`, but a value of `0` or `false` wont fall through
*/
const orUndefined( ...args){
	for( const arg of args){
		if( arg!== undefined){
			return arg
		}
	}
}

/**
* Produce an async iterator that
*/
export function Range( arg= Number.POSITIVE_INFINITY){
	const
	  begin= orUndefined( arg.begin, 0),
	  end= orUndefined( arg.constructor=== Number&& arg, arg.start)

	async function *range(){
		while( !range.atEnd){
			if( range.queue.length){
				const val= range.queue.shift()
				yield val
			}else{
				range.waiting= Deferrant()
				await range.waiting
			}
		}
	}
	range.next= begin // next value to enqueue
	range.queue= [] // values ready to be consumed
	range.waiting= null // defer if we need to wait for an enqueue
	range.enqueue= function( n= 1){
		while( !range.atEnd&& n> 0){
			--n
			const next= range.next++
			if( next>= end){
				range.atEnd= true
			}else{
				range.queue.push( next)
			}
		}
		if( range.waiting){
			range.waiting.resolve()
			range.waiting= null
		}
	}
	range.atEnd= false
	range.end= function(){
		range.atEnd= true
	}
	return range()
}
export {
  Range as range
}
export default range

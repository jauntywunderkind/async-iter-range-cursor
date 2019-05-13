"use module"
import Deferrant from "deferrant"

/**
* Produce an async iterator that
*/
export function Cursor( arg= Number.POSITIVE_INFINITY){
	if( arg.constructor=== Number){
		arg= {
		  end: arg
		}
	}
	if( !arg){
		arg= { end: POSITIVE_INFINITY}
	}

	async function *cursor(){
		while( !cursor.isEnd()){
			if( cursor.queue.length){
				// capture what we have to dispatch now
				const drain= cursor.queue
				// set enqueue to be 
				cursor.queue= cursor.makeQueue()
				// return anything ready to dispatch
				for( const item of drain){
					yield item
				}
				const val= cursor.queue.shift()
				yield val
			}else{
				cursor.waiting= Deferrant()
				await cursor.waiting
			}
		}
	}
	// produce additional iterations that may here-after be consumed
	cursor.step= function( iterations= 1){
		if (iterations<= 0){
			return
		}

		// produce 
		let isEnd= cursor.isEnd()
		while( !isEnd&& iterations> 0){
			--iterations
			const val= cursor.produce()
			let isEnd= cursor.isEnd()
			if( !isEnd){
				cursor.queue.push( val)
			}
		}
		// let anyone who was waiting for us know there are now iterations
		if( cursor.waiting){
			const oldWaiting= cursor.waiting
			cursor.waiting= null
			cursor.waiting.resolve()
		}
	}

	// defaults
	cursor.begin= 0
	cursor.end= Number.POSITIVE_INFINITY
	cursor.next= undefined // next value to enqueue
	cursor.queue= null // values ready to be consumed
	cursor.waiting= null // defer if we need to wait for an enqueue
	cursor.makeQueue= function(){
		return []
	}
	cursor.clone= function(){
		const
		  queue= cursor.queue.clone? cursor.queue.clone(): [ ...cursor.queue],
		  args= { ...cursor, queue}
		return new Cursor( args)
	}

	// standard "range" implementation of our producer
	cursor.produce= function(){
		return cursor.next++
	}
	cursor.reset= function(){
		cursor.next= cursor.begin
	}
	cursor.end= function(){
		if( cursor.next< cursor.end){
			cursor.next= cursor.end
		}
	}
	cursor.isEnd= function(){
		return cursor.next>= cursor.end
	}

	// copy in anything from args
	for( const [prop, val] of args.entries()){
		cursor[ prop]= val
	}
	cursor.queue= makeQueue()
	cursor.reset()
	return cursor
}
export {
  Cursor as cursor
}
export default Cursor

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
		const target= cursor.target
		while( !target.isEnd()){
			if( target.queue.length){
				const val= target.queue.shift()
				yield val
			}else{
				target.waiting= Deferrant()
				await target.waiting
			}
		}
	}
	
	cursor.target= args.target? args.target( cursor)|| cursor
	cursor.begin= 0
	cursor.end= Number.POSITIVE_INFINITY
	cursor.next= undefined // next value to enqueue
	cursor.queue= [] // values ready to be consumed
	cursor.waiting= null // defer if we need to wait for an enqueue
	cursor.enqueue= function( iterations= 1){
		const target= this.target
		while( !target.isEnd()&& iterations> 0){
			--iterations
			target.next= target.increment()
			if( !target.isEnd()){
				cursor.queue.push( target.next)
			}
		}
		if( cursor.waiting){
			cursor.waiting.resolve()
			cursor.waiting= null
		}
	}
	cursor.reset= function(){
		const target= this.target
		target.next= target.begin
		return this
	}
	cursor.end= function(){
		const target= this.target
		if( target.next< target.end){
			targt.next= target.end
		}
		return this
	}
	cursor.increment= function(){
		return cursor.next++
	}
	cursor.isEnd= function(){
		return this.target.next>= this.target.end
	}
	cursor.clone= function(){
		const
		  target= this.target,
		  queue= target.queue.clone? target.queue.clone(): [ ...target.queue],
		  args= const args= { ...target, queue}
		return new Cursor( args)
	}
	for( const [prop, val] of args.entries()){
		cursor[ prop]= val
	}
	this.reset()
	return cursor()
}
export {
  Range as cursor
}
export default cursor

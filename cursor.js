"use module"
import Deferrant from "deferrant"

export const
  $next= Symbol.for("cursor:next")

export class Cursor{
	constructor( args){
		// iterator state
		this.value= null
		this.done= false

		// state flags
		this.running= false // whether next is running
		this.over= false // whether underlying producer has finished
		// state
		this.taken= null // iterator for currently consuming
		this.queue= null // to be consumed queued here
		this.head= null // next 'next' here
		this.tail= null // last 'next' here
		return this
	}

	async next(){
		if( this.done){
			return this
		}

		if( this.running){
			// set ourselves up on tail
			const
			  oldTail= this.tail,
			  newTail= this.tail= Deferrant()
			if( oldTail){
				// add to chain
				oldTail[ $next]= newTail
			}else{
				// this is the start of the chain
				this.head= newTail
			}

			// wait for our turn
			await newTail
		}

		while( true){
			if( this.done){
				return this
			}
			// signal that we are trying to read a value
			this.running= true

			// get the next batch
			if( !this.taken){
				this.taken= this._take()
			}
			// mark that we are doing async resolution & resolve
			if( this.taken&& this.taken.then){
				this.taken= await this.taken
			}
			// batch failed
			if( !this.taken){
				// more has become available while we worked
				if( this._peek()){
					continue
				}
				// no more ever expected
				if( this.over){
					this.running= false
					// this will transition us to done
					return this.end()
				}
				// wait for signal if there is nothing to take now
				this.takeWait= Deferrant()
				await this.takeWait
				continue
			}

			// get the value
			let next= this.taken.next()
			if( next.then){
				next= await next
			}
			// take again if done
			if( next.done){
				this.taken= null
				continue
			}

			// advance chain
			this.value= next.value
			this.running= false
			if( this.head){
				const
				  oldHead= this.head,
				  nextHead= this.head= oldHead[ $next]
				if( !nextHead){
					this.tail= null
				}
				oldHead.resolve()
			}
			return next
		}
	}

	async step( iterations= 1){
		// produce 
		while( !this.over&& !this.done&& iterations> 0){
			--iterations
			// produce next value
			let produced= this._produce()
			if( produced.then){
				produced= await produced
			}
			const { value, done}= produced
			if( done){
				// no more entries expected
				this.end()
				break
			}
			// enqueue next value
			this._enqueue( value)
		}
		// let anyone who was waiting for us know there are now iterations
		if( this.takeWait){
			const oldWait= this.takeWait
			this.takeWait= null
			oldWait.resolve()
		}
		return this
	}

	_produce(){
		throw new Error("virtual method; not implemented")
	}
	end(){
		if( !this.done){
			if( this.running|| this.taken|| this._peek()){
				// indicate not to wait for more takes
				this.over= true
				// wake the running
				if( this.takeWait){
					this.takeWait.resolve()
				}
			}else{
				// done for real
				this.done= true
				if( this._final){
					this.value= this._final()
				}
				// clean up outstanding
				this.over= false
				this.tail= null
				while( this.head){
					this.head.resolve()
					this.head= this.head[ $next]
				}
			}
		}
		return this
	}

	[ Symbol.asyncIterator](){
		return this
	}
	/**
	* Internal method to add an item to be taken
	* @internal
	*/
	_enqueue( val){
		const queue= this.queue|| (this.queue= [])
		queue.push( val)
	}
	/**
	* Internal method to take all queued items
	* @internal
	*/
	_take(){
		const oldQueue= this.queue
		this.queue= null
		return oldQueue&& oldQueue[ Symbol.iterator]()
	}
	_peek(){
		return !!this.queue
	}
}
export {
  Cursor as cursor
}
export default Cursor

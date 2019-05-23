"use module"
import Deferrant from "deferrant"

export const
  $next= Symbol.for("cursor:next")

export class Cursor{
	constructor( args){
		// iterator state
		this.value= null
		this.done= false

		// internal state
		this.running= false // whether next is running
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
			// move head along
			this.head= newTail[ $next]
		}

		this.running= true
		while( true){
			if( this.done){
				return this
			}

			if( !this.taken){
				this.taken= this._take()
			}
			// resolve an async taken
			if( this.taken&& this.taken.then){
				this.taken= await this.taken
			}
			// wait for signal if there is nothing to take now
			if( !this.taken){
				this.takeWait= Deferrant()
				await this.takeWait
				continue
			}

			// get the value
			const next= await this.taken.next()
			// take again if done
			if( next.done){
				this.taken= null
				continue
			}

			// advance chain
			this.running= false
			if( this.head){
				const oldHead= this.head
				this.head= this.head[ $next]
				if( !this.head){
					this.tail= null
				}
				oldHead.resolve()
			}
			return next
		}
	}

	async step( iterations= 1){
		if (iterations<= 0){
			return
		}

		// produce 
		while( !this.over&& !this.done&& iterations> 0){
			--iterations
			// produce next value
			const [ value, done]= await this._produce()
			if( done){
				// no more
				this.over= true
				return
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
	}

	_produce(){
		throw new Error("virtual method; not implemented")
	}
	end(){
		this.value= null
		this.done= true
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
}
export {
  Cursor as cursor
}
export default Cursor

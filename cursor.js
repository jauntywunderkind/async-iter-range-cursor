"use module"
import Deferrant from "deferrant"

class Cursor{
	constructor( args){
		// iterator state
		this.value= null
		this.done= false

		// internal state
		this.over= false
		this.taken= null
		this.queue= null
		return this
	}
	async next(){
		while( true){
			if( this.done){
				// already done
				this.value= null
				return this
			}
			// taken is an iterator of draining things
			if( this.taken){
				const next= await this.taken.next()
				if( !next.done){
					// consumed something from a taken
					this.value= next.value
					return this
				}else if( this.over){
					// last has been taken
					this.done= true
				}
				// we tried but taken was already drained
				this.taken= null
				continue
			}


			if( !this.takeWait){
				// we have a chance of getting a take:
				this.taken= this._take()
				if( this.taken){
					// no one blocking us from consuming new take, do it
					continue
				}

				// nothing left to consume
				if( this.over){
					this.done= true
					continue
				}

				// we need to wait for take to have values:
				this.takeWait= new Deferrant()
			}
			// wait for take to be possible again
			await this.takeWait
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
			const [ value, done]= await this.produce()
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

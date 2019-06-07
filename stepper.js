"use module"
import Cursor from "./cursor.js"

class Stepper extends Cursor{
	constructor( wrappedIterator, args){
		super()

		// marshal args into an object
		if( args&& args.constructor=== Number){
			args= {
			  //end: args
			}
		}
		if( !args){
			args= {
			  //end: Number.POSITIVE_INFINITY
			}
		}

		// assign our 
		if( !wrappedIterator.next){
			const iteratorSymbol= wrappedIterator[ Symbol.asyncIterator]? Symbol.asyncIterator: Symbol.iterator
			wrappedIterator= wrappedIterator[ iteratorSymbol]()
		}
		this.wrappedIterator= wrappedIterator
		this.last= null
		return this
	}
	_produce(){
		this.last= this.wrappedIterator.next()
		return this.last
	}
	_final(){
		return this.last&& this.last.value
	}
}
export {
  Stepper as default,
  Stepper as stepper
}

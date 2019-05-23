"use module"
import Cursor from "./cursor.js"

class Range extends Cursor{
	constructor( args){
		super()

		// marshal args into an object
		if( args&& args.constructor=== Number){
			args= {
			  end: args
			}
		}
		if( !args){
			args= {
			  end: Number.POSITIVE_INFINITY
			}
		}

		// assign our range defaults
		this.begin= this.i= args.begin|| 0
		this.end= args.end
		return this
	}
	_produce(){
		const
		  value= this.i++,
		  done= value>= this.end
		return [ done? null: value, done]
	}
}
export {
  Range as range
}
export default Range

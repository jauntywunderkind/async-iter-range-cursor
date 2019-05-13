"use module"
import Cursor from "./cursor.js"

class Range extends Cursor{
	defaults( args){
		// run parent's defaults
		super.defaults.call( this, args)

		// marshal args into an object
		if( args.constructor=== Number){
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
	produce(){
		const
		  value= this.i++,
		  done= val>= this.end
		return [ done? null: value, done]
	}
}

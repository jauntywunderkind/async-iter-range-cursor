"use module"
import Cursor from "async-iter-cursor"

export class RangeCursor extends Cursor{
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
		this.last= args.end
		return this
	}
	_produce(){
		const
		  value= this.i++,
		  done= this.i> this.last
		return {
		  value: done? 0: value,
		  done
		}
	}
	_final(){
		return 0
	}
}
export {
  RangeCursor as default,
  RangeCursor as rangeCursor,
  RangeCursor as Cursor,
  RangeCursor as cursor,
  RangeCursor as Range,
  RangeCursor as range
}

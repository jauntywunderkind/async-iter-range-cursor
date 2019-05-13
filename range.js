"use module"
import Cursor from "./cursor.js"

class Range extends Cursor{
	static defaults( args){
		if( args.constructor=== Number){
			args= {
			  end: args
			}
		}
		if( !args){
			args= {
			  end: Number.POSITIVE_INFINITY)
			}
		}
		this.begin= args.begin|| 0
		this.end= args.end
	}
	defaults( args){
		this.constructor.defaults.call( this, args)
		return this
	}
	produce(){
		return this.next++
	}
	reset(){
		this.next= this.begin
		return this
	}
	end(){
		if( this.next< this.end){
			this.next= this.end
		}
		return this
	}
	isEnd(){
		return this.next>= this.end
	}
}

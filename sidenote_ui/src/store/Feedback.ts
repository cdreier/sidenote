import { action, makeObservable, observable } from 'mobx'
import { AjaxError } from 'rxjs/ajax'

interface Message {
  msg: string
}

class Feedback {

  @observable
  errors: string[] = []

  @observable
  messages: string[] = []

  constructor() {
    makeObservable(this)
  }

  @action
  addError(msg: string) {
    this.errors.push(msg)
    setTimeout(() => {
      this.errors.pop()
    }, 5000)
  }

  @action
  addMessage(msg: string) {
    this.messages.push(msg)
    setTimeout(() => {
      this.messages.pop()
    }, 2000)
  }

  errorOccured(err: AjaxError) {
    if (err.response.errors) {
      err.response.errors.forEach((e: Message) => this.addError(e.msg))
    } else {
      this.addError(`${err.status}: ${err.message}`)
      console.log('ERRR???', err)
    }
  }

}


export default Feedback
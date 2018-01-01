import { createStore } from 'redux'

const initial_state = {
  fetch_state: []
}

const reducers = (state=initial_state, action) => {
  switch (action.type) {
    case 'cache':
      console.log('action:', action)
      return state
    default:
      return state
  }
}

export default createStore(reducers)

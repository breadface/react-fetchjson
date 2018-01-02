import { createStore } from 'redux'

const initial_state = {
  fetch_list: []
}

const reducers = (state=initial_state, action) => {
  switch (action.type) {
    case 'CACHE':
      return {
        fetch_list: state.fetch_list.concat([action.payload])
      }
    default:
      return state
  }
}

export default createStore(reducers)

import React from 'react'
import shallowequal from 'shallowequal'
import { connect, Provider } from 'react-redux'
import _ from 'lodash'

// Store is more than just the store now
import { FetchRunner, store } from './store.js'

const Group = ({ children }) => {
  return React.Children.toArray(children);
}

// TODO Move FetchStoreProvider to store.js
// TODO Make something generic like <ProviderFor createStore={createStore} />
export const FetchStoreProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <Group>
        {/* Is there a more explicit way to bind Provider and FetchRunner? (and the children for that matter even maybe?)
            Feels like it might easily collide now */}
        <FetchRunner />
        {children}
      </Group>
    </Provider>
  );
}

const precondition = (condition, message="Unmet precondition") => {
  if (!condition) {
    throw new Error(message);
  }
}

export const FetchJSON = connect(
  ({fetch_list}, props) => {
    return {
      fetch_object: fetch_list.find(obj => obj.url === props.url)
    }
  },
  (dispatch, props) => {
    return {
      action: (args) => {
        dispatch(args)
      }
    }
  }
)(class extends React.Component {
   handleFetch() {
    this.props.action({
      type: 'ADD_FETCH',
      payload: {
        url: this.props.url,
      },
    });
  }

  componentDidMount() {
    precondition(
      this.props.method == null || this.props.method === 'get',
      "POST (non-get) request not yet implemented"
    )
    this.handleFetch()
  }

  componentDidUpdate(prevProps, prevState){
    if (!shallowequal(prevProps, this.props)) {
      this.handleFetch()
    }
  }

  render(){
    const getFetchState = (fetch_object) => {
      if (fetch_object && fetch_object.status === 'done') {
        return {
          status: fetch_object.status,
          data: fetch_object.data,
          error: null,
        }
      } else {
        return {
          data: null,
          status: 'loading',
          error: null
        }
      }
    }

    return this.props.children(getFetchState(this.props.fetch_object))
  }
});

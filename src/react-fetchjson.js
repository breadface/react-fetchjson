import React from 'react'
import shallowequal from 'shallowequal'
import { connect, Provider } from 'react-redux'
import {PersistGate} from 'redux-persist/integration/react';

// Store is more than just the store now
import { FetchRunner, store, persistor } from './store.js'

const Group = ({ children }) => {
  return React.Children.toArray(children);
}

// TODO Move FetchStoreProvider to store.js
// TODO Make something generic like <ProviderFor createStore={createStore} />
export const FetchStoreProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Group>
          {/* Is there a more explicit way to bind Provider and FetchRunner? (and the children for that matter even maybe?)
              Feels like it might easily collide now */}
          <FetchRunner />
          {children}
        </Group>
      </PersistGate>
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
    const {url, fetch_object} = this.props;
    const payload = {
      url,
      data: null,
      status: 'loading',
      errors: null
    };
    const fetch_payload = fetch_object ? fetch_object : payload;

    return this.props.children(fetch_payload);
  }
});

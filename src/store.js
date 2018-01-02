import React from 'react';
import { createStore } from 'redux'
import { connect, Provider } from 'react-redux'

/*:flow
// Id is something I just made up that would be the subset of the element that would be matched for duplicates;
// Right now that is only "url" I guess? (Maybe timestamp later?)
type Id = {
  url: string,
}

type FetchElement = {
  // TODO Timestamp maybe? Feels odd
  url: string,
  // Note the `?` => data is not available on this object during `loading`
  data: ?mixed, // This can be anything: no assumtions can be made
  status: 'loading' | 'done',
type State = {
  fetch_list: Array<FetchElement>,
}
*/

const initial_state = {
  fetch_list: []
}

const get_fetch_by = (fetch_list/*:Array<Id>*/, id/*: Id*/) => {
  return fetch_list.find(element => element.url === id.url);
}

const precondition = (condition, message="Unmet precondition") => {
  if (!condition) {
    throw new Error(message);
  }
}

const reducers = (state=initial_state/*:State*/, action) => {
  switch (action.type) {
    case 'ADD_FETCH': {
      let existing_fetch = get_fetch_by(state.fetch_list, action.payload);
      if (existing_fetch) {
        return state;
      } else {
        return {
          // Changing this to a more explicit (?!idk) append
          fetch_list: [
            ...state.fetch_list,
            {
              url: action.payload.url,
              data: null,
              status: 'loading',
            }
          ],
        }
      }
    }

    case 'UPDATE_FETCH': {
      let existing_fetch = get_fetch_by(state.fetch_list, action.payload);
      precondition(existing_fetch != null, `UPDATE_FETCH on non-existing fetch element?`);

      if (action.payload.status === 'done') { // I would make done implicit here: UPDATE_FETCH === Setting to done ; Maybe not?
        return {
          fetch_list: state.fetch_list.map(element => {
            if (element.url === action.payload.url) {
              return  {
                url: action.payload.url,
                data: action.payload.data,
                status: action.payload.status,
              }
            } else {
              return element
            }
          })
        }
      } else {
        throw new Error(`Status unknown... REFUSE`)
      }
    }

    default:
      return state
  }
}

const serialize = obj => Object.entries(obj).map(([key, value]) =>
  `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
).join('&');

const buildHeaders = token => {
  let headers = {
    Accept: 'application/json, text/javascript',
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (token){
    return { ...headers, Authorization: `Bearer ${token}`};
  } else {
    return headers;
  }
}

class FetchAction extends React.Component {
  async handleFetch() {
    const { method='get', params=null, token="", url } = this.props.element
    const body = params ? serialize(params) : params
    const headers = buildHeaders(token)

    try {
      const result = await fetch(url,{
        method,
        body,
        headers
      })
      const data = await result.json()
      this.props.action({
        type: 'UPDATE_FETCH',
        payload: {
          data,
          url: url,
          status: 'done'
        }
      })
    } catch (e) {
      //TODO: Error handling implementation
      console.log('e:', e)
    }
  }

  componentDidMount() {
    this.handleFetch();
  }

  componentDidUpdate() {
    // Not sure if I'd need to handleFetch here too?
    // this.handleFetch();
  }

  render() {
    return null;
  }
}

// This component will "divide" all
export const FetchRunner = connect(state => {
  return {
    elements: state.fetch_list,
  }
}, dispatch => {
  return {
    action: args => {
      dispatch(args)
    }
  }
})(({elements, action}) => {
  // Think of this array as <Group>{...}</Group>,
  // but without an effect on its own (instead of <div>...</div>)
  return [
    ...elements
    .filter(element => element.status === 'loading')
    .map(element => <FetchAction element={element} action={action} />)
  ];
});

export const store = createStore(reducers);

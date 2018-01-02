import React from 'react'
import shallowequal from 'shallowequal'
import { connect, Provider } from 'react-redux'
import _ from 'lodash'
import store from './store'


const precondition = (condition, message="Unmet precondition") => {
  if (!condition) {
    throw new Error(message);
  }
}

const serialize = obj => Object.entries(obj).map(([key, value]) =>
  `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
).join('&');

const buildHeaders = token => {
  let headers = {
    Accept: 'application/json, text/javascript',
    "Content-Type": "application/x-www-form-urlencoded"
  };

  if (token){
    return { ...headers, Authorization: `Bearer ${token}`};
  } else {
    return headers;
  }
}

const FetchJSON = connect(
  ({fetch_list}, props) => {
    const fetch_object = fetch_list
      .find(obj => obj.url === props.url)
    const disabled = fetch_object && fetch_object.status === 'loaded'

    return {
      fetch_object,
      disabled
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
  async handleFetch() {
    const { method='get', params=null, token="", action } = this.props
    const url_for_this_request = this.props.url
    const body = params ? serialize(params) : params
    const headers = new Headers(buildHeaders(token))

    try {
      const result = await fetch(this.props.url,{
        method,
        body,
        headers
      })
      const data = await result.json()

      if(url_for_this_request === this.props.url) {
        action({
          type: 'CACHE',
          payload: {
            data,
            url: this.props.url,
            status: 'loaded'
          }
        })
      }
    } catch (e) {
      //TODO: Error handling implementation
      console.log('e:', e)

    }
  }

  componentDidMount() {
    precondition(
      this.props.method !== 'post',
      "POST request not yet implemented"
    )

    if (!this.props.disabled) {
      console.log('gets called')
      this.handleFetch()
    }
  }

  componentDidUpdate(prevProps, prevState){
    if (!this.props.disabled && !shallowequal(prevProps, this.props)) {
      this.handleFetch()
    }
  }

  render(){
    const getFetchState = (fetch_object) => {
      if (fetch_object) {
        const {url, others} = fetch_object

        return {
          error: null,
          ...others
        }
      } else {
        return {
          data: null,
          status: null,
          error: null
        }
      }
    }

    return this.props.children(getFetchState(this.props.fetch_object))
  }
})

const CacheProvider = props => (
  <Provider store={store}>
    <FetchJSON
      {...props}
    />
  </Provider>
)

export default CacheProvider

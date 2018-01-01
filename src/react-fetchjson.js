import React from 'react'
import shallowequal from 'shallowequal'
import { connect, Provider } from 'react-redux'
import store from './store'

const serialize = obj => Object.entries(obj).map(([key, value]) =>
  `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
).join('&')

const buildHeaders = token => {
  let headers = {
    Accept: 'application/json, text/javascript',
    "Content-Type": "application/x-www-form-urlencoded"
  }

  if (token){
    return { ...headers, Authorization: `Bearer ${token}`}
  } else {
    return headers
  }
}

const FetchJSON = connect(
  (state, props) => {
    return {
      data_list: state
    }
  },
  (dispatch, props) => {
    return {
      action: (args) => {
        return dispatch(args)
      }
    }
  }
)(class extends React.Component {
  state = {
    data: null,
    error: null
  }

  async handleFetch() {
    const { method='get', params=null, token="", ...otherConfig } = this.props
    const url_for_this_request = this.props.url
    const body = params ? serialize(params) : params

    let headers = new Headers(buildHeaders(token))

    try {
      const result = await fetch(this.props.url,{
        method,
        body,
        headers,
        ...otherConfig
      })
      const data = await result.json()

      if(url_for_this_request === this.props.url) {
        this.setState({data})
      }
    } catch (e) {
      //TODO: Error handling implementation
      console.log('e:', e)

    }

    if(otherConfig.action) {
      otherConfig.action()
    }
  }

  componentDidMount() {
    if(this.props.disabled){
      return
    } else {
      this.handleFetch()
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.disabled) {
      return
    } else {
      if(!shallowequal(prevProps, this.props)) {
        this.handleFetch()
      }
    }
  }

  render(){
    const { data, error } = this.state
    return this.props.children(data, error)
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

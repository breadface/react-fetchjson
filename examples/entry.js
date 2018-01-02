import React from 'react'
import { render } from 'react-dom'
import { FetchJSON, FetchStoreProvider } from '../src/react-fetchjson.js'

class Dogs extends React.Component {
  render() {
    return (
      <FetchStoreProvider>
        <div>
          <FetchJSON
            url="https://dog.ceo/api/breeds/list/all"
            data={null}
            // disabled={false}
          >{({data, error, status}) =>
            <div con={console.log(`#1 data, error, status:`, data, error, status)}>
              Gets data still
            </div>
          }</FetchJSON>

          <FetchJSON
            url="https://dog.ceo/api/breeds/list/all"
            data={null} // Nice dog api
            // disabled={false}
          >{({data, error, status}) =>
            <div con={console.log(`#2 data, error, status:`, data, error, status)}>
              Gets data still
            </div>
          }</FetchJSON>
        </div>
      </FetchStoreProvider>
    )
  }
}

render(
  <Dogs />,
  document.getElementById('app')
)

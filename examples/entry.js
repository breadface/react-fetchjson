import React from 'react'
import { render } from 'react-dom'
import { FetchJSON, FetchJSONProvider } from '../index';

class Dogs extends React.Component {
  render() {
    return (      
        <div>
          <FetchJSON
            url="https://dog.ceo/api/breeds/list/all"          
          >{({data, error, status}) =>
            <div con={console.log(`#1 data, error, status:`, data, error, status)}>
              Gets data still
            </div>
          }</FetchJSON>

          <FetchJSON
            url="https://dog.ceo/api/breeds/list/all"
          >{({data, error, status}) =>
            <div con={console.log(`#2 data, error, status:`, data, error, status)}>
              Gets data still
            </div>
          }</FetchJSON>
        </div>
    )
  }
}

render(
  <FetchJSONProvider>
    <Dogs />
  </FetchJSONProvider>
  ,
  document.getElementById('app')
)

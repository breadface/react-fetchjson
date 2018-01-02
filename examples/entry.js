import React from 'react'
import { render } from 'react-dom'
import FetchJSON from '../src/react-fetchjson.js'

class Dogs extends React.Component {
  render(){
    return (
      <FetchJSON
        url="https://dog.ceo/api/breeds/list/all"
        data={null}
        // disabled={false}
        >{({data, error, status}) => {
          console.log('data:', data)
          return <div>
            Welcome to the application Jesmine
          </div>
          }

        }</FetchJSON>
    )
  }
}

render(
  <Dogs />,
  document.getElementById('app')
)

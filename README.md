# Getting Started

This is a simple react wrapper for a declarative api data fetching

## Installation
`npm install react-fetchjson`

## Usage
In your entry file

```js
import React from 'react'
import { render } from 'react-dom'
import { FetchJSON, FetchStoreProvider } from 'react-fetchjson.js'

const Dogs = props => (
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
  ); 
}

render(
  <FetchStoreProvider>
    <Dogs />
  </FetchStoreProvider>
,
  document.getElementById('app')
)
```

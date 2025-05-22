import React from 'react'
import ReactDOM from 'react-dom/client'
import NewtabApp from './NewTabApp'
import './styles.css'

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <NewtabApp />
  </React.StrictMode>
)

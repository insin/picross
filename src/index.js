import './index.css'

import Inferno from 'inferno'

import App from './App'

if (module.hot) {
  require('inferno-devtools')
}

Inferno.render(<App/>, document.querySelector('#app'))

if (module.hot) {
  module.hot.accept()
}

import './App.css'

import Inferno from 'inferno'
import createClass from 'inferno-create-class'

import Puzzle from './Puzzle'

const WEIGHTLIFTER = `
X X - - - - - - - - - - - X X
X X - - - - - - - - - - - X X
X X X X X X X X X X X X X X X
X X - X - - - - - - - X - X X
X X - X - - X X X - - X - X X
- - - X X - X - X - X X - - -
- - - - X X X - X X X - - - -
- - - - X X X X X X X - - - -
- - - - - X X X X X - - - - -
- - - - - X X X X X - - - - -
- - - - - - X X X - - - - - -
- - - - - X X X X X - - - - -
- - - - - X X - X X - - - - -
- - - - - X - - - X - - - - -
- - - - X X - - - X X - - - -
`

let App = createClass({
  displayName: 'App',
  render() {
    return <div className="App">
      <Puzzle name="TEST-1" puzzle={WEIGHTLIFTER}/>
    </div>
  }
})

export default App

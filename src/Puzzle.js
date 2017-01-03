import './Puzzle.css'

import React, {PropTypes as t} from 'react'

export function pad(n) {
  return `${n < 10 ? '0' : ''}${n}`
}

export function formatTime(seconds) {
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`
}

export function checkCompletion(etched, solution) {
  return Object.keys(solution).every(coord => etched[coord])
}

export function parsePuzzle(puzzle) {
  let rows = puzzle.trim().replace(/ /g, '').split(/\n/g)
  let colCount = rows[0].length
  let colClues = new Array(colCount)
  let rowClues = new Array(rows.length)
  for (let i = 0; i < rows.length; i++) {
    rowClues[i] = [0]
  }
  for (let i = 0; i < colCount; i++) {
    colClues[i] = [0]
  }
  let solution = {}
  for (let row = rows.length - 1; row >= 0; row--) {
    for (let col = colCount - 1; col >= 0; col--) {
      switch (rows[row].charAt(col)) {
        case '-':
          if (colClues[col][0] !== 0) {
            colClues[col].unshift(0)
          }
          if (rowClues[row][0] !== 0) {
            rowClues[row].unshift(0)
          }
          break
        case 'X':
          colClues[col][0]++
          rowClues[row][0]++
          solution[`${row}x${col}`] = true
          break
      }
      if (col === 0) {
        // We've reached the start of the row - remove any hanging zero
        if (rowClues[row].length > 1 && rowClues[row][0] === 0) {
          rowClues[row].shift()
        }
      }
      if (row === 0) {
        // We've reached the start of the column - remove any hanging zero
        if (colClues[col].length > 1 && colClues[col][0] === 0) {
          colClues[col].shift()
        }
      }
    }
  }

  return {height: rows.length, width: colCount, colClues, rowClues, solution}
}

let Puzzle = React.createClass({
  propTypes: {
    // The name the puzzle is represented by
    name: t.string,
    // An ASCII representation of the puzzle using '-'' for empty squares and 'X'
    // for filled squares, which may also contain spaces.
    puzzle: t.string,
  },
  getInitialState() {
    return {
      completed: false,
      failed: false,
      // Coords which have been successfully etched
      etched: {},
      // Coords which have been marked as empty
      marked: {},
      // Time remaining (in seconds) to complete the puzzle
      time: 30 * 60,
      // Penalty (in seconds) for attempting an incorrect etch
      penalty: 60,
      // Current X coord
      x: 0,
      // Current Y coord
      y: 0,
    }
  },
  componentWillMount() {
    let {width, height, colClues, rowClues, solution} = parsePuzzle(this.props.puzzle)
    this.width = width
    this.height = height
    this.colClues = colClues
    this.rowClues = rowClues
    this.solution = solution
  },
  componentDidMount() {
    this.startTimer()
  },
  componentWillUnmount() {
    this.stopTimer()
  },
  startTimer () {
    if (!this.timerInterval) {
      this.timerInterval = window.setInterval(this.handleTick, 1000)
    }
  },
  stopTimer() {
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  },
  handleTick() {
    this.setState(({time}) => {
      let nextTime = Math.max(0, time - 1)
      if (nextTime === 0) {
        this.stopTimer()
      }
      return {
        time: nextTime,
        failed: nextTime === 0,
      }
    })
  },
  handleKeyDown(e) {
    if (this.state.completed || this.state.failed) return

    if (e.key === 'ArrowRight' && this.state.x < this.width - 1) {
      this.setState({x: this.state.x + 1})
      e.preventDefault()
    }
    if (e.key === 'ArrowLeft' && this.state.x > 0) {
      this.setState({x: this.state.x - 1})
      e.preventDefault()
    }
    if (e.key === 'ArrowDown' && this.state.y < this.height - 1) {
      this.setState({y: this.state.y + 1})
      e.preventDefault()
    }
    if (e.key === 'ArrowUp' && this.state.y > 0) {
      this.setState({y: this.state.y - 1})
      e.preventDefault()
    }
    if (e.key === 'Control') {
      let coord = `${this.state.y}x${this.state.x}`
      // Successful un-etch (why?)
      if (this.state.etched[coord]) {
        this.setState({etched: {...this.state.etched, [coord]: false}})
      }
      // Successful etch
      else if (this.solution[coord]) {
        let etched = {...this.state.etched, [coord]: true}
        let completed = checkCompletion(etched, this.solution)
        if (completed) {
          this.stopTimer()
        }
        this.setState({etched, completed})
      }
      // Unsuccessful etch
      else {
        this.setState(({marked, penalty, time}) => ({
          marked: {...marked, [coord]: true},
          penalty: penalty * 2,
          time: Math.max(0, time - penalty),
        }))
      }
      e.preventDefault()
    }
    if (e.key === 'Shift') {
      let coord = `${this.state.y}x${this.state.x}`
      // Un-mark
      if (this.state.marked[coord]) {
        this.setState({marked: {...this.state.marked, [coord]: false}})
      }
      // Mark
      else {
        this.setState({marked: {...this.state.marked, [coord]: true}})
      }
    }
  },
  render() {
    let {name} = this.props
    let {completed, failed, etched, marked, time, x, y} = this.state
    let currentCoord = `${y}x${x}`
    return <div className="Puzzle" onKeyDown={this.handleKeyDown} tabIndex={0}>
      <table>
        <tbody>
          <tr>
            <td>
              {name}<br/>{formatTime(time)}
            </td>
            {this.colClues.map((clues, col) => {
              let className = 'ColClues'
              if (x === col) {
                className += ' highlight'
              }
              return <td className={className} key={col}>
                {clues.join(' ')}
              </td>
            })}
          </tr>
          {this.rowClues.map((clues, row) => {
            let clueClassName = 'RowClues'
            if (y === row) {
              clueClassName += ' highlight'
            }
            return <tr className="Row" key={row}>
              <td className={clueClassName}>
                {clues.join(' ')}
              </td>
              {this.colClues.map((clues, col) => {
                let blockCoord = `${row}x${col}`
                let className = 'Block'
                if (etched[blockCoord]) {
                  className += ' etched'
                }
                else if (marked[blockCoord]) {
                  className += ' marked'
                }
                if (currentCoord === blockCoord) {
                  className += ' selected'
                }
                return <td className={className} key={blockCoord}/>
              })}
            </tr>
          })}
        </tbody>
      </table>
      {completed && <h1>Win!</h1>}
      {failed && <h1>Fail!</h1>}
    </div>
  }
})

export default Puzzle

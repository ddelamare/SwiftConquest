import React from 'react';
import Token from '../Component/Token/Token'
export default function Board({ ctx, G, moves, plugins, events }) {
  const onClick = (id) => moves.clickCell(id);
  const pickAction = (id) => moves.pickAction(id);
  let winner = '';
  if (ctx.gameover) {
    winner =
      ctx.gameover.winner !== undefined ? (
        <div id="winner">Winner: {ctx.gameover.winner}</div>
      ) : (
        <div id="winner">Draw!</div>
      );
  }

  const cellStyle = {
    border: '1px solid #555',
    width: '50px',
    height: '50px',
    lineHeight: '50px',
    textAlign: 'center',
  };

  let tbody = [];
  for (let i = 0; i < 3; i++) {
    let cells = [];
    for (let j = 0; j < 3; j++) {
      const id = 3 * i + j;
      cells.push(
        <td key={id}>
          {G.cells[id] ? (
            <div style={cellStyle}>{G.cells[id]}</div>
          ) : (
            <button style={cellStyle} onClick={() => onClick(id)} />
          )}
        </td>
      );
    }
    tbody.push(<tr key={i}>{cells}</tr>);
  }

  return (
    <div>
      <table id="board">
        <tbody>{tbody}</tbody>
      </table>
      <table id="actionPool">
        <tbody>
        <tr>
          {G.actionPool.map((token, i) => {
            return (<td key={i}>{G.actionPool[i]}</td>)
          })}
          <td></td>
        </tr>
          </tbody>
      </table>
      <table id="actionPool">
      <tbody>

        <tr>
          {plugins.player.data.players[ctx.currentPlayer].availableActions.map((token, i) => {
            return (<td key={i} onClick={() => pickAction(i)}><Token  type={plugins.player.data.players[ctx.currentPlayer].availableActions[i]}></Token></td>)
          })}
          <td></td>
        </tr>
        </tbody>

      </table>
      <button onClick={() => events.endPhase()}>End Phase</button>
      {winner}
    </div>
  );
}
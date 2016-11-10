import React from 'react';
import Tick from './Tick';

export default class Timeline extends React.Component {
  shouldComponentUpdate(nextProps /* , nextState*/) {
    return nextProps.cursor.row !== this.props.cursor.row;
  }

  render() {
    return (
      <div>
        <div>
          <table>
            <thead>
              <tr className="row">
                <th className="tick"><div className="time-header"><br /></div></th>
              </tr>
            </thead>
          </table>
        </div>

        <div id="col1" style={{ height: this.props.scrollHeight }}>
          <table>
            <tbody>
              <tr className="row"><th className="tick"><div style={{ height: (this.props.topPadding * 15) - 2 }}></div></th></tr>
              { [...Array(this.props.song.patterns[0].rows)].map((x, row) => (
                <Tick key={row} rownum={row} cursor={this.props.cursor} />
              ))}
              <tr className="row"><th className="tick"><div style={{ height: (this.props.bottomPadding * 15) - 2 }}></div></th></tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

Timeline.propTypes = {
  cursor: React.PropTypes.shape({
    row: React.PropTypes.number.isRequired,
  }).isRequired,
  scrollHeight: React.PropTypes.number.isRequired,
  song: React.PropTypes.object.isRequired,
  topPadding: React.PropTypes.number.isRequired,
  bottomPadding: React.PropTypes.number.isRequired,
};

import React from 'react';
import PatternEditorHeader from './pattern_editor_header';
import PatternEditorTimeline from './pattern_editor_timeline';
import PatternEditorRows from './pattern_editor_rows';

import '!style!css!./pattern_editor.css';

export default class PatternEditor extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);

    this.song = {
      tracks: [
        { name: 'Track 1' },
        { name: 'Track 2' },
        { name: 'Track 3' },
        { name: 'Track 4' },
        { name: 'Track 5' },
        { name: 'Track 6' },
      ],
      instruments: [
      ],
      patterns: [{
        rows: 64,
        trackdata: [
          [
  /* 00 */ { note: 'E4', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 01 */ {},
  /* 02 */ { note: 'D#5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 03 */ {},
  /* 04 */ { note: 'E5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 05 */ {},
  /* 06 */ { note: 'D#5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 07 */ {},
  /* 08 */ { note: 'E5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 09 */ {},
  /* 0A */ { note: 'B4', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 0B */ {},
  /* 0C */ { note: 'D5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 0D */ {},
  /* 0E */ { note: 'C5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 0F */ {},
  /* 10 */ { note: 'A2', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 11 */ {},
  /* 12 */ {},
  /* 13 */ {},
  /* 14 */ {},
  /* 15 */ {},
  /* 16 */ {},
  /* 17 */ {},
  /* 18 */ { note: 'E4', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 19 */ {},
  /* 1A */ {},
  /* 1B */ {},
  /* 1C */ { note: 'E2', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 1D */ {},
  /* 1E */ {},
  /* 1F */ {},
  /* 20 */ {},
  /* 21 */ {},
  /* 22 */ {},
  /* 23 */ {},
  /* 24 */ { note: 'G#4', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 25 */ {},
  /* 26 */ {},
  /* 27 */ {},
  /* 28 */ { note: 'A2', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 29 */ {},
  /* 2A */ {},
  /* 2B */ {},
  /* 2C */ {},
  /* 2D */ {},
  /* 2E */ {},
  /* 2F */ {},
  /* 30 */ { note: 'E5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 31 */ {},
  /* 32 */ { note: 'D#5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 33 */ {},
  /* 34 */ { note: 'E5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 35 */ {},
  /* 36 */ { note: 'D#5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 37 */ {},
  /* 38 */ { note: 'E5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 39 */ {},
  /* 3A */ { note: 'B4', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 3B */ {},
  /* 3C */ { note: 'D5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 3D */ {},
  /* 3E */ { note: 'C5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 3F */ {},
          ],
          [
  /* 00 */ {},
  /* 01 */ {},
  /* 02 */ {},
  /* 03 */ {},
  /* 04 */ {},
  /* 05 */ {},
  /* 06 */ {},
  /* 07 */ {},
  /* 08 */ {},
  /* 09 */ {},
  /* 0A */ {},
  /* 0B */ {},
  /* 0C */ {},
  /* 0D */ {},
  /* 0E */ {},
  /* 0F */ {},
  /* 10 */ { note: 'A4', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 11 */ {},
  /* 12 */ {},
  /* 13 */ {},
  /* 14 */ { note: 'A3', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 15 */ {},
  /* 16 */ {},
  /* 17 */ {},
  /* 18 */ {},
  /* 19 */ {},
  /* 1A */ { note: 'A4', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 1B */ {},
  /* 1C */ { note: 'B4', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 1D */ {},
  /* 1E */ {},
  /* 1F */ {},
  /* 20 */ { note: 'G#3', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 21 */ {},
  /* 22 */ {},
  /* 23 */ {},
  /* 24 */ {},
  /* 25 */ {},
  /* 26 */ { note: 'B4', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 27 */ {},
  /* 28 */ { note: 'C5', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 29 */ {},
  /* 2A */ {},
  /* 2B */ {},
  /* 2C */ { note: 'A3', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 2D */ {},
  /* 2E */ {},
  /* 2F */ {},
  /* 30 */ {},
  /* 31 */ {},
  /* 32 */ {},
  /* 33 */ {},
  /* 34 */ {},
  /* 35 */ {},
  /* 36 */ {},
  /* 37 */ {},
  /* 38 */ {},
  /* 39 */ {},
  /* 3A */ {},
  /* 3B */ {},
  /* 3C */ {},
  /* 3D */ {},
  /* 3E */ {},
  /* 3F */ {},
          ],
          [
  /* 00 */ {},
  /* 01 */ {},
  /* 02 */ {},
  /* 03 */ {},
  /* 04 */ {},
  /* 05 */ {},
  /* 06 */ {},
  /* 07 */ {},
  /* 08 */ {},
  /* 09 */ {},
  /* 0A */ {},
  /* 0B */ {},
  /* 0C */ {},
  /* 0D */ {},
  /* 0E */ {},
  /* 0F */ {},
  /* 10 */ {},
  /* 11 */ {},
  /* 12 */ { note: 'E3', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 13 */ {},
  /* 14 */ {},
  /* 15 */ {},
  /* 16 */ {},
  /* 17 */ {},
  /* 18 */ {},
  /* 19 */ {},
  /* 1A */ {},
  /* 1B */ {},
  /* 1C */ { /* Stop */ },
  /* 1D */ {},
  /* 1E */ { note: 'E3', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 1F */ {},
  /* 20 */ {},
  /* 21 */ {},
  /* 22 */ {},
  /* 23 */ {},
  /* 24 */ {},
  /* 25 */ {},
  /* 26 */ {},
  /* 27 */ {},
  /* 28 */ { /* Stop */ },
  /* 29 */ {},
  /* 2A */ { note: 'E3', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 2B */ {},
  /* 2C */ {},
  /* 2D */ {},
  /* 2E */ {},
  /* 2F */ {},
  /* 30 */ {},
  /* 31 */ {},
  /* 32 */ { /* Stop */ },
  /* 33 */ {},
  /* 34 */ {},
  /* 35 */ {},
  /* 36 */ {},
  /* 37 */ {},
  /* 38 */ {},
  /* 39 */ {},
  /* 3A */ {},
  /* 3B */ {},
  /* 3C */ {},
  /* 3D */ {},
  /* 3E */ {},
  /* 3F */ {},
          ],
          [
  /* 00 */ {},
  /* 01 */ {},
  /* 02 */ {},
  /* 03 */ {},
  /* 04 */ {},
  /* 05 */ {},
  /* 06 */ {},
  /* 07 */ {},
  /* 08 */ {},
  /* 09 */ {},
  /* 0A */ {},
  /* 0B */ {},
  /* 0C */ {},
  /* 0D */ {},
  /* 0E */ {},
  /* 0F */ {},
  /* 10 */ {},
  /* 11 */ {},
  /* 12 */ {},
  /* 13 */ {},
  /* 14 */ {},
  /* 15 */ {},
  /* 16 */ { note: 'C4', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 17 */ {},
  /* 18 */ {},
  /* 19 */ {},
  /* 1A */ {},
  /* 1B */ {},
  /* 1C */ { /* Stop */ },
  /* 1D */ {},
  /* 1E */ {},
  /* 1F */ {},
  /* 20 */ {},
  /* 21 */ {},
  /* 22 */ { note: 'E4', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 23 */ {},
  /* 24 */ {},
  /* 25 */ {},
  /* 26 */ {},
  /* 27 */ {},
  /* 28 */ { /* Stop */ },
  /* 29 */ {},
  /* 2A */ {},
  /* 2B */ {},
  /* 2C */ {},
  /* 2D */ {},
  /* 2E */ { note: 'E4', instrument: 1, volume: 40, panning: 80, delay: 0 },
  /* 2F */ {},
  /* 30 */ {},
  /* 31 */ {},
  /* 32 */ { /* Stop */ },
  /* 33 */ {},
  /* 34 */ {},
  /* 35 */ {},
  /* 36 */ {},
  /* 37 */ {},
  /* 38 */ {},
  /* 39 */ {},
  /* 3A */ {},
  /* 3B */ {},
  /* 3C */ {},
  /* 3D */ {},
  /* 3E */ {},
  /* 3F */ {},
          ],
          [
  /* 00 */ {},
  /* 01 */ {},
  /* 02 */ {},
  /* 03 */ {},
  /* 04 */ {},
  /* 05 */ {},
  /* 06 */ {},
  /* 07 */ {},
  /* 08 */ {},
  /* 09 */ {},
  /* 0A */ {},
  /* 0B */ {},
  /* 0C */ {},
  /* 0D */ {},
  /* 0E */ {},
  /* 0F */ {},
  /* 10 */ {},
  /* 11 */ {},
  /* 12 */ {},
  /* 13 */ {},
  /* 14 */ {},
  /* 15 */ {},
  /* 16 */ {},
  /* 17 */ {},
  /* 18 */ {},
  /* 19 */ {},
  /* 1A */ {},
  /* 1B */ {},
  /* 1C */ {},
  /* 1D */ {},
  /* 1E */ {},
  /* 1F */ {},
  /* 20 */ {},
  /* 21 */ {},
  /* 22 */ {},
  /* 23 */ {},
  /* 24 */ {},
  /* 25 */ {},
  /* 26 */ {},
  /* 27 */ {},
  /* 28 */ {},
  /* 29 */ {},
  /* 2A */ {},
  /* 2B */ {},
  /* 2C */ {},
  /* 2D */ {},
  /* 2E */ {},
  /* 2F */ {},
  /* 30 */ {},
  /* 31 */ {},
  /* 32 */ {},
  /* 33 */ {},
  /* 34 */ {},
  /* 35 */ {},
  /* 36 */ {},
  /* 37 */ {},
  /* 38 */ {},
  /* 39 */ {},
  /* 3A */ {},
  /* 3B */ {},
  /* 3C */ {},
  /* 3D */ {},
  /* 3E */ {},
  /* 3F */ {},
          ],
          [
  /* 00 */ {},
  /* 01 */ {},
  /* 02 */ {},
  /* 03 */ {},
  /* 04 */ {},
  /* 05 */ {},
  /* 06 */ {},
  /* 07 */ {},
  /* 08 */ {},
  /* 09 */ {},
  /* 0A */ {},
  /* 0B */ {},
  /* 0C */ {},
  /* 0D */ {},
  /* 0E */ {},
  /* 0F */ {},
  /* 10 */ {},
  /* 11 */ {},
  /* 12 */ {},
  /* 13 */ {},
  /* 14 */ {},
  /* 15 */ {},
  /* 16 */ {},
  /* 17 */ {},
  /* 18 */ {},
  /* 19 */ {},
  /* 1A */ {},
  /* 1B */ {},
  /* 1C */ {},
  /* 1D */ {},
  /* 1E */ {},
  /* 1F */ {},
  /* 20 */ {},
  /* 21 */ {},
  /* 22 */ {},
  /* 23 */ {},
  /* 24 */ {},
  /* 25 */ {},
  /* 26 */ {},
  /* 27 */ {},
  /* 28 */ {},
  /* 29 */ {},
  /* 2A */ {},
  /* 2B */ {},
  /* 2C */ {},
  /* 2D */ {},
  /* 2E */ {},
  /* 2F */ {},
  /* 30 */ {},
  /* 31 */ {},
  /* 32 */ {},
  /* 33 */ {},
  /* 34 */ {},
  /* 35 */ {},
  /* 36 */ {},
  /* 37 */ {},
  /* 38 */ {},
  /* 39 */ {},
  /* 3A */ {},
  /* 3B */ {},
  /* 3C */ {},
  /* 3D */ {},
  /* 3E */ {},
  /* 3F */ {},
          ],
        ],
      }],
    };

    this.onScroll = this.onScroll.bind(this);

    this.yoff = 0;

    this.state = {
      cursorLine: 0,
      visibleLines: 0,
      vertScroll: 0,
      horizScroll: 0,
      topPadding: 0,
    };
  }

  shouldComponentUpdate(/* nextProps, nextState*/) {
    // return (nextProps.width != this.props.width || nextProps.height != this.props.height);
    return true;
  }

  componentDidUpdate() {
    const vertTarget = document.getElementById('sideTable');
    const horizTarget = document.getElementsByClassName('xscroll')[0];
    const col1 = document.getElementById('col1');

    vertTarget.scrollTop = this.state.vertScroll;
    col1.scrollTop = this.state.vertScroll;
    horizTarget.scrollLeft = this.state.horizScroll;
  }


  onScroll(e) {
    const vertTarget = document.getElementById('sideTable');
    const horizTarget = document.getElementsByClassName('xscroll')[0];

    const height = parseInt(this.props.height.slice(0, -2), 10);
    const scrollHeight = (Math.ceil((height - 48) / 15.0) - 1) * 15.0;

    this.yoff += e.deltaY;
    if (this.yoff < 0) {
      this.yoff = 0;
    } else if (this.yoff >= vertTarget.scrollHeight - vertTarget.clientHeight) {
      this.yoff = vertTarget.scrollHeight - vertTarget.clientHeight;
    }

    const theCursor = Math.round((this.yoff) / 15.0);
    const windowScroll = theCursor * 15.0;
    const windowRows = scrollHeight / 15;
    const blankRowsTop = Math.floor((windowRows / 2) - 0.5);
    const blankRowsBottom = windowRows - blankRowsTop - 1;

    this.setState({
      visibleLines: windowRows,
      cursorLine: theCursor,
      vertScroll: windowScroll,
      horizScroll: horizTarget.scrollLeft + e.deltaX,
      topPadding: blankRowsTop,
      bottomPadding: blankRowsBottom,
    });

    e.preventDefault();
  }

  render() {
    const width = parseInt(this.props.width.slice(0, -2), 10);
    const height = parseInt(this.props.height.slice(0, -2), 10);
    const scrollHeight = (Math.ceil((height - 48) / 15.0) - 1) * 15.0;

    return (
      <div className="widget-container">
        <div className="pattern-editor">
          <div style={{ float: 'left' }}>
            <PatternEditorTimeline song={this.song} cursorLine={this.state.cursorLine} scrollHeight={scrollHeight} topPadding={this.state.topPadding} bottomPadding={this.state.bottomPadding} />
          </div>

          <div style={{ float: 'left', width: width - 63 }} className="xscroll">
            <div id="leftSideTable">
              <PatternEditorHeader song={this.song} />
            </div>
            <div style={{ height: scrollHeight }} id="sideTable" onWheel={this.onScroll}>
              <PatternEditorRows song={this.song} cursorLine={this.state.cursorLine} topPadding={this.state.topPadding} bottomPadding={this.state.bottomPadding} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

PatternEditor.propTypes = {
  width: React.PropTypes.string,
  height: React.PropTypes.string,
};

import $ from 'jquery';
import LZ4 from 'lz4-asm';
import textEncoding from 'text-encoding';

import songdata from '../../data/song.json';
import cymbal from '../../data/cymbal.json';
import pad from '../../data/instrument_3.json';

import {encode, decode} from 'base64-arraybuffer';

import Signal from '../utils/signal';
import Immutable from 'immutable';

import { xmloader } from './xmloader';
import { state } from '../state';

export class SongManager {
  constructor() {
    this.eventChanged = Signal.signal(false);
    this.songChanged = Signal.signal(false);
    this.instrumentChanged = Signal.signal(false);
    this.sampleChanged = Signal.signal(false);
    this.instrumentListChanged = Signal.signal(false);
    this.bpmChanged = Signal.signal(false);
    this.speedChanged = Signal.signal(false);
    this.sequenceChanged = Signal.signal(false);
    this.sequenceItemChanged = Signal.signal(false);
    this.trackChanged = Signal.signal(false);
    this.patternChanged = Signal.signal(false);

    this.eventEntries = [
      'note',
      'instrument',
      'volume',
      'fxtype',
      'fxparam',
    ];

    this.eventIndices = [
      { itemIndex: 0, mask: 0, shift: 0 },
      { itemIndex: 1, mask: 0x0F, shift: 4},
      { itemIndex: 1, mask: 0xF0, shift: 0},
      { itemIndex: 2, mask: 0x0F, shift: 4},
      { itemIndex: 2, mask: 0xF0, shift: 0},
      { itemIndex: 3, mask: 0x00, shift: 0},
      { itemIndex: 4, mask: 0x0F, shift: 4},
      { itemIndex: 4, mask: 0xF0, shift: 0},
    ];

    this.newSong();
  }

  findEventAtCursor(cursor) {
    if (!state.song.hasIn(["patterns", cursor.pattern])) {
      state.song.set({
        song: {
          patterns: state.song.get("patterns").set(cursor.pattern, Immutable.fromJS({
            patternid: `p${cursor.pattern}`,
            name: `Pattern ${cursor.pattern}`,
            numrows: 32,
            rows: [] 
          })),
        }
      });
    }

    if (!state.song.hasIn(["pattern", cursor.pattern, "rows", cursor.row])) {
      state.set({
        song: {
          patterns: state.song.get("patterns").setIn([cursor.pattern, "rows", cursor.row], new Immutable.List()),
        },
      });
    }

    if (!state.song.hasIn(["pattern", cursor.pattern, "rows", cursor.row, cursor.track])) {
      state.set({
        song: {
          patterns: state.song.get("patterns").setIn([cursor.pattern, "rows", cursor.row, cursor.track], Immutable.fromJS({
            trackindex: cursor.track,
            notedata: []
          })),
        },
      });
    }

    if (state.song.hasIn(["patterns", cursor.pattern, "rows", cursor.row, cursor.track, "notedata"])) {
      state.set({
        song: {
          patterns: state.song.get("patterns").setIn([cursor.pattern, "rows", cursor.row, cursor.track, "notedata"], new Immutable.List()),
        },
      });
    }

    if (!state.song.hasIn(["patterns", cursor.pattern, "rows", cursor.row, cursor.track, "notedata", cursor.column])) {
      state.set({
        song: {
          patterns: state.song.get("patterns").setIn([cursor.pattern, "rows", cursor.row, cursor.track, "notedata", cursor.column], new Immutable.Map()),
        },
      });
    }
    const notecol = state.song.getIn(["patterns", cursor.pattern, "rows", cursor.row, cursor.track, "notedata", cursor.column]);

    return notecol;
  }

  updateEventAtCursor(cursor, event) {
    if (state.song.hasIn(["patterns", cursor.pattern, "rows", cursor.row, cursor.track, "notedata"])) {
      state.set({
        song: {
          patterns: state.song.get("patterns").setIn([cursor.pattern, "rows", cursor.row, cursor.track, "notedata", cursor.column], event),
        }
      });
    } else if (state.song.hasIn(["patterns", cursor.pattern, "rows", cursor.row])) {
      const newTrack = {
        "notedata": [],
        trackindex: cursor.track,
      };
      newTrack.notedata[cursor.column] = event.toJS();
      state.set({
        song: {
          patterns: state.song.get("patterns").setIn([cursor.pattern, "rows", cursor.row, cursor.track], Immutable.fromJS(newTrack)),
        }
      });
    } else if (state.song.hasIn(["patterns", cursor.pattern])) {
      const newTrack = {
        "notedata": [],
        trackindex: cursor.track,
      };
      newTrack.notedata[cursor.column] = event.toJS();
      const newRow = [];
      newRow[cursor.track] = newTrack;
      state.set({
        song: {
          patterns: state.song.get("patterns").setIn([cursor.pattern, "rows", cursor.row], Immutable.fromJS(newRow)),
        }
      });
    } else {
      const newTrack = {
        "notedata": [],
        trackindex: cursor.track,
      };
      newTrack.notedata[cursor.column] = event.toJS();
      const newRow = [];
      newRow[cursor.track] = newTrack;
      const newPattern = {
        patternid: `p${cursor.pattern}`,
        name: `Pattern ${cursore.pattern}`,
        numrows: 32,
        rows: [] 
      };
      newPattern.rows[cursor.row] = newRow;
      state.set({
        song: {
          patterns: state.song.get("patterns").set(cursor.pattern, Immutable.fromJS(newPattern)), 
        }
      });
    }
  }

  addNoteToSong(cursor, note, instrument = null) {
    let notecol = this.findEventAtCursor(cursor);
    notecol = notecol.set("note", note);
    if (instrument != null) {
      notecol = notecol.set("instrument", instrument);
    }
    this.updateEventAtCursor(cursor, notecol);
    this.eventChanged(cursor, notecol);
    console.log(state.song.getIn(["patterns", cursor.pattern, "rows", cursor.row, cursor.track, "notedata", cursor.column]));
  }

  deleteItemAtCursor(cursor) {
    const notecol = this.findEventAtCursor(cursor);

    const eventItem = this.eventIndices[cursor.item].itemIndex;
    if (eventItem < this.eventEntries.length) {
      const entry = this.eventEntries[eventItem];

      switch(entry) {
        case "note":
        case "instrument":
        case "volume":
          notecol[entry] = -1;
          break;
        case "fxtype":
        case "fxparam":
          notecol["fxtype"] = 0;
          notecol["fxparam"] = 0;
          break;
        default:
          notecol[entry] = 0;
          break;
      }
      this.eventChanged(cursor, notecol);
    }

    this.updateEventAtCursor(cursor, notecol);
  }

  setHexValueAtCursor(cursor, value) {
    const notecol = this.findEventAtCursor(cursor);

    const eventItem = this.eventIndices[cursor.item].itemIndex;
    if (eventItem < this.eventEntries.length) {
      const entry = this.eventEntries[eventItem];
      const mask = this.eventIndices[cursor.item].mask
      const shift = this.eventIndices[cursor.item].shift
      const vald = value << shift;

      notecol[entry] = (notecol[entry] & mask) | vald;
      this.eventChanged(cursor, notecol);
    }

    this.updateEventAtCursor(cursor, notecol);
  }

  setFXAtCursor(cursor, value) {
    const notecol = this.findEventAtCursor(cursor);
    let vald = value;
    if(cursor.item !== 5) {
      return;
    }

    const eventItem = this.eventIndices[cursor.item].itemIndex;
    if (eventItem < this.eventEntries.length) {
      notecol.fxtype = value;
      this.eventChanged(cursor, notecol);
    }

    this.updateEventAtCursor(cursor, notecol);
  }

  newSong() {
    this.song = Immutable.fromJS(songdata).toJS();
    this.song.instruments.push(Immutable.fromJS(cymbal).toJS());
    this.song.instruments.push(Immutable.fromJS(pad).toJS());

    state.set({
      transport: {
        bpm: this.song.bpm,
        speed: this.song.speed,
      },
      song: this.song,
    });

    this.songChanged();
  }

  addInstrument() {
    const samplemap = new Array(96);
    try {
      state.set({
        song: {
          instruments: state.song.get("instruments").push(Immutable.fromJS({
            'name': `Instrument ${state.song.get("instruments").size}`,
            'number': state.song.get("instruments").size,
            'samples': [],
            samplemap,
          })),
        }
      });
    } catch(e) {
      console.log(e);
    }

    this.instrumentListChanged();
    state.set({
      cursor: {
        instrument: this.song.instruments.length - 1,
      }
    });
  }

  addSampleToInstrument(instrumentIndex) {
    try {
      state.set({
        song: {
          instruments: state.song.get("instruments").setIn([instrumentIndex, "samples"], state.song.getIn(["instruments", instrumentIndex, "samples"]).push(Immutable.fromJS({
            'len': 0, 
            'loop': 0,
            'looplen': 0, 
            'note': 0, 
            'fine': 0,
            'pan': 0, 
            'type': 0, 
            'vol': 0x40,
            'fileoffset': 0, 
            'name': `Sample ${state.song.getIn(["instruments", instrumentIndex, "samples"]).size}`,
          }))),
        }
      });

      this.instrumentChanged(instrumentIndex);
      state.set({
        cursor: {
          sample: this.song.instruments[instrumentIndex].samples.length - 1,
        }
      });
    } catch(e) {
      console.log(e);
    }
  }

  appendPattern() {
    const patternNo = state.song.get("patterns").size;
    state.set({
      song: {
        patterns: state.song.get("patterns").push(Immutable.fromJS({
          patternid: patternNo,
          name: `Pattern ${patternNo}`,
          numrows: 32,
          rows: [],
        })),
      }
    });
    return patternNo;
  }

  addPattern(sequence) {
    const pid = this.appendPattern();
    let pos = sequence + 1;
    if(!sequence || sequence > state.song.get("sequence").size) {
      pos = state.song.get("sequence").size;
    }
    state.set({
      cursor: {
        sequence: pos,
        pattern: pid,
      },
      song: {
        sequence: state.song.get("sequence").insert(pos, Immutable.fromJS({
          pattern: pid,
        })),
      }
    });
    this.sequenceChanged();
    this.patternChanged();
  }

  deletePattern(sequence) {
    let pos = sequence - 1;
    if (pos < 0) {
      pos = 0;
    }
    state.set({
      cursor: {
        sequence: pos,
        pattern: state.song.getIn(["sequence", pos, "pattern"]),
      },
      song: {
        sequence: state.song.get("sequence").delete(sequence),
      },
    });
    this.sequenceChanged();
  }

  clonePattern(sequence) {
    const donor = state.song.getIn(["patterns", state.song.getIn(["sequence", sequence, "pattern"])]);
    let newPattern = Immutable.fromJS(donor.toJS());
    const pid = state.song.get("patterns").size;
    newPattern = newPattern.merge({
      patternid: pid, 
      name: `Pattern ${pid}`,
    });
    let pos = sequence + 1;
    if(!sequence || sequence > state.song.get("sequence").size) {
      pos = state.song.get("sequence").size;
    }

    state.set({
      song: {
        patterns: state.song.get("patterns").push(newPattern),
        sequence: state.song.get("sequence").insert(pos, Immutable.fromJS({
          pattern: pid,
        })),
      },
      cursor: {
        sequence: pos,
        pattern: pid,
      },
    });

    this.sequenceChanged();
  }

  duplicatePattern(sequence) {
    let pos = sequence + 1;
    if(!sequence || sequence > this.song.sequence.length) {
      pos = this.song.sequence.length;
    }
    this.song.sequence.splice(pos, 
                              0, 
                              {
                                pattern: this.song.sequence[sequence].pattern,
                              });
    this.songChanged();
    state.set({
      cursor: {
        sequence: pos,
        pattern: this.song.sequence[pos].pattern,
      }
    });
  }

  updateSequencePattern(sequence, increment) {
    const val = state.song.getIn(["sequence", sequence, "pattern"]) + increment;
    if (val >= 0 && val >= this.song.patterns.length) {
      this.appendPattern();
    }
    if (val >= 0) {
      state.set({
        cursor: {
          val,
        },
        song: {
          sequence: state.song.get("sequence").setIn([sequence, "pattern"], val),
        },
      });

      this.sequenceItemChanged(sequence);
    }
  }

  setSong(song) {
    this.song = song;
    state.set({
      cursor: {
        pattern: 0,
        sequence: 0,
        instrument: 0,
        sample: 0,
        row: 0,
        item: 0,
        track: 0,
        column: 0,
        record: false,
      }
    });

    state.set({
      transport: {
        bpm: this.song.bpm,
        speed: this.song.speed,
      },
      song,
    });

    this.songChanged();
  }

  downloadSong(uri) {
    var promise = new Promise((resolve, reject) => {
      let xmReq = new XMLHttpRequest();
      xmReq.open("GET", uri, true);
      xmReq.responseType = "arraybuffer";
      const _this = this;
      xmReq.onload = (xmEvent) => {
        const arrayBuffer = xmReq.response;
        if (arrayBuffer) {
          // Remove anchor
          let filename = uri.substring(0, (uri.indexOf("#") == -1) ? uri.length : uri.indexOf("#"));
          // Remove query
          filename = filename.substring(0, (filename.indexOf("?") == -1) ? filename.length : filename.indexOf("?"));
          // Remove everything prior to final name
          filename = filename.substring(filename.lastIndexOf("/") + 1, filename.length);
          var newSong = this.loadSongFromArrayBuffer(arrayBuffer, filename);
          if (newSong) {
            song.setSong(newSong);
            resolve();
          }
        } else {
          console.log("Unable to load", uri);
          reject();
        }
      };
      xmReq.send(null);
    });
    return promise;
  }

  saveSongToLocal() {
    function download(buffer, name, type) {
      var a = document.createElement("a");
      var file = new Blob([buffer], {type: type});
      a.href = URL.createObjectURL(file);
      a.download = name;
      a.click();
    }

    let input = new Buffer(JSON.stringify(this.song, (k, v) => {
      // Deal with sampledata differently, as we encode the binary data for
      // efficient serialisation.
      if (k === 'sampledata') {
        return Object.assign(v, {
            data: encode(v.data.buffer),
            serialiseEncoding: 'base64',
          });
      } else {
        return v
      }
    }));

    let output = LZ4.compress(input);

    download(output, this.song.name ? `${this.song.name.trim()}.lz4` : 'wetracker-song.lz4', 'application/octet-stream');
  }

  loadSongFromFile(file, callback) {
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = (e) => {
      let contents = e.target.result;
      let song = this.loadSongFromArrayBuffer(contents, file.name);
      if(song) {
        if (callback) {
          callback(song);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  }

  loadSongFromArrayBuffer(buffer, filename) {
    try {
      let json = undefined;
      try {
        let decomped = LZ4.decompress(new Uint8Array(buffer));
        json = new textEncoding.TextDecoder("utf-8").decode(decomped);
      } catch(e) {
        console.log(e);
        json = new textEncoding.TextDecoder("utf-8").decode(buffer);
      }
      var song = JSON.parse(json, (k, v) => {
        // Deal with sample data differently, as we encode for efficient
        // serialisation of large binary data.
        if (k === 'sampledata') {
          // If the file version has serialisation encoding information, use it.
          if ('serialiseEncoding' in v) {
            // Base64 encoding.
            if ( v.serialiseEncoding === 'base64') {
              const sampledata = new Float32Array(decode(v.data));
              return Object.assign(v, {
                data: sampledata,
              });
            } else {
              // Unknown encoding, return raw.
              return v;
            }
          } else {
            // Presume raw Float32Array old format
            return {
              data: v,
            }; 
          }
        } else {
          return v
        }
      });
      return song;
    } catch(e) {
      console.log(e);
      var song = xmloader.load(buffer, filename);
      return song;
    }
  }

  setInstrumentName(instrumentIndex, name) {
    try {
      const instrument = this.song.instruments[instrumentIndex];
      instrument.name = name;
      this.instrumentChanged(instrumentIndex);
    } catch(e) {
      console.error(e);
    }
  }

  setInstrumentSampleData(instrumentIndex, sampleIndex, data) {
    try {
      const instrument = this.song.instruments[instrumentIndex];
      while (sampleIndex >= instrument.samples.length) {
        this.addSampleToInstrument(instrumentIndex);
      }
      const sample = instrument.samples[sampleIndex];

      sample.sampledata.data = new Array(data.length);
      for(let i = 0; i < data.length; i += 1) {
        sample.sampledata.data[i] = data[i];
      }
      sample.len = data.length;
      sample.note = 29; // F-6
      sample.fine = -28; // Note: this presumes the sample is 44.1KHz

      this.instrumentChanged(instrumentIndex);
      this.sampleChanged(instrumentIndex, sampleIndex);
    } catch(e) {
      console.log(e);
    }
  }

  setInstrumentSampleName(instrumentIndex, sampleIndex, name) {
    try {
      const instrument = this.song.instruments[instrumentIndex];
      const sample = instrument.samples[sampleIndex];
      sample.name = name;
      this.instrumentChanged(instrumentIndex);
    } catch(e) {
      console.error(e);
    }
  }

  updateInstrument(instrumentIndex, data) {
    state.set({
      song: {
          instruments: state.song.get("instruments").set(instrumentIndex, Immutable.fromJS(data)), 
      }
    });
    this.instrumentChanged(instrumentIndex);
  }

  setBPM(bpm) {
    this.song.bpm = bpm;
    this.bpmChanged(this.song.bpm);
  }

  setSpeed(speed) {
    this.song.speed = speed;
    this.speedChanged(this.song.speed);
  }

  setPatternLength(pattern, length) {
    if (pattern < this.song.patterns.length) {
      const oldlength = this.song.patterns[pattern].numrows;
      this.song.patterns[pattern].numrows = length;
      if (oldlength > length) {
        this.song.patterns[pattern].rows = this.song.patterns[pattern].rows.slice(1, length);
      }
      this.songChanged();
    }
  }

  setTrackName(trackIndex, name) {
    try {
      const track = this.song.tracks[trackIndex];
      track.name = name;
      this.trackChanged(trackIndex);
    } catch(e) {
      console.error(e);
    }
  }
}

export let song = new SongManager(); 

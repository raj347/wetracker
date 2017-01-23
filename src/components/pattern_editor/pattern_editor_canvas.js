import $ from 'jquery';

import '../../utils/inlineedit';

import styles from './styles.css';

import Signal from '../../utils/signal';
import { state } from '../../state';
import { song } from '../../utils/songmanager';
import { player, MUTE, SILENT } from '../../audio/player';

import fontimage from '../../../static/ft2font-single.png';

import patternEditorTemplate from './templates/patterneditor.marko';

// t = current time
// b = start value
// c = change in value
// d = duration
function easeInOutQuad(tc, b, c, d) {
  let t = tc;
  t /= d / 2;
  if (t < 1) return (((c / 2) * t) * t) + b;
  t -= 1;
  return ((-c / 2) * ((t * (t - 2)) - 1)) + b;
}

/* Generate tinted versions of the base bitmap font
 * Code from http://www.playmycode.com/blog/2011/06/realtime-image-tinting-on-html5-canvas/
 */
function generateRGBKs( img ) {
  var w = img.width;
  var h = img.height;
  var rgbks = [];

  var canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  var ctx = canvas.getContext("2d");
  ctx.drawImage( img, 0, 0 );

  var pixels = ctx.getImageData( 0, 0, w, h ).data;

  // 4 is used to ask for 3 images: red, green, blue and
  // black in that order.
  for ( var rgbI = 0; rgbI < 4; rgbI++ ) {
    var canvas = document.createElement("canvas");
    canvas.width  = w;
    canvas.height = h;

    var ctx = canvas.getContext('2d');
    ctx.drawImage( img, 0, 0 );
    var to = ctx.getImageData( 0, 0, w, h );
    var toData = to.data;

    for (
      var i = 0, len = pixels.length;
        i < len;
      i += 4
    ) {
      toData[i  ] = (rgbI === 0) ? pixels[i  ] : 0;
      toData[i+1] = (rgbI === 1) ? pixels[i+1] : 0;
      toData[i+2] = (rgbI === 2) ? pixels[i+2] : 0;
      toData[i+3] =                pixels[i+3]    ;
    }

    ctx.putImageData( to, 0, 0 );

    // image is _slightly_ faster then canvas for this, so convert
    var imgComp = new Image();
    imgComp.src = canvas.toDataURL();

    rgbks.push( imgComp );
  }

  return rgbks;
}

function generateTintImage( img, rgbks, red, green, blue ) {
  var buff = document.createElement( "canvas" );
  buff.width  = img.width;
  buff.height = img.height;

  var ctx  = buff.getContext("2d");

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'copy';
  ctx.drawImage( rgbks[3], 0, 0 );

  ctx.globalCompositeOperation = 'lighter';
  if ( red > 0 ) {
    ctx.globalAlpha = red   / 255.0;
    ctx.drawImage( rgbks[0], 0, 0 );
  }
  if ( green > 0 ) {
    ctx.globalAlpha = green / 255.0;
    ctx.drawImage( rgbks[1], 0, 0 );
  }
  if ( blue > 0 ) {
    ctx.globalAlpha = blue  / 255.0;
    ctx.drawImage( rgbks[2], 0, 0 );
  }

  return buff;
}

export default class PatternEditorCanvas {
  constructor(target) {
    this.yoff = 0;
    this.lastCursor = state.cursor;

    this.target = target;

    this._pattern_row_height = 12;
    this._pattern_character_width = 8;
    this._pattern_spacing = 4;
    this._pattern_header_height = 50;
    this._timeline_right_margin = 0;
    this._scope_width = 100;
    this._event_left_margin = 4;
    this._event_right_margin = 4;
    this._element_spacing = 4;
    this._pattern_note_width = this._pattern_character_width * 3;
    this._pattern_inst_width = this._pattern_character_width * 2;
    this._pattern_volu_width = this._pattern_character_width * 2;
    this._pattern_effe_width = (this._pattern_character_width * 3);
    this._cursor_offsets = [
      this._event_left_margin,                                // Note
      this._pattern_note_width + this._element_spacing,       // Instr1
      this._pattern_character_width,                          // Instr2
      this._pattern_character_width + this._element_spacing,  // Vol1
      this._pattern_character_width,                          // Vol2
      this._pattern_character_width + this._element_spacing,  // FX Type
      this._pattern_character_width + 2,                      // FX Param1
      this._pattern_character_width,                          // FX Param2
    ];
    this._cursor_sizes = [
      this._pattern_note_width,                               // Note
      this._pattern_character_width,                          // Instr1
      this._pattern_character_width,                          // Instr2
      this._pattern_character_width,                          // Vol1
      this._pattern_character_width,                          // Vol2
      this._pattern_character_width,                          // FX Type
      this._pattern_character_width,                          // FX Param1
      this._pattern_character_width,                          // FX Param2
    ];
    // N-O II VV EFF
    this._pattern_cellwidth = this._event_left_margin + 
                              (this._pattern_note_width + this._element_spacing) + 
                              (this._pattern_inst_width + this._element_spacing) + 
                              (this._pattern_volu_width + this._element_spacing) +
                              (this._pattern_effe_width + this._element_spacing) +
                              this._event_right_margin;

    this._note_names = [
      [96,288], [96,296], [104,288], [104,296], [112,288], [120,288],
      [120,296], [128,288], [128,296], [80,288], [80,296], [88,288]
    ];

    // Load font (ripped from FastTracker 2)
    this.fontloaded = false;
    this.fontimg = new window.Image();
    this.fontimg.onload = () => this.imageLoaded();
    this.fontimg.src = fontimage;

    this._fontmap_notes = [8*5, 8*22, 8*28];

    this.xoffset;

    // canvas to render patterns onto
    this.pat_canvas = document.createElement('canvas');

    this.empty_event_canvas = document.createElement('canvas');
    this.empty_event_canvas.height = this._pattern_row_height;
    this.empty_event_canvas.width = this._pattern_cellwidth;

    this.empty_pattern_canvas = document.createElement('canvas');
    this.empty_pattern_canvas.height = this._pattern_row_height * 256;
    this.empty_pattern_canvas.width = this._pattern_cellwidth * 32;

    this.timeline_canvas = document.createElement('canvas');
    this.timeline_canvas.height = this._pattern_row_height * 256;
    this.timeline_canvas.width = 30;

    this.track_border_colour = "#666";

    Signal.connect(state, "cursorChanged", this, "onCursorChanged");
    Signal.connect(state, "transportChanged", this, "onTransportChanged");
    Signal.connect(song, "eventChanged", this, "onEventChanged");
    Signal.connect(song, "songChanged", this, "onSongChanged");
    Signal.connect(state, "songChanged", this, "onSongStateChanged");
    Signal.connect(state, "tracksChanged", this, "onTracksChanged");
  }

  initWidth() {
    const numtracks = song.getNumTracks();
    this.canvas.width = this._pattern_cellwidth * numtracks;
    this.timelines.each((i, t) => {
      t.width = this.timeline_canvas.width + this._timeline_right_margin;
    });

    $(this.target).find(".track-names").
      width(this.canvas.width);
    $(this.target).find(".track-name").width(this._pattern_cellwidth);
  }

  imageLoaded() {
    this.fontloaded = true;

    // Generate tinted version
    var rgbks = generateRGBKs( this.fontimg );
    var noteFont = generateTintImage( this.fontimg, rgbks, 255, 255, 255 );
    var instrumentFont = generateTintImage( this.fontimg, rgbks, 255, 102, 102 );
    var volumeFont = generateTintImage( this.fontimg, rgbks, 102, 255, 102 );
    var panningFont = generateTintImage( this.fontimg, rgbks, 153, 102, 153 );
    var delayFont = generateTintImage( this.fontimg, rgbks, 153, 153, 102 );
    var fxFont = generateTintImage( this.fontimg, rgbks, 200, 200, 0 );

    this.noteFontOffset = this.fontimg.height;
    this.instrumentFontOffset = this.fontimg.height * 2;
    this.volumeFontOffset = this.fontimg.height * 3;
    this.panningFontOffset = this.fontimg.height * 4;
    this.delayFontOffset = this.fontimg.height * 5 ;
    this.fxFontOffset = this.fontimg.height * 6;

    this.mixedFont = document.createElement( "canvas" );
    this.mixedFont.width = this.fontimg.width;
    this.mixedFont.height = this.fontimg.height * 7;
    var ctx = this.mixedFont.getContext('2d');
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage( this.fontimg, 0, 0 );
    ctx.drawImage( noteFont, 0, this.noteFontOffset );
    ctx.drawImage( instrumentFont, 0, this.instrumentFontOffset );
    ctx.drawImage( volumeFont, 0, this.volumeFontOffset );
    ctx.drawImage( panningFont, 0, this.panningFontOffset );
    ctx.drawImage( delayFont, 0, this.delayFontOffset );
    ctx.drawImage( fxFont, 0, this.fxFontOffset );

    ctx = this.empty_event_canvas.getContext('2d');
    var dx = 0;
    var cw = this._pattern_character_width;
    var rh = this._pattern_row_height;

    // render note
    ctx.drawImage(this.fontimg, 8*39, 0, 8, 8, dx, 0, this._pattern_note_width, 8);
    dx += this._pattern_note_width + this._pattern_spacing;
    dx += this._pattern_inst_width + this._pattern_spacing;
    // render volume
    ctx.drawImage(this.fontimg, 312, 0, 8, 8, dx, 0, cw, 8);
    ctx.drawImage(this.fontimg, 312, 0, 8, 8, dx+cw, 0, cw, 8);
    dx += this._pattern_volu_width + this._pattern_spacing;
    // render effect
    ctx.drawImage(this.fontimg, 312, 0, 8, 8, dx, 0, cw, 8);
    ctx.drawImage(this.fontimg, 312, 0, 8, 8, dx+cw+2, 0, cw, 8);
    ctx.drawImage(this.fontimg, 312, 0, 8, 8, dx+cw+2+cw, 0, cw, 8);

    ctx = this.empty_pattern_canvas.getContext('2d');
    for(var r = 0; r < 256; r += 1) {
      const dy = r * this._pattern_row_height + ((this._pattern_row_height - 8)/2);
      for(var t = 0; t < 32; t += 1) {
        const dx = (t * this._pattern_cellwidth) + this._event_left_margin;
        ctx.drawImage(this.empty_event_canvas, dx, dy);
      }
    }

    ctx = this.timeline_canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.timeline_canvas.width, this.timeline_canvas.height);
    const offset = (this.timeline_canvas.width - 16) / 2.0;
    dx = 0;
    for (var j = 0; j < 256; j++) {
      var dy = j * rh + ((rh - 8)/2);
      // render row number
      ctx.drawImage(this.fontimg, 8*(j>>4), 0, 8, 8, offset, dy, 8, 8);
      ctx.drawImage(this.fontimg, 8*(j&15), 0, 8, 8, offset + 8, dy, 8, 8);
    }
  };

  eventPositionInPatternCanvas(cursor) {
    var cx = ((cursor.track + cursor.column) * this._pattern_cellwidth);
    var cy = cursor.row * this._pattern_row_height;
    return {
      cx,
      cy,
    };
  }

  renderEvent(ctx, col, dx, dy) {
    var cw = this._pattern_character_width;
    var rh = this._pattern_row_height;
    // render note
    var note = col.note;
    if (note == null || note === -1) {
      // no note = ...
      ctx.drawImage(this.mixedFont, 8*39, 0, 8, 8, dx, dy, this._pattern_note_width, 8);
    } else if (note === 96) {
      ctx.fillStyle = "#000";
      ctx.fillRect(dx, dy, this._pattern_note_width, 8);
      ctx.strokeStyle = "#FFF";
      ctx.strokeRect(dx + 1.5, dy + 1.5, this._pattern_note_width - 3, 3);
    } else{
      var notechars = this._note_names[note%12];
      var octavechar = ~~(note/12) * 8;
      ctx.drawImage(this.mixedFont, notechars[0], this.noteFontOffset, 8, 8, dx, dy, 8, 8);
      ctx.drawImage(this.mixedFont, notechars[1], this.noteFontOffset, 8, 8, dx + cw, dy, 8, 8);
      ctx.drawImage(this.mixedFont, octavechar, this.noteFontOffset, 8, 8, dx + (cw*2), dy, 8, 8);
    }
    dx += this._pattern_note_width + this._element_spacing;

    // render instrument
    var inst = col.instrument;
    if (inst && inst != -1) {  // no instrument = render nothing
      ctx.drawImage(this.mixedFont, 8*(inst>>4), this.instrumentFontOffset, 8, 8, dx, dy, 8, 8);
      ctx.drawImage(this.mixedFont, 8*(inst&15), this.instrumentFontOffset, 8, 8, dx+cw, dy, 8, 8);
    }
    dx += this._pattern_inst_width + this._element_spacing;

    // render volume
    var vol = col.volume;
    if (vol == null || vol < 0x10) {
      // no volume = ..
      ctx.drawImage(this.mixedFont, 312, 0, 8, 8, dx, dy, cw, 8);
      ctx.drawImage(this.mixedFont, 312, 0, 8, 8, dx+cw, dy, cw, 8);
    } else {
      // Draw the volume effect type
      const voltype = vol >> 4;
      if(voltype >= 1 && voltype <= 5) {
        ctx.drawImage(this.mixedFont, 8*(voltype-1), this.volumeFontOffset, 8, 8, dx, dy, cw, 8);
      } else {
        ctx.drawImage(this.mixedFont, 368 + (8*(voltype - 6)), this.volumeFontOffset, 8, 8, dx, dy, cw, 8);
      }
      ctx.drawImage(this.mixedFont, 8*(vol&15), this.volumeFontOffset, 8, 8, dx+cw, dy, cw, 8);
    }
    dx += this._pattern_volu_width + this._element_spacing;

    // render effect
    var eff = col.fxtype;
    var effdata = col.fxparam;
    if ((eff != null && eff !== -1) && (eff !== 0 || effdata !== 0)) {
      // draw effect with tiny font (4px space + effect type 0..9a..z)
      ctx.drawImage(this.mixedFont, 8*eff, this.fxFontOffset, 8, 8, dx, dy, cw, 8);
      dx += cw+2;
      // (hexadecimal 4-width font)
      ctx.drawImage(this.mixedFont, 8*(effdata>>4), this.fxFontOffset, 8, 8, dx, dy, cw, 8);
      ctx.drawImage(this.mixedFont, 8*(effdata&15), this.fxFontOffset, 8, 8, dx+cw, dy, cw, 8);
    } else {
      // no effect = ...
      ctx.drawImage(this.mixedFont, 312, 0, 8, 8, dx, dy, cw, 8);
      ctx.drawImage(this.mixedFont, 312, 0, 8, 8, dx+cw+2, dy, cw, 8);
      ctx.drawImage(this.mixedFont, 312, 0, 8, 8, dx+cw+2+cw, dy, cw, 8);
    }
  }


  clearEvent(ctx, dx, dy) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = "#000";
    ctx.clearRect(dx, dy, this._pattern_cellwidth, this._pattern_row_height);
    ctx.drawImage(this.empty_event_canvas, dx + this._event_left_margin, dy + (this._pattern_row_height - 8)/2);
  }

  renderPattern(index) {
    var cw = this._pattern_character_width;
    var rh = this._pattern_row_height;

    // a pattern consists of NxM cells which look like
    // N-O II VV EFF
    var cellwidth = this._pattern_cellwidth;
    var ctx = this.pat_canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const numtracks = song.getNumTracks();
    const numrows = song.getPatternRowCount(index);
    this.pat_canvas.width = numtracks * cellwidth;
    this.pat_canvas.height = numrows * rh;

    ctx.drawImage(this.empty_pattern_canvas, 0, 0);

    for(let j = 0; j < numrows; j += 1) {
      var dy = j * rh + ((rh - 8)/2);
      var trackColumn = 0;

      for (let tracki = 0; tracki < numtracks; tracki += 1) {
        const track = song.getTrackDataForPatternRow(index, j, tracki);
        if (track && "notedata" in track) {
          const numcolumns = track.notedata.length;
          for (let coli = 0; coli < numcolumns; coli += 1) {
            var dx = ((trackColumn + coli) * cellwidth) + this._event_left_margin;
            this.renderEvent(ctx, track.notedata[coli], dx, dy);
          }
        } 
        trackColumn += song.getTrackNumColumns(tracki);
      }
    }
    // Render beat rows in a separate loop to avoid thrashing state changes
    ctx.globalCompositeOperation = 'lighten';
    for (var j = 0; j < numrows; j += 1) {
      var dy = j * rh;
      if (j % song.getSpeed() == 0) {
        // Render a beat marker
        ctx.fillStyle = '#333';
        ctx.fillRect(0, dy, this.pat_canvas.width, this._pattern_row_height);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  renderEventBeat(ctx, cursor, cx, cy) {
    ctx.globalCompositeOperation = 'lighten';
    if (cursor.row % song.getSpeed() == 0) {
      // Render a beat marker
      ctx.fillStyle = '#333';
      ctx.fillRect(cx, cy, this._pattern_cellwidth, this._pattern_row_height);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  render() {
    $(this.target).addClass('pattern-editor');

    const pindex = state.cursor.get("pattern");
    const numrows = song.getPatternRowCount(pindex);
    $(this.target).append(patternEditorTemplate.renderToString({
      transport: state.transport.toJS(), 
      tracknames: song.getTrackNames(),
      numrows,
    }));
    this.canvas = $(this.target).find("canvas#gfxpattern")[0];
    this.timelines = $(this.target).find("canvas.timelinecanvas");

    this.hscroll = $(this.canvas).closest('.hscroll');
    this.patterndata = $(this.canvas).closest('.patterndata');
    this.initWidth();
    $(this.patterndata).on('mousewheel', this.onScroll.bind(this));
    $(this.canvas).on('click', this.onClick.bind(this));

    $(this.target).find('input').bind("enterKey", (e) => {
      state.set({
        transport: {
          step: parseInt($(this.target).find("#step").val()),
        },
      });
      song.setPatternLength(pindex, parseInt($(this.target).find("#length").val()));
      $(e.target).blur();
    });
    $(this.target).find('input').keyup(function(e){
      if(e.keyCode == 13)
      {
        $(this).trigger("enterKey");
      }
    });

    $(this.target).find('.track-name div').inlineEdit({
      accept: function(val) {
        const trackindex = $(this).parents('.track-name').data('trackindex');
        song.setTrackName(trackindex, val);
      },
    });

    this.updateCanvas();
  }

  updateCanvas() {
    if(!this.fontloaded) {
      window.requestAnimationFrame(() => this.updateCanvas() );
      return;
    }
    if (state.cursor.get("row") !== this.lastCursor.row || 
        state.cursor.get("sequence") !== this.lastCursor.sequence ||
        state.cursor.get("track") !== this.lastCursor.track ||
        state.cursor.get("column") !== this.lastCursor.column ||
        state.cursor.get("item") !== this.lastCursor.item ||
        state.cursor.get("pattern") !== this.lastCursor.pattern ||
        this.patterndata.scrollLeft() !== this.xoffset) {
      if (state.cursor.get("pattern") !== this.lastCursor.pattern) {
        this.renderPattern(state.cursor.get("pattern"));
      }

      this.redrawCanvas();

      this.lastCursor = state.cursor.toJS();
      this.xoffset = this.patterndata.scrollLeft();
    }
  }

  redrawCanvas() {
    if(!this.fontloaded) {
      window.requestAnimationFrame(() => this.redrawCanvas() );
      return;
    }
    var ctx = this.canvas.getContext('2d');

    var h = $(this.target).find(".patterndata").height();
    this.canvas.height = h;
    this.timelines.each((i, t) => {
      t.height = h;
    });
    h = Math.floor(h/this._pattern_row_height);
    if(h%2 === 0) h -= 1;
    h *= this._pattern_row_height;

    var patternheight = this.canvas.height - this._pattern_header_height;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.pat_canvas, 0, this.canvas.height / 2 - (this._pattern_row_height/2) - this._pattern_row_height*(state.cursor.get("row")));


    // Draw the timeline fixed to the left of the view.
    this.timelines.each((i, t) => {
      var tctx = t.getContext('2d');
      var tlw = this.timeline_canvas.width;
      var tlh = this._pattern_row_height * song.getPatternRowCount(state.cursor.get("pattern"));
      tctx.fillStyle = '#000';
      tctx.fillRect(0, 0, this.timeline_canvas.width, this.canvas.height);
      tctx.drawImage(this.timeline_canvas, 0, 0, tlw, tlh, 0, this.canvas.height / 2 - (this._pattern_row_height/2) - this._pattern_row_height*(state.cursor.get("row")), tlw, tlh);
      tctx.fillRect(0, 0, this.timeline_canvas.width, this._pattern_header_height);
    });

    // Draw the cursor row.
    var cy = this.canvas.height/2 - (this._pattern_row_height/2);
    ctx.globalCompositeOperation = 'lighten';
    ctx.fillStyle = '#2a5684';
    ctx.fillRect(0, cy, this.canvas.width, this._pattern_row_height);

    // Fade any muted tracks.
    for (let tracki = 0; tracki < player.tracks.length; tracki += 1) {
      if ([SILENT, MUTE].indexOf(player.tracks[tracki].getState().state) !== -1) {
        // Draw a semi-transparent box over silent/muted tracks.
        ctx.globalCompositeOperation = 'darken';
        ctx.fillStyle = '#444';
        let dx = tracki * this._pattern_cellwidth;
        ctx.fillRect(dx, 0, this._pattern_cellwidth, this.canvas.height);
      }
    }
    
    // Draw the individual cursor
    ctx.fillStyle = '#0F0';
    ctx.globalCompositeOperation = 'darken';
    var cx = this._event_left_margin;
    cx += state.cursor.get("track") * this._pattern_cellwidth;
    for(var i = 1; i <= state.cursor.get("item"); i += 1) {
      cx += this._cursor_offsets[i];
    }
    ctx.fillRect(cx, cy, this._cursor_sizes[state.cursor.get("item")], this._pattern_row_height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#0F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx-1, cy-1, this._cursor_sizes[state.cursor.get("item")]+2, this._pattern_row_height+2);

    ctx.clearRect(0, 0, this.canvas.width, this._pattern_header_height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = this.track_border_colour;
    ctx.beginPath();
    const numtracks = song.getNumTracks();
    for (let i = 0; i <= numtracks; i += 1) {
      var dx = i * this._pattern_cellwidth;
      ctx.moveTo(dx, 0);
      ctx.lineTo(dx, this.canvas.height);
    }
    ctx.stroke();
  }

  refresh() {
    $(this.target).empty();
    this.render();
    window.requestAnimationFrame(() => this.redrawCanvas());
  }

  onScroll(e) {
    if (Math.abs(e.originalEvent.deltaY) > Math.abs(e.originalEvent.deltaX)) {
      this.yoff += e.originalEvent.deltaY;
      if (Math.abs(this.yoff) >= this._pattern_row_height) {
        const rowIncr = Math.floor(this.yoff / this._pattern_row_height);
        let row = state.cursor.get("row") + rowIncr;
        var maxrow = song.getPatternRowCount(state.cursor.get("pattern"));
        row = ((row % maxrow) + maxrow) % maxrow;
        state.set({
          cursor: {
            row
          }
        });
        this.yoff -= (rowIncr * this._pattern_row_height);
      }
    } else {
      this.patterndata.scrollLeft(this.patterndata.scrollLeft() + e.originalEvent.deltaX);
      this.updateCanvas();
    }
    e.preventDefault();
  }

  onClick(e) {
    const cursor = this.cursorPositionFromMouse(e);
    if (cursor) {
      state.set({
        cursor,
      });
    }
  }

  cursorPositionFromMouse(e) {
    const xpos = e.offsetX;
    const ypos = e.offsetY;

    const track = Math.floor(xpos / this._pattern_cellwidth);
    const itemOffset = Math.floor(xpos - (track * this._pattern_cellwidth));

    let item = 0;
    let cursorItemPos = this._cursor_offsets[item];
    let cursorItemSize = this._cursor_sizes[item];
    while(((itemOffset < cursorItemPos) ||
           (itemOffset > (cursorItemPos + cursorItemSize)))) {
      item += 1;
      if (item >= this._cursor_offsets.length) {
        return null;
      }
      cursorItemPos += this._cursor_offsets[item];
      cursorItemSize = this._cursor_sizes[item];
    }

    var cy = this.canvas.height/2 - (this._pattern_row_height/2);
    var clickRow = Math.floor((ypos - cy) / this._pattern_row_height);
    var row = state.cursor.get("row") + clickRow;

    const maxrow = song.getPatternRowCount(state.cursor.get("pattern"));
    if (row < 0) {
      row = 0;
    } else if (row >= maxrow) {
     row = maxrow;
    } 

    return {
      track,
      item,
      row,
    };
  }

  /* eslint no-param-reassign: ["error", { "props": false }]*/
  scrollHorizTo(element, to, duration) {
    const start = element.scrollLeft();
    const change = to - start;
    let currentTime = 0;
    const increment = 20;

    function animateScroll() {
      currentTime += increment;
      element.scrollLeft(easeInOutQuad(currentTime, start, change, duration));
      this.updateCanvas();
      if (currentTime < duration) {
        setTimeout(animateScroll.bind(this), increment);
      }
    }
    animateScroll.bind(this)();
  }

  onCursorChanged(state) {
    /* If the cursor has moved to a different track, column or item,
     * check if it's still visible and scroll into view if not.
     */
    if ((this.lastCursor.item !== state.cursor.get("item")) ||
        (this.lastCursor.track !== state.cursor.get("track")) ||
        (this.lastCursor.column !== state.cursor.get("column"))) {
      var pos = this.eventPositionInPatternCanvas(state.cursor.toJS());
      var maxpos = this.patterndata.width();
      var minpos = 0;
      if(((pos.cx + this._pattern_cellwidth) - this.patterndata.scrollLeft()) > maxpos) {
       this.scrollHorizTo(this.patterndata, ((pos.cx + this._pattern_cellwidth) - maxpos) + 8, 100); 
      } else if((pos.cx - this.patterndata.scrollLeft()) < minpos) {
        this.scrollHorizTo(this.patterndata, pos.cx - 6, 100);
      }
    }

    $(this.target).find("#length").val(song.getPatternRowCount(state.cursor.get("pattern")));

    var widget = $(this.target).parent(".chrome");
    if (widget.length > 0) {
      widget.toggleClass("record", state.cursor.get("record"));
    }
    window.requestAnimationFrame(this.updateCanvas.bind(this));
  }

  onTransportChanged() {
    if (this.lastTransport !== state.transport) {
      $(this.target).find("#step").val(state.transport.get("step"));

      this.lastTransport = state.transport;
    }
  }

  onTracksChanged() {
    this.redrawCanvas();
  }

  onEventChanged(cursor, event) {
    var pos = this.eventPositionInPatternCanvas(cursor);
    var ctx = this.pat_canvas.getContext('2d');
    this.clearEvent(ctx, pos.cx, pos.cy);
    this.renderEvent(ctx, event, pos.cx + this._event_left_margin, pos.cy + (this._pattern_row_height - 8)/2);
    this.renderEventBeat(ctx, cursor, pos.cx, pos.cy);
    this.redrawCanvas();
  }

  onSongStateChanged() {
    this.lastCursor = {};
    this.refresh();
  }

  onSongChanged() {
    this.lastCursor = {};
    this.refresh();
    state.set({
      cursor: {
        pattern,
        row: 0,
        track: 0,
        column: 0,
        item: 0,
      }
    });
  }
}


import $ from 'jquery';
import 'jquery-ui/widgets/slider';
import 'jquery-ui/widgets/sortable';

import { connect } from '../../utils/signal';
import { state } from '../../state';
import { song } from '../../utils/songmanager';

import template from './templates/effects_editor.marko';

import * as chorus from './effects/chorus';
import * as delay from './effects/delay';
import * as phaser from './effects/phaser';
import * as overdrive from './effects/overdrive';
import * as compressor from './effects/compressor';
import * as filter from './effects/filter';
import * as tremolo from './effects/tremolo';
import * as wahwah from './effects/wahwah';
import * as bitcrusher from './effects/bitcrusher';

import './styles.css';

export default class EffectsEditor {
  constructor(target) {
    this.target = target;
    this.lastCursor = state.cursor;
    this.track = undefined;

    connect(state, 'cursorChanged', this, 'onCursorChanged');
    connect(song, 'songChanged', this, 'onSongChanged');
    connect(song, 'trackEffectChainChanged', this, 'onTrackEffectChainChanged');
  }

  render() {
    const currTrack = state.cursor.get('track');
    const effects = [
      {
        name: chorus.NAME,
        type: chorus.TYPE,
        constructor: chorus.UI,
        poConstructor: chorus.parameterObject,
      },
      {
        name: delay.NAME,
        type: delay.TYPE,
        constructor: delay.UI,
        poConstructor: delay.parameterObject,
      },
      {
        name: phaser.NAME,
        type: phaser.TYPE,
        constructor: phaser.UI,
        poConstructor: phaser.parameterObject,
      },
      {
        name: overdrive.NAME,
        type: overdrive.TYPE,
        constructor: overdrive.UI,
        poConstructor: overdrive.parameterObject,
      },
      {
        name: compressor.NAME,
        type: compressor.TYPE,
        constructor: compressor.UI,
        poConstructor: compressor.parameterObject,
      },
      {
        name: filter.NAME,
        type: filter.TYPE,
        constructor: filter.UI,
        poConstructor: filter.parameterObject,
      },
      {
        name: tremolo.NAME,
        type: tremolo.TYPE,
        constructor: tremolo.UI,
        poConstructor: tremolo.parameterObject,
      },
      {
        name: wahwah.NAME,
        type: wahwah.TYPE,
        constructor: wahwah.UI,
        poConstructor: wahwah.parameterObject,
      },
      {
        name: bitcrusher.NAME,
        type: bitcrusher.TYPE,
        constructor: bitcrusher.UI,
        poConstructor: bitcrusher.parameterObject,
      },
    ];

    try {
      const trackname = song.getTrackName(currTrack);
      $(this.target).append(template.renderToString({ effects, trackname }));
      const trackEffects = song.getTrackEffects(currTrack);
      for (let i = 0; i < trackEffects.length; i += 1) {
        const fxIndex = effects.findIndex((e) => e.type === trackEffects[i].type);
        if (fxIndex !== -1) {
          const fx = new effects[fxIndex].constructor($(this.target).find('#effects-chain'), trackEffects[i], { type: 'track', track: currTrack, index: i });
          connect(fx, 'effectChanged', this, 'onEffectInterfaceChanged');
          fx.render();
        }
      }

      $(this.target).find('button.delete').click((e) => {
        const index = $(e.target).parents('.effect-control-panel').data('chain-index');
        song.deleteTrackEffectFromChain(currTrack, index);
      });

      $(this.target).find('.effect-name').dblclick((e) => {
        const fxIndex = $(e.target).data('fxindex');
        song.appendEffectToTrackChain(state.cursor.get('track'), effects[fxIndex].poConstructor());
      });

      $(this.target).find('#effects-chain').sortable({
        handle: '.effect-header',
        axis: 'x',
        containment: 'document',
        placeholder: 'sortable-placeholder',
        opacity: 0.5,
        forcePlaceholderSize: true,
        start: (e, ui) => {
          $(ui.item).data('previndex', ui.item.index());
        },
        update: (e, ui) => {
          const newIndex = ui.item.index();
          const oldIndex = $(ui.item).data('previndex');
          $(ui.item).removeAttr('data-previndex');
          song.moveTrackEffectInChain(state.cursor.get('track'), oldIndex, newIndex);
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  onEffectInterfaceChanged(location, effect) {
    if (location.type === 'track' && 'track' in location) {
      try {
        song.updateTrackEffect(location.track, location.index, effect);
      } catch (e) {
        console.log(e);
      }
    }
  }

  refresh() {
    $(this.target).empty();
    this.render();
  }

  onCursorChanged() {
    if (state.cursor.get('track') !== this.lastCursor.get('track')) {
      this.target.empty();
      this.render();
      this.lastCursor = state.cursor;
    }
  }

  onSongChanged() {
    this.refresh();
  }

  onTrackEffectChainChanged() {
    // TODO: Check if the changed track is currently displayed.
    this.refresh();
  }
}

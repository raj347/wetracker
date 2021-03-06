import $ from 'jquery';
import 'jquery-ui/widgets/slider';

import { EffectUIBase, EffectNodeBase } from './base';

import template from './templates/wahwah.marko';

export const NAME = 'WahWah';
export const TYPE = 'wahwah';

class WahWahEffectUI extends EffectUIBase {
  render() {
    this.panel = $(template.renderToString({ location: this.location }));
    $(this.target).append(this.panel);
    this.bindParameterToUI('#base-slider', '#base-value', 0, 1, 0.001, 'baseFrequency');
    this.bindParameterToUI('#excursion-slider', '#excursion-value', 1, 6, 1, 'excursionOctaves');
    this.bindParameterToUI('#sweep-slider', '#sweep-value', 0, 1, 0.001, 'sweep');
    this.bindParameterToUI('#resonance-slider', '#resonance-value', 1, 100, 0.1, 'resonance');
    this.bindParameterToUI('#sensitivity-slider', '#sensitivity-value', -1, 1, 0.001, 'sensitivity');
    this.panel.find('#automode').on('change', (e) => {
      this.effect.parameters.automode = e.target.checked;
      this.effectChanged(this.location, this.effect);
    }).prop('checked', this.effect.parameters.automode);
    this.bindBypass();
  }
}

function wahWahEffectParameterObject() {
  return {
    type: TYPE,
    bypass: false,
    parameters: {
      automode: true,
      baseFrequency: 0.5,
      excursionOctaves: 2,
      sweep: 0.2,
      resonance: 10,
      sensitivity: 0.5,
    },
  };
}


class WahWahEffectNode extends EffectNodeBase {
  constructor(tuna, po) {
    super(tuna, po);

    this.fx = new tuna.WahWah({
      automode: po.parameters.automode,
      baseFrequency: po.parameters.baseFrequency,
      excursionOctaves: po.parameters.excursionOctaves,
      sweep: po.parameters.sweep,
      resonance: po.parameters.resonance,
      sensitivity: po.parameters.sensitivity,
      bypass: po.bypass,
    });
  }

  updateFromParameterObject(po) {
    this.fx.bypass = po.bypass;
    this.fx.automode = po.parameters.automode;
    this.fx.baseFrequency = po.parameters.baseFrequency;
    this.fx.excursionOctaves = po.parameters.excursionOctaves;
    this.fx.sweep = po.parameters.sweep;
    this.fx.resonance = po.parameters.resonance;
    this.fx.sensitivity = po.parameters.sensitivity;
  }
}

export { WahWahEffectUI as UI, WahWahEffectNode as Node, wahWahEffectParameterObject as parameterObject };

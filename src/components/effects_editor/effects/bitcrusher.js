import $ from 'jquery';
import 'jquery-ui/widgets/slider';

import { EffectUIBase, EffectNodeBase } from './base';

import template from './templates/bitcrusher.marko';

export const NAME = 'BitCrusher';
export const TYPE = 'bitcrusher';

class BitCrusherEffectUI extends EffectUIBase {
  render() {
    this.panel = $(template.renderToString({ location: this.location }));
    $(this.target).append(this.panel);
    this.bindParameterToUI('#bits-slider', '#bits-value', 1, 16, 1, 'bits');
    this.bindParameterToUI('#normfreq-slider', '#normfreq-value', 0, 1, 0.001, 'normfreq');
    this.bindParameterToUI('#buffer-slider', '#buffer-value', 256, 16384, 1, 'bufferSize');
    this.bindBypass();
  }
}

function bitCrusherEffectParameterObject() {
  return {
    type: TYPE,
    bypass: false,
    parameters: {
      bits: 4,
      normfreq: 0.1,
      bufferSize: 256,
    },
  };
}

class BitCrusherEffectNode extends EffectNodeBase {
  constructor(tuna, po) {
    super(tuna, po);

    this.fx = new tuna.Bitcrusher({
      bits: po.parameters.bits,
      normfreq: po.parameters.normfreq,
      bufferSize: po.parameters.bufferSize,
      bypass: po.bypass,
    });
  }

  updateFromParameterObject(po) {
    this.fx.bypass = po.bypass;
    this.fx.bits = po.parameters.bits;
    this.fx.normfreq = po.parameters.normfreq;
    this.fx.bufferSize = po.parameters.bufferSize;
  }
}

export { BitCrusherEffectUI as UI, BitCrusherEffectNode as Node, bitCrusherEffectParameterObject as parameterObject };

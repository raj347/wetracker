import $ from 'jquery';
import 'jquery-ui/widgets/slider';

import Signal from '../../../utils/signal';

export class EffectUIBase {
  constructor(target, effect, location) {
    this.target = target;
    this.effect = effect;
    this.location = location;

    this.effectChanged = Signal.signal(false);
  }

  bindParameterToUI(element, textElement, min, max, step, paramName) {
    let paramSlider = this.panel.find(element).slider({
      min,
      max,
      step,
      value: this.effect.parameters[paramName],
      slide: (event, ui) => {
        this.panel.find(textElement).val(ui.value);
        this.effect.parameters[paramName] = ui.value;
        this.effectChanged(this.location, this.effect);
      }
    });
    this.panel.find(textElement).on("change", (e) => {
      paramSlider.slider("value", $(e.target).val());
      this.effect.parameters[paramName] = $(e.target).val();
      this.effectChanged(this.location, this.effect);
    });
  }
}

export class EffectParameterObjectBase {
  constructor() {
  }
}


export class EffectNodeBase {
  constructor(tuna, po) {
  }

  updateFromParameterObject(po) {
  }
}
import '@google/model-viewer';
import  Util from '@services/util.js';
import './threed-model-view.scss';

export default class ThreeDModelView {

  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({}, params);

    this.callbacks = Util.extend({
      onLoad: () => {}
    }, callbacks);

    this.buildDOM();
  }

  /**
   * Build DOM.
   * @returns {HTMLElement} DOM.
   */
  getDOM() {
    return this.dom;
  }

  buildDOM() {
    // model-viewer is custom element expected by @google/model-viewer
    this.dom = document.createElement('model-viewer');

    this.dom.classList.add('threed-model-view');
    if (this.params.className) {
      this.dom.classList.add(this.params.className);
    }

    if (this.params.size.maxWidth) {
      this.dom.style.maxWidth = this.params.size.maxWidth;
    }

    if (this.params.size.maxHeight) {
      this.dom.style.maxHeight = this.params.size.maxHeight;
    }

    this.dom.setAttribute('camera-controls', '');

    if (this.params.alt) {
      this.dom.setAttribute('alt', this.params.alt);
    }

    this.dom.setAttribute('a11y', this.buildA11y(this.params.a11y));

    this.dom.addEventListener('load', () => {
      this.callbacks.onLoad();
    });

    this.setModel(this.params.src);
  }

  /**
   * Show.
   */
  show() {
    this.dom.classList.remove('display-none');
  }

  /**
   * Hide.
   */
  hide() {
    this.dom.classList.add('display-none');
  }

  /**
   * Set model source.
   * @param {string} src Source object file path.
   */
  setModel(src) {
    if (typeof src !== 'string') {
      return;
    }

    if (
      !src.endsWith('.gltf') &&
      !src.endsWith('.glb')
    ) {
      return;
    }

    // Set model
    this.dom.setAttribute('src', src);
  }

  /**
   * Update the DOMs aspect ratio.
   */
  updateAspectRatio() {
    const dimensions = this.getDimensions();
    if (!dimensions) {
      return;
    }

    this.dom.style.aspectRatio = `${dimensions.x} / ${dimensions.y}`;
  }

  /**
   * Get dimensions of DOM.
   * @returns {object|undefined} Dimensions.
   */
  getDimensions() {
    if (!this.dom.getDimensions) {
      return; // May not be ready yet
    }

    return this.dom.getDimensions();
  }

  /**
   * Build a11y attributes.
   * @param {object} params Parameters.
   * @returns {string} A11y attributes as string.
   */
  buildA11y(params = {}) {
    const a11yProps = [
      'back', 'front', 'left', 'right',
      'lower-back', 'lower-front', 'lower-left', 'lower-right',
      'upper-back', 'upper-front', 'upper-left', 'upper-right',
      'interaction-prompt'
    ];

    const a11yAttributes = {};
    a11yProps.forEach((prop) => {
      if (params[prop]) {
        a11yAttributes[prop] = params[prop];
      }
    });

    // Set the attribute on the DOM element with the new object
    return JSON.stringify(a11yAttributes);
  }
}

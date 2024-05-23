import Util from '@services/util.js';
import H5PUtil from '@services/h5p-util.js';
import Dictionary from '@services/dictionary.js';
import ThreeDModelView from '@components/threed-model-view.js';

import '@styles/h5p-3d-model.scss';

export default class ThreeDModel extends H5P.EventDispatcher {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super();

    // Sanitize parameters
    const defaults = Util.extend({}, H5PUtil.getSemanticsDefaults());
    this.params = Util.extend(defaults, params);

    this.params = H5PUtil.processParameters(this.params);

    this.contentId = contentId;
    this.extras = extras;

    // Fill dictionary
    this.dictionary = new Dictionary();
    this.dictionary.fill({ l10n: this.params.l10n, a11y: this.params.a11y });

    this.previousState = extras?.previousState || {};

    const element = document.createElement('div');
    H5P.setSource(
      element, { path: this.params.model?.file?.path ?? '' }, this.contentId
    );

    this.model = new ThreeDModelView({
      src: element.src,
      className: 'h5p-3d-model-main',
      alt: this.params.model.alt,
      size: this.params.size,
      a11y: this.params.a11y,
    }, {
      onLoad: () => {
        this.trigger('resize');
      }
    });

    this.dom = this.model.getDOM();

    this.on('resize', () => {
      this.model.updateAspectRatio();
    });
  }

  /**
   * Attach library to wrapper.
   * @param {H5P.jQuery} $wrapper Content's container.
   */
  attach($wrapper) {
    $wrapper.get(0).classList.add('h5p-3d-model');
    $wrapper.get(0).appendChild(this.dom);
  }

  /**
   * Get task title.
   * @returns {string} Title.
   */
  getTitle() {
    // H5P Core function: createTitle
    return H5P.createTitle(
      this.extras?.metadata?.title || ThreeDModelViewer.DEFAULT_DESCRIPTION
    );
  }

  /**
   * Get description.
   * @returns {string} Description.
   */
  getDescription() {
    return ThreeDModel.DEFAULT_DESCRIPTION;
  }
}

/** @constant {string} Default description */
ThreeDModel.DEFAULT_DESCRIPTION = '3D Model';

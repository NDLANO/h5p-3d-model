import Util from '@services/util.js';
import H5PUtil from '@services/h5p-util.js';
import Dictionary from '@services/dictionary.js';
import ThreeDModelView from '@components/threed-model-view.js';
import MessageBox from '@components/messageBox/message-box.js';

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

    if (!this.params.model?.file?.path) {
      const messageBox = new MessageBox({
        text: this.dictionary.get('l10n.noModel')
      });
      this.dom = messageBox.getDOM();
      return;
    }

    // Retrieve true local source
    const element = document.createElement('div');
    H5P.setSource(
      element, { path: this.params.model?.file?.path ?? '' }, this.contentId
    );

    // Optional poster
    const poster = document.createElement('img');
    if (this.params.model?.poster?.path) {
      poster.addEventListener('load', () => {
        this.model.updateAspectRatio(
          poster.naturalWidth / poster.naturalHeight
        );

        this.trigger('resize');
      });
      H5P.setSource(
        poster, { path: this.params.model.poster.path }, this.contentId
      );
    }

    this.model = new ThreeDModelView({
      src: element.src,
      poster: poster.src,
      className: 'h5p-3d-model-main',
      alt: this.params.model.alt,
      size: this.params.size,
      a11y: this.params.a11y
    }, {
      onModelLoaded: () => {
        this.trigger('resize');
      }
    });

    this.dom = this.model.getDOM();
  }

  /**
   * Attach library to wrapper.
   * @param {H5P.jQuery} $wrapper Content's container.
   */
  attach($wrapper) {
    const wrapper = $wrapper.get(0);

    if (this.params.backgroundColor && this.params.model?.file?.path) {
      /*
       * Using custom CSS variables to allow easier customization.
       * When running standalone, the default background color of .h5p-content
       * will be overridden to allow true transparency in webpages.
       */
      const h5pContent = wrapper.closest('.h5p-content');

      if (wrapper.classList.contains('h5p-standalone') && h5pContent) {
        h5pContent.style.setProperty(
          '--h5p-3d-model-background-color', this.params.backgroundColor
        );

        h5pContent.style.backgroundColor =
          'var(--h5p-3d-model-background-color)';
      }
      else {
        wrapper.style.setProperty(
          '--h5p-3d-model-background-color', this.params.backgroundColor
        );
      }

      wrapper.style.backgroundColor =
        'var(--h5p-3d-model-background-color)';
    }

    wrapper.classList.add('h5p-3d-model');
    wrapper.appendChild(this.dom);
  }

  /**
   * Get task title.
   * @returns {string} Title.
   */
  getTitle() {
    // H5P Core function: createTitle
    return H5P.createTitle(
      this.extras?.metadata?.title || ThreeDModel.DEFAULT_DESCRIPTION
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

import { EmbedBlot } from 'parchment';
import { escapeText } from '../blots/text.js';
import { sanitize } from './link.js';

const ATTRIBUTES = ['alt', 'height', 'width'];
// Exported data URLs are limited to raster images; SVG and other types are not.
const SAFE_DATA_IMAGE = /^\s*data:image\/(png|jpe?g|gif|webp|bmp|avif)[;,]/i;
const UNSAFE_SRC = '//:0';

class Image extends EmbedBlot {
  static blotName = 'image';
  static tagName = 'IMG';

  static create(value: string) {
    const node = super.create(value) as Element;
    if (typeof value === 'string') {
      node.setAttribute('src', this.sanitize(value));
    }
    return node;
  }

  static formats(domNode: Element) {
    return ATTRIBUTES.reduce(
      (formats: Record<string, string | null>, attribute) => {
        if (domNode.hasAttribute(attribute)) {
          formats[attribute] = domNode.getAttribute(attribute);
        }
        return formats;
      },
      {},
    );
  }

  static match(url: string) {
    return /\.(jpe?g|gif|png)$/.test(url) || /^data:image\/.+;base64/.test(url);
  }

  static sanitize(url: string) {
    return sanitize(url, ['http', 'https', 'data']) ? url : UNSAFE_SRC;
  }

  static value(domNode: Element) {
    return domNode.getAttribute('src');
  }

  domNode: HTMLImageElement;

  html() {
    const { domNode } = this;
    let src = Image.sanitize(domNode.getAttribute('src') ?? '');
    if (/^\s*data:/i.test(src) && !SAFE_DATA_IMAGE.test(src)) {
      src = UNSAFE_SRC;
    }
    const attributes = ['src', ...ATTRIBUTES].map((name) => {
      const value = name === 'src' ? src : domNode.getAttribute(name);
      return value == null ? '' : ` ${name}="${escapeText(value)}"`;
    });
    return `<img${attributes.join('')}>`;
  }

  format(name: string, value: string) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

export default Image;

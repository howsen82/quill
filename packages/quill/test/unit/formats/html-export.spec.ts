import {
  createScroll as baseCreateScroll,
  createRegistry,
} from '../__helpers__/factory.js';
import { BlockEmbed } from '../../../src/blots/block.js';
import Editor from '../../../src/core/editor.js';
import Formula from '../../../src/formats/formula.js';
import Image from '../../../src/formats/image.js';
import Link from '../../../src/formats/link.js';
import Video from '../../../src/formats/video.js';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

const createEditor = (html: string) =>
  new Editor(
    baseCreateScroll(html, createRegistry([Formula, Image, Link, Video])),
  );

const exportHTML = (editor: Editor) =>
  editor.getHTML(0, editor.scroll.length());

describe('HTML export escaping', () => {
  beforeEach(() => {
    // @ts-expect-error
    window.katex = { render: () => {} };
  });

  afterEach(() => {
    // @ts-expect-error
    delete window.katex;
  });

  test('formula', () => {
    const editor = createEditor('<p><br></p>');
    editor.insertEmbed(0, 'formula', '<img src=x onerror=alert(1)>');
    const html = exportHTML(editor);
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  test('video', () => {
    const editor = createEditor('<p><br></p>');
    editor.insertEmbed(
      0,
      'video',
      'https://example.com/"onmouseover="alert(1)',
    );
    const html = exportHTML(editor);
    expect(html).not.toContain('"onmouseover=');
    expect(html).toContain('&quot;onmouseover=');
  });

  test('video loaded from DOM with unsafe protocol', () => {
    const editor = createEditor(
      '<iframe class="ql-video" src="javascript:alert(1)"></iframe>',
    );
    const html = exportHTML(editor);
    expect(html).not.toContain('javascript:');
    expect(html).toContain('<a href="about:blank">about:blank</a>');
  });

  test('image loaded from DOM drops unknown attributes', () => {
    const editor = createEditor(
      '<p><img src="https://example.com/a.png" alt="a" onerror="alert(1)" onload="alert(2)"></p>',
    );
    expect(exportHTML(editor)).toBe(
      '<p><img src="https://example.com/a.png" alt="a"></p>',
    );
  });

  test('image loaded from DOM with unsafe src', () => {
    const editor = createEditor('<p><img src="javascript:alert(1)"></p>');
    const html = exportHTML(editor);
    expect(html).not.toContain('javascript:');
    expect(html).toContain('src="//:0"');
  });

  test('link loaded from DOM with unsafe href', () => {
    const editor = createEditor(
      '<p><a href="javascript:alert(1)">link</a></p>',
    );
    const html = exportHTML(editor);
    expect(html).not.toContain('javascript:');
    expect(html).toContain('href="about:blank"');
  });

  test('link href with obfuscated protocol', () => {
    const editor = createEditor(
      '<p><a href="java&#9;script:alert(1)">link</a></p>',
    );
    expect(exportHTML(editor)).toContain('href="about:blank"');
  });

  test('event handler attributes on blocks are dropped', () => {
    const editor = createEditor('<p onclick="alert(1)" class="ql-x">text</p>');
    const html = exportHTML(editor);
    expect(html).not.toContain('onclick');
    expect(html).toContain('<p class="ql-x">text</p>');
  });

  test('attribute values are escaped', () => {
    const editor = createEditor('<p><br></p>');
    editor.scroll.domNode
      .querySelector('p')
      ?.setAttribute('title', '"><script>alert(1)</script>');
    const html = exportHTML(editor);
    expect(html).not.toContain('<script>');
    expect(html).toContain('title="&quot;&gt;&lt;script&gt;');
  });

  test('ping and srcdoc attributes are dropped', () => {
    const editor = createEditor(
      '<p><a href="https://example.com" ping="https://evil.example">x</a></p>',
    );
    expect(exportHTML(editor)).not.toContain('ping');
  });

  test('inline styles with external resources are dropped', () => {
    const editor = createEditor(
      '<p style="background: url(https://evil.example/x)">a</p>' +
        '<p style="background: u\\72l(https://evil.example/x)">b</p>' +
        '<p style="color: red">c</p>',
    );
    const html = exportHTML(editor);
    expect(html).not.toContain('evil.example');
    expect(html).toContain('<p style="color: red">c</p>');
  });

  test('image data URLs are limited to raster images', () => {
    const editor = createEditor(
      '<p><img src="data:image/svg+xml;base64,AAAA"></p>' +
        '<p><img src="data:text/html;base64,AAAA"></p>' +
        '<p><img src="data:image/png;base64,AAAA"></p>',
    );
    const html = exportHTML(editor);
    expect(html).not.toContain('svg+xml');
    expect(html).not.toContain('text/html');
    expect(html).toContain('src="data:image/png;base64,AAAA"');
  });

  test('embeds without their value attribute do not throw', () => {
    const editor = createEditor(
      '<p><span class="ql-formula"></span></p>' +
        '<iframe class="ql-video"></iframe>',
    );
    expect(() => exportHTML(editor)).not.toThrow();
  });

  test('custom blots cannot export scripts or unsafe attributes', () => {
    class CustomEmbed extends BlockEmbed {
      static blotName = 'custom-embed';
      static className = 'x-custom';
      static tagName = 'DIV';
    }
    const editor = new Editor(
      baseCreateScroll(
        '<div class="x-custom" onclick="alert(1)">' +
          '<script>alert(1)</script><style>p{}</style>' +
          '<iframe srcdoc="<script>alert(2)</script>"></iframe>' +
          '<b srcdoc="y" data="javascript:alert(3)">ok</b></div>',
        createRegistry([CustomEmbed]),
      ),
    );
    const html = exportHTML(editor);
    expect(html).not.toMatch(/script|style|iframe|srcdoc|onclick|javascript:/);
    expect(html).toContain('<b data="about:blank">ok</b>');
  });
});

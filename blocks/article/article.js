import { getAEMPublish, getAEMAuthor } from '../../scripts/endpointconfig.js';

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

function getFallbackArticle(block) {
  const title = block.querySelector('h1, h2, h3, h4, h5')?.textContent?.trim() || 'Article';
  const description = block.querySelector('p')?.textContent?.trim()
    || 'Article content is available in the authored document.';

  return {
    title,
    content: {
      plaintext: description,
    },
  };
}

/* eslint-disable no-underscore-dangle */
export default async function decorate(block) {
  const aempublishurl = getAEMPublish();
  const aemauthorurl = getAEMAuthor();
  const persistedquery = '/graphql/execute.json/aem-boilerplate-frescopa/ArticleByPath';
  const sourceLink = block.querySelector('a[href]');
  const rawArticlePath = sourceLink
    ? new URL(sourceLink.href, window.location.origin).pathname
    : '';
  const articlepath = rawArticlePath || block.dataset?.path || '';
  const variationname = block.querySelector(':scope div:nth-child(2) > div')?.textContent?.trim() || 'main';

  if (!articlepath || (!aempublishurl && !aemauthorurl)) {
    const fallback = getFallbackArticle(block);
    block.innerHTML = `
      <div class='article-content' data-aue-type='text'>
        <div>
          <h4 class='title'>${escapeHtml(fallback.title)}</h4>
          <p class='content'>${escapeHtml(fallback.content.plaintext)}</p>
        </div>
      </div>
    `;
    return;
  }

  const baseUrl = window.location
    && window.location.origin
    && window.location.origin.includes('author')
    ? aemauthorurl
    : aempublishurl;

  const url = `${baseUrl}${persistedquery};path=${articlepath};variation=${variationname};ts=${Date.now()}`;

  let cfReq = getFallbackArticle(block);

  try {
    console.log('Article Path:', articlepath);
    console.log('Variation:', variationname);
    console.log('Fetch URL:', url);

    const response = await fetch(url, {
      credentials: 'include',
    });

    console.log('Response Status:', response.status);

    const contentfragment = await response.json();

    console.log('GraphQL Response:', contentfragment);

    const item = contentfragment?.data?.ArticleByPath?.item;

    if (item) {
      cfReq = item;
      console.log('CF Item:', cfReq);
    } else {
      console.warn('No item returned from GraphQL');
    }
  } catch (error) {
    console.error('Content Fragment Fetch Error:', error);
  }

  const itemId = `urn:aemconnection:${articlepath}/jcr:content/data/${variationname}`;

  block.innerHTML = `
    <div class='article-content' data-aue-resource="${itemId}" data-aue-label="article content fragment" data-aue-type="reference" data-aue-filter="cf">
      <div>
        <h4 data-aue-prop="title" data-aue-label="title" data-aue-type="text" class='title'>${escapeHtml(cfReq.title || 'Article')}</h4>
        <p data-aue-prop="content" data-aue-label="content" data-aue-type="richtext" class='content'>${escapeHtml(cfReq.content?.plaintext || cfReq.content || 'Article content is available in the authored document.')}</p>
      </div>
    </div>
  `;
}

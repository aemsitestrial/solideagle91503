import { createOptimizedPicture } from '../../scripts/aem.js';

function renderPosts(container, posts) {
  posts.forEach((post) => {
    if (!post || (!post.path && !post.href)) {
      return;
    }

    const eager = false;
    const title = post.title || 'Article';
    const href = post.path || post.href;
    const image = post.image || post.thumbnail || '';
    const li = document.createElement('li');
    const picture = image
      ? createOptimizedPicture(image, title, eager, [{ width: '300' }])
      : null;
    const pictureTag = picture ? picture.outerHTML : '';

    li.innerHTML = `
      <a href="${href}">
        ${pictureTag}
        <h5>${title}</h5>
      </a>
    `;
    container.append(li);
  });
}

export default async function decorate(block) {
  const container = document.createElement('ul');

  try {
    const indexResponse = await fetch('/../query-index.json');
    if (indexResponse.ok) {
      const index = await indexResponse.json();
      const posts = Array.isArray(index?.data)
        ? index.data.filter((post) => post?.category === 'blog')
        : [];
      if (posts.length) {
        renderPosts(container, posts);
        block.append(container);
        return;
      }
    }
  } catch (error) {
    // Fall back to any authored content already present in the block.
  }

  const authoredLinks = [...block.querySelectorAll('a[href]')].map((link) => ({
    path: link.getAttribute('href'),
    title: link.textContent.trim() || 'Article',
    image: link.querySelector('img')?.getAttribute('src') || '',
  }));

  if (authoredLinks.length) {
    renderPosts(container, authoredLinks);
  }

  block.append(container);
}

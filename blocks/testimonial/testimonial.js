export default function decorate(block) {
  const showEyebrow = block.children[0]?.textContent?.trim().toLowerCase() === 'true';

  const eyebrow = block.children[1]?.firstElementChild;
  const quotation = block.children[2]?.firstElementChild;

  const showAttribution = block.children[3]?.textContent?.trim().toLowerCase() === 'true';

  const attribution = block.children[4]?.firstElementChild;

  const wrapper = document.createElement('div');
  wrapper.className = 'quote-wrapper';

  if (
    showEyebrow
    && eyebrow
    && eyebrow.textContent.trim()
  ) {
    eyebrow.className = 'quote-eyebrow';
    wrapper.append(eyebrow);
  }

  if (quotation) {
    quotation.className = 'quote-text';
    wrapper.append(quotation);
  }

  if (
    showAttribution
    && attribution
    && attribution.textContent.trim()
  ) {
    attribution.className = 'quote-attribution';
    wrapper.append(attribution);
  }

  block.innerHTML = '';
  block.append(wrapper);
}

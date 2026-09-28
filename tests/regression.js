// Run in a real browser, without dependencies or a ChatGPT login.
document.addEventListener('DOMContentLoaded', async () => {
  const main = document.querySelector('main');
  const results = document.getElementById('results');
  const passed = [];
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const headings = () => Array.from(document.querySelectorAll('.toc-text'), e => e.textContent);
  const waitFor = async predicate => {
    for (let i = 0; i < 60; i++) {
      if (predicate()) return;
      await pause(50);
    }
    throw new Error('Timed out waiting for TOC update');
  };
  const check = async (name, run) => {
    await run();
    passed.push(name);
    results.textContent = passed.map(name => `PASS ${name}`).join('\n');
  };
  const modern = (prompt, title) => `
    <div data-user-message-bubble="true">${prompt}</div>
    <div data-content-search-unit-key="turn:assistant">
      <h4 class="sr-only" data-conversation-role="assistant">ChatGPT said:</h4>
      <div data-chatgpt-selection-message-id="message">
        <div data-markdown-text-style="assistant-message"><h2>${title}</h2></div>
      </div>
    </div>`;
  try {
    await check('Empty page initializes without waiting for a reply', async () => {
      assert(document.querySelector('.toc-empty').textContent === 'No responses found', 'Missing empty state');
    });
    await check('Current ChatGPT markup without legacy role attributes', async () => {
      main.innerHTML = modern('Current prompt', 'Current heading');
      await waitFor(() => headings().includes('Current heading'));
      assert(headings().length === 1, 'Screen-reader role heading leaked into TOC');
      assert(document.querySelector('.toc-group-prompt').textContent === 'Current prompt', 'Prompt missing');
    });
    await check('Legacy markup and nested modern markup do not duplicate replies', async () => {
      main.innerHTML = '<div data-message-author-role="user">Legacy prompt</div><div data-message-author-role="assistant"><div data-markdown-text-style="assistant-message"><h2>Legacy heading</h2><h3>Child heading</h3></div></div>';
      await waitFor(() => headings().includes('Legacy heading'));
      assert(document.querySelectorAll('.toc-group-header').length === 1, 'Duplicated reply');
      assert(headings().length === 2, 'Headings missing');
    });
    await check('One prompt can have multiple replies and markdown blocks', async () => {
      main.innerHTML = modern('First prompt', 'First heading') + '<div data-markdown-text-style="assistant-message"><h2>Second reply</h2></div>';
      main.querySelector('[data-chatgpt-selection-message-id]').insertAdjacentHTML('beforeend', '<div data-markdown-text-style="assistant-message"><h3>Another block</h3></div>');
      await waitFor(() => headings().includes('Second reply'));
      assert(document.querySelectorAll('.toc-group-header').length === 2, 'Blocks not grouped by message');
      assert(Array.from(document.querySelectorAll('.toc-group-prompt')).every(e => e.textContent === 'First prompt'), 'Prompt paired by array index');
    });
    await check('User headings and unrelated markdown are excluded', async () => {
      main.innerHTML = '<div class="markdown"><h2>Unrelated</h2></div><div data-user-message-bubble="true"><h2>User heading</h2></div><div data-markdown-text-style="assistant-message"><h2>Assistant only</h2></div>';
      await waitFor(() => headings().includes('Assistant only'));
      assert(headings().join() === 'Assistant only', 'Included non-assistant headings');
    });
    await check('Earlier replies update even when the last reply is unchanged', async () => {
      main.innerHTML = modern('Prompt', 'Earlier') + '<div data-markdown-text-style="assistant-message"><h2>Unchanged last reply</h2></div>';
      await waitFor(() => headings().includes('Earlier'));
      main.querySelector('h2').firstChild.data = 'Edited earlier heading';
      await waitFor(() => headings().includes('Edited earlier heading'));
    });
    await check('Streaming text, heading insertion, and heading removal update', async () => {
      const reply = main.querySelector('[data-markdown-text-style]');
      reply.insertAdjacentHTML('beforeend', '<h3>Streaming</h3>');
      await waitFor(() => headings().includes('Streaming'));
      reply.querySelector('h3').firstChild.data = 'Streaming complete';
      await waitFor(() => headings().includes('Streaming complete'));
      reply.querySelector('h3').remove();
      await waitFor(() => !headings().includes('Streaming complete'));
    });
    await check('Opening the sidebar refreshes immediately', async () => {
      main.innerHTML = modern('Open prompt', 'Immediate refresh');
      document.getElementById('chatgpt-toc-toggle').click();
      assert(headings().includes('Immediate refresh'), 'Open did not refresh');
    });
    await check('HTML-looking prompts and headings remain literal text', async () => {
      main.innerHTML = modern('&lt;img src=x&gt;', '&lt;b&gt;literal&lt;/b&gt; &amp; text');
      await waitFor(() => headings().includes('<b>literal</b> & text'));
      assert(!document.querySelector('#toc-content img, #toc-content b'), 'Text interpreted as HTML');
    });
    await check('Same-text DOM replacement refreshes navigation targets', async () => {
      main.innerHTML = modern('Navigation', 'Target');
      await waitFor(() => headings().includes('Target'));
      const oldHeading = main.querySelector('h2');
      main.innerHTML = modern('Navigation', 'Target');
      const newHeading = main.querySelector('h2');
      let target = null;
      oldHeading.scrollIntoView = () => { target = oldHeading; };
      newHeading.scrollIntoView = () => { target = newHeading; };
      await pause(350);
      document.querySelector('.toc-item').click();
      assert(target === newHeading, 'Navigation points to removed DOM');
    });
    await check('Replies without headings have a distinct empty state', async () => {
      main.innerHTML = '<div data-markdown-text-style="assistant-message"><p>Plain answer</p></div>';
      await waitFor(() => document.querySelector('.toc-empty')?.textContent === 'No headings in this response');
    });
    await check('Navigation clears collapse state even when reply text matches', async () => {
      main.innerHTML = modern('Same prompt', 'Same heading');
      await waitFor(() => headings().includes('Same heading'));
      document.querySelector('.toc-group-collapse-icon').click();
      assert(document.querySelector('.toc-group-content').style.display === 'none', 'Collapse failed');
      history.pushState({}, '', 'regression-other');
      await waitFor(() => document.querySelector('.toc-group-content').style.display === 'block');
      history.replaceState({}, '', 'regression.html');
    });
    await check('Removing all replies clears stale TOC entries', async () => {
      main.replaceChildren();
      await waitFor(() => document.querySelector('.toc-empty')?.textContent === 'No responses found');
      assert(headings().length === 0, 'Stale headings');
    });
    await check('Late role attributes trigger detection', async () => {
      main.innerHTML = '<div id="late-reply"><h2>Late reply</h2></div>';
      await pause(300);
      main.firstElementChild.setAttribute('data-markdown-text-style', 'assistant-message');
      await waitFor(() => headings().includes('Late reply'));
    });
    await check('TOC mutations do not trigger an observer rendering loop', async () => {
      await pause(350);
      let writes = 0;
      const observer = new MutationObserver(() => writes++);
      observer.observe(document.getElementById('toc-content'), { childList: true, subtree: true });
      main.querySelector('h2').insertAdjacentHTML('afterend', '<p>Body-only change</p>');
      await pause(650);
      observer.disconnect();
      assert(writes === 0, `Unnecessary TOC renders: ${writes}`);
    });
    results.textContent += `\n\n${passed.length} tests passed.`;
    document.title = `PASS: ${passed.length} TOC regression tests`;
  } catch (error) {
    results.textContent += `\nFAIL: ${error.stack}`;
    document.title = 'FAIL: TOC regression tests';
  }
});

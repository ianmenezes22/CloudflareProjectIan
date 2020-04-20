let index = 0;

//https://github.com/watson/roundround/blob/master/index.js
const roundRobin = function (array, _index) {
  index = _index || 0;

  if (array === undefined || array === null)
    array = [];
  else if (!Array.isArray(array))
    throw new Error('Expecting argument to RoundRound to be an Array');

  return function () {
    if (index >= array.length) index = 0;
    return array[index++];
  };
};

//https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-171.php
const parseCookie = str =>
  str
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});


let nextTarget = async function () {
  const response = await fetch(`https://cfw-takehome.developers.workers.dev/api/variants`)
    .then(response => response.json())

  let next = roundRobin(response.variants, index);
  return next();
};


class ElementHandler {
  constructor(text) {
    this.textReplacement = text;
  }

  element(element) {
    // An incoming element, such as `div`
    // console.log(`Incoming element: ${element.tagName}, ${element}`)
    element.setInnerContent(this.textReplacement)
  }
}

class AttributeRewriter {
  constructor(attributeName) {
    this.attributeName = attributeName
  }

  element(element) {
    const attribute = element.getAttribute(this.attributeName)
    if (attribute) {
      element.setAttribute(
        this.attributeName,
        attribute.replace('https://cloudflare.com', 'https://www.linkedin.com/in/ianmenezes22/')
      )
    }
  }
}

const rewriter = new HTMLRewriter()
  .on('title', new ElementHandler(`Cloudflare Project`))
  .on('h1', new ElementHandler(`Ian Menezes`))
  .on('p', new ElementHandler(`MCS student at NCSU`))
  .on('a', new ElementHandler('Checkout my LinkedIn Profile'))
  .on('a', new AttributeRewriter('href'))


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  let cookieString = request.headers.get('Cookie')
  let url = null;

  if (cookieString) {
    let cookies = parseCookie(cookieString);
    if (cookies.url) {
      url = cookies.url;
    }
  }
  if (!url) {
    url = await nextTarget();
  }

  console.log('Fetching URL', url);

  let response = await fetch(url);
  let transformedHtml = rewriter.transform(response);

  return new Response(await transformedHtml.text(), {
    headers: {
      'content-type': 'text/html',
      'Set-Cookie': `url=${url}`
    },
  })
}

# goofy-postcard

## Steps to follow

### Show site running with `netlify dev`

### Content model setup (Stefan)

![Content model](./static/content-model.png)

### Create entries (Stefan)

@stefan Use the assets that are already in the space

### Build GQL query

Collection:

```
query {
  postcardOptionCollection {
    items {
      sys {
        id
      }
      title
      greeting
      image {
        title
        url
      }
    }
  }
}
```

Single:

```
query($typeId: String!) {
  postcardOption(id: $typeId) {
    title
    greeting
    image {
      title
      url
      width
      height
    }
  }
}
```

### Edit and adjust `index.html` to fetch Contentful data (Stefan)

⚠️ Reuse the `renderItems` function.

```javascript
async function renderForm() {
  try {
    const query = `
          query {
            postcardOptionCollection {
              items {
                sys {
              id
            }
            title
            greeting
                image {
              title
              url
            }
          }
        }
      }
      `;

    const response = await window.fetch(
      `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${CONTENTFUL_CDA_TOKEN}`,
        },
        body: JSON.stringify({ query }),
      }
    );

    const { data } = await response.json();
    const { items } = data.postcardOptionCollection;

    renderItems(items);
  } catch (error) {
    console.log(error);
  }
}
```

### Handover to Jason for setting up serverless function (Jason)

Install dependencies and set up `package.json`.

```bash
npm init --yes
npm install cross-fetch
```

⚠️ Set up environment variables in Netlify.

```javascript
// netlify/functions/postcard.js
const fetch = require("cross-fetch");
const { CONTENTFUL_SPACE, CONTENTFUL_TOKEN } = process.env;

async function handler(event, _context) {
  const { type, message } = event.queryStringParameters;
  console.log(type, message);
  return {
    statusCode: 200,
  };
}

exports.handler = handler;
```

⚠️ Point `index.html` form to `/.netlify/functions/postcard` and see log of `type` and `message`!

Add Contentful fetching and rendering.

```javascript
const fetch = require("cross-fetch");
const { CONTENTFUL_SPACE, CONTENTFUL_TOKEN } = process.env;

async function handler(event, _context) {
  const { type: typeId, message } = event.queryStringParameters;

  const query = `
    query($typeId: String!) {
      postcardOption(id: $typeId) {
        title
        greeting
        image {
          title
          url
          width
          height
        }
      }
    }
  `;

  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${CONTENTFUL_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          typeId,
        },
      }),
    }
  );

  const { data: entry } = await response.json();
  const { greeting, title, image } = entry.postcardOption;

  return {
    statusCode: 200,

    body: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Here's a post card for you!</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div class="background">
          <div class="postcard">
            <figure>
              <img
                src="${image.url}"
                width=${image.width}
                height=${image.height}
                alt="${image.title} "
              />
              <figcaption>${title}: "${greeting}"</figcaption>
            </figure>
            <div class="message">${decodeURIComponent(
              message.replace(/\+/g, " ")
            )}</div>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

exports.handler = handler;
```

### Moving to on-demand handlers - set up redirects (Jason)

Discuss the query param topic...

Set up `_redirects`. _Note that we're still pointing to `/.netlify/functions/postcard`_.

```
/generated/postcard type=:type message=:message /postcard/:type/message/:message 301!
/postcard/:type/message/:message /.netlify/functions/postcard 200
```

And change the form to point to `/generated/postcard`.

### Make serverless function on-demand (Jason)

Install functions plugin.

```bash
npm install @netlify/functions
```

Make function on-demand.

```javascript
const { builder } = require("@netlify/functions");

// ... all the stuff

exports.handler = builder(handler);
```

Update `_redirects` to points to `generated`.

```
/generated/postcard type=:type message=:message /postcard/:type/message/:message 301!
/postcard/:type/message/:message /.netlify/generated/postcard 200
```

Change to URL parsing instead of queryParam parsing.

```javascript
async function handler(event, _context) {
  const { path } = event;
  const [, , typeId, , message] = path.split("/");

  // more stuff ...
}
```

### Wrap up! We made it!

Good job! We dit it. 🎉

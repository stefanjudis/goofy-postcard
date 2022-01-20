const fetch = require('cross-fetch');
const { builder } = require('@netlify/functions');

async function handler(event) {
  // /postcard/:type/message/:message
  const { path } = event;
  const [, , typeId, , message] = path.split('/');

  const query = `
    query($typeId: String!) {
      postcardOption(id: $typeId) {
        sys {
          id
        }
        title
        greeting
        image {
          width
          height
          url
          title
        }
      }
    }
  `;

  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE}/environments/go-live`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.CONTENTFUL_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          typeId,
        },
      }),
    },
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
              message.replace(/\+/g, ' '),
            )}</div>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

exports.handler = builder(handler);

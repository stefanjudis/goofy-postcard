const fetch = require("cross-fetch");
const { builder } = require("@netlify/functions");
const { CONTENTFUL_SPACE, CONTENTFUL_TOKEN } = process.env;

async function handler(event, _context) {
  const { path } = event;
  // @JASON is there a better way than Regex to fiddle things out of the URL?
  const parsedUrl = /\/postcard\/(?<type>.*?)\/message\/(?<message>.*?)$/.exec(
    path
  );

  const { groups } = parsedUrl;
  const { message, type: typeId } = groups;

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
      </head>
      <body>
        <img
          src="${image.url}"
          width=${image.width}
          height=${image.height}
          alt="${image.title} ">
        <p>${title} "${greeting}"</p>
        <div>${decodeURIComponent(message.replace(/\+/g, " "))}</div>
      </body>
      </html>
    `,
  };
}

exports.handler = builder(handler);

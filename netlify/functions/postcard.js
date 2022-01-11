const fetch = require("cross-fetch");
const { builder } = require("@netlify/functions");

async function handler(event, context) {
  const { queryStringParameters } = event;
  const { type: typeId, message } = queryStringParameters;

  console.log(event);

  const query = `
    query {
      postcardOption(id: "${typeId}") {
        title
        greeting
        image {
          title
          url
        }
      }
    }`;

  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/tldd7x6v2iqj`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer QWsWpZckweHt7DXGe8qBhFLI_MPwnaIZUKLSAAzDj4I`,
      },
      body: JSON.stringify({ query }),
    }
  );

  const { data: entry } = await response.json();

  return {
    statusCode: 200,

    body: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
      </head>
      <body>
        <img src="${entry.postcardOption.image.url}" alt="jooo">
        <div>${message}</div>
      </body>
      </html>
    `,
  };
}

exports.handler = builder(handler);

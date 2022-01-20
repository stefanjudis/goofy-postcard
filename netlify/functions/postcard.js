async function handler(event) {
  return {
    statusCode: 200,
    body: "hello world",
  };
}

exports.handler = handler;

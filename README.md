# goofy-postcard

## Steps to follow

### Content model setup (Stefan)

### Create entries (Stefan)

### Show `netlify dev` and ask Jason about (Stefan)

### Edit and adjust `index.html` (Stefan)

#### Make GQL request with plain `fetch`

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

renderForm();
```

#### Render form (Stefan)

```javascript
function renderItems(items) {
  document.body.innerHTML = `
    <h1>#teamBunnies vs. #teamHippos</h1>
    <form method="get" action="/generated/postcard">
      ${items
        .map(
          (item) => `
          <label for=${item.sys.id}>${item.title}</label>
          <input id=${item.sys.id} value="${item.sys.id}" type="radio" name="type">
        `
        )
        .join("")}
      <label for="message">Message</label>
      <textarea name="message" id="message" required></textarea>

      <button type="submit">Create postcard</button>
      </form >
    `;
}
```

### Handover to Jason to set up serverless function (Jason)

### Set up redirects (Jason)

### Make serverless function on-demand (Jason)

### Wrap up! We made it!

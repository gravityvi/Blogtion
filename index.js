const { Client } = require('@notionhq/client');
const notionToMd = require('notion-to-md');
const notionSecretKey = process.env['NOTION_SECRET_KEY']
const notionDatabaseId = process.env['NOTION_DATABASE_ID'];

const notion = new Client({ auth: notionSecretKey });

const md = new notionToMd({notionClient:notion});


/*
const mdblocks = await n2m.pageToMarkdown("target_page_id");
  const mdString = n2m.toMarkdownString(mdblocks);

  //writing to file
  fs.writeFile("test.md", mdString, (err) => {
    console.log(err);
  });.
*/

async function convertToMd(pageIds) {
  const mdBlocks = await Promise.all(pageIds.map(pageId=>md.pageToMarkdown(pageId)));
  const mdStrings = mdBlocks.map(mdBlock=>md.toMarkdownString(mdBlock));
  return mdStrings;
}

async function getPublishedPages() {
  const result = (await notion.databases.query({
    database_id: notionDatabaseId,
    filter: {
      or: [
        {
          property: 'status',
          select: {
            equals: 'done'
          }
        }
      ]
    }
  })).results;

  const pageIds = result.map(page => page.id);

  return pageIds;

}



getPublishedPages()
  .then(pageIds => convertToMd(pageIds))
  .then(result=>console.log(result));

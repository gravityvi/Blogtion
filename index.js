const {md,notion} = require('./config');
const {uploadToRepo} = require('./github');
const notionDatabaseId = process.env['NOTION_DATABASE_ID'];


async function convertToMd(pageIds) {
  const mdBlocks = await Promise.all(pageIds.map(pageId => md.pageToMarkdown(pageId)));
  const mdStrings = mdBlocks.map(mdBlock => md.toMarkdownString(mdBlock));
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
  .then(pageIds =>
  convertToMd(pageIds))
  .then(data=>{
    paths = [];
    data.forEach(d=>paths.push('james-2.md'));
    return uploadToRepo(data,paths);
  }).catch(err=>console.log(err));

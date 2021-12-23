const {md,notion} = require('./config');
const {uploadToRepo} = require('./github');
const notionDatabaseId = process.env['NOTION_DATABASE_ID'];
const githubPath = process.env['GITHUB_FILE_PATH'];


async function convertToMd(pageObjects) {
  const mdBlocks = await Promise.all(pageObjects.map(({id}) => md.pageToMarkdown(id)));
  const pages = mdBlocks.map((mdBlock,index) => {
    return {
      name: pageObjects[index].name,
      content: `---\n title: ${pageObjects[index].name}\n date: ${new Date().toISOString()}\n---\n\n `+md.toMarkdownString(mdBlock)
    }
  });
  return pages;
}

async function getPublishedPages() {
  const {results} = await notion.databases.query({
    database_id: notionDatabaseId,
    filter: {
      and: [
        {
          property: 'status',
          select: {
            equals: 'done'
          }
        },
        {
          property: 'title',
          text:{
            is_not_empty:true
          }
        }
      ]
    }
  });

  const pageObjects = results.map((page) => {
    return {
      id: page.id,
      name: page.properties['Name'].title[0].plain_text
    }
  });
   

  return pageObjects;

}



getPublishedPages()
  .then(pageIds =>
  convertToMd(pageIds))
  .then(data=>{
    console.log(data);
    const paths = [];
    data.forEach(d=>paths.push(`${githubPath}${d.name}.md`));
    return uploadToRepo(data.map(d=>d.content),paths);
  }).catch(err=>console.log("[ERROR] ",err));

const { Client } = require('@notionhq/client');
const notionToMd = require('notion-to-md');
const { Octokit } = require('@octokit/rest');
const notionSecretKey = process.env['NOTION_SECRET_KEY']

const githubAccessToken = process.env['GITHUB_ACCESS_TOKEN'];



const notion = new Client({ auth: notionSecretKey });
const md = new notionToMd({ notionClient: notion });
const octo = new Octokit({ auth: githubAccessToken });

module.exports = {
  notion,
   md,
  octo,
}

const {octo} = require('./config');

const owner = process.env['GITHUB_USER_NAME'];
const repo = process.env['GITHUB_REPO_NAME'];
const branch = process.env['GITHUB_BRANCH_NAME']

async function uploadToRepo(files, filePaths) {
  const currentCommit = await getCurrentCommit();
  const filesBlobs = await Promise.all(files.map(createBlobForFile));
  const newTree = await createNewTree(
    filesBlobs,
    filePaths,
    currentCommit.treeSha,
  );
  const commitMessage = `My commit message`
  const newCommit = await createNewCommit(
    commitMessage, newTree.sha, currentCommit.commitSha
  )
  await setBranchToCommit(newCommit.sha)
}

async function getCurrentCommit() {
  const { data: refData } = await octo.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const commitSha = refData.object.sha
  const {data: commitData} = await octo.git.getCommit({
  owner,
  repo,
  commit_sha: commitSha
});
  
return {
  commitSha,
  treeSha: commitData.tree.sha
}
}

async function createBlobForFile(content) {
  const blobData = await octo.git.createBlob({
    owner,
    repo,
    content,
    encoding: 'utf-8'
  });
  return blobData.data;
}

async function createNewTree(blobs, paths, parentTreeSha) {
 const tree = blobs.map(({ sha }, index) => ({
    path: paths[index],
    mode: `100644`,
    type: `blob`,
    sha,
  }));
  const { data } = await octo.git.createTree({
    owner,
    repo,
    tree,
    base_tree: parentTreeSha
  });
  return data;
}

async function createNewCommit(message, currentTreeSha, currentCommitSha) {
  
  const result = await octo.git.createCommit({
    owner,
    repo,
    message,
    tree: currentTreeSha,
    parents: [currentCommitSha],
  });

  return result.data;
}

function setBranchToCommit(commitSha) {
  return octo.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: commitSha
  });
}

module.exports= {
  uploadToRepo
}
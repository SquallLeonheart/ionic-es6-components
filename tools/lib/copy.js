import ncp from 'ncp';

export default (source, dest, ignoreErrors) => new Promise((resolve, reject) => {
  let actionOnErr = ignoreErrors ? resolve : reject;
  ncp(source, dest, err => err ? actionOnErr(err) : resolve());
});

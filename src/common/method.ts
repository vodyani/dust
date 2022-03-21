export function getRelativePath(absolutePath: string, currentPath: string) {
  const relativePath = absolutePath.split('/');
  const currentAbsolutePath = currentPath.split('/');

  relativePath.shift();
  currentAbsolutePath.shift();

  let num = 0;

  for (let i = 0; i < relativePath.length; i++) {
    if (relativePath[i] === currentAbsolutePath[i]) {
      num++;
    } else {
      break;
    }
  }

  relativePath.splice(0, num);
  currentAbsolutePath.splice(0, num);

  let str = '';

  for (let j = 0; j < currentAbsolutePath.length - 1; j++) {
    str += '../';
  }

  if (!str) {
    str += './';
  }

  str += relativePath.join('/');

  return str;
}

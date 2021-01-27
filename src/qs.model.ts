import {
  types,
  getChildType,
  applySnapshot,
  Instance,
  onSnapshot,
  onPatch,
  IJsonPatch,
} from 'mobx-state-tree';

// This is the gist of the codesandbox:

/**
 * QueryStringModel synchronizes between the properties of the mobx state treel model and the url
 * the synchornization is unidirectional, from MST to URL only, although MST does load
 * it's initial values from the URL.
 */
export const QueryStringModel = types.model({}).actions((self) => ({
  afterCreate() {
    applySnapshot(self, parseUrl(self));
    onPatch(self, changeUrl(self));
  },
}));

function parseUrl<T>(self: Instance<T>) {
  console.log('--- Start processing URL...');
  const selfProperties = Object.keys(self);
  const parameters = new URLSearchParams(window.location.search);

  const acc = {} as any;

  parameters.forEach((value, searchKey) => {
    const [, mstKey] = searchKey.match(/filter\[(.*)\]/) ?? ([, ''] as const);
    if (selfProperties.includes(mstKey)) {
      const { name: typeName } = getChildType(self, mstKey);
      acc[mstKey] = searchToMST(typeName, value);
    }
  });

  return acc;
}

function changeUrl<T>(self: Instance<T>) {
  return (patch: IJsonPatch, reversePatch: IJsonPatch) => {
    const url = window.location.href.split('?')[0];
    const search = new URLSearchParams(window.location.search);

    const { op, path, value } = patch;
    const [, mstKey] = path.split('/');
    const { name: typeName, _defaultValue: defaultValue } = getChildType(self, mstKey);

    const searchKey = `filter[${mstKey}]`;
    if (!value || value == defaultValue) {
      console.log('deleting');
      search.delete(searchKey);
    } else search.set(searchKey, mstToSearch(typeName, value));
    console.log(search, search.toString());
    window.history.replaceState(null, '', `${url}?${search.toString()}`);
  };
}

function mstToSearch(typeName: string, value: any): string {
  switch (typeName) {
    case 'boolean':
    case 'string':
      return value;
    case 'string[]': {
      const arr: string[] = value;
      console.log(arr);
      return arr.join(',');
    }
    default:
      console.warn('No type for', typeName, ':', value);
      return value;
  }
}

function searchToMST(typeName: string, value: string) {
  switch (typeName) {
    case 'boolean':
      return Boolean(value);
    case 'string':
      return value;
    case 'string[]':
      return value.split(',');
    default:
      console.warn('No type for', typeName, ':', value);
      return value;
  }
}

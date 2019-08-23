import _ from 'lodash';

export function destroy(collection: any[], item: any, lookUp: string) {
  const itemIndex = _.findIndex(collection, { [lookUp]: item[lookUp] });
  if (itemIndex > -1) {
    collection.splice(itemIndex, 1);
    return collection;
  }
  return collection;
}

const APIFeatures = require('../../utils/apiFeatures');

const createQuery = () => {
  const query = {};
  ['find', 'sort', 'select', 'skip', 'limit'].forEach((method) => {
    query[method] = jest.fn().mockReturnValue(query);
  });
  return query;
};

describe('APIFeatures', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('converts comparison operators into MongoDB filters and removes control fields', () => {
    const query = createQuery();
    const features = new APIFeatures(query, {
      priority: 'high',
      deadline: { gte: '2026-01-01' },
      page: '2',
      sort: 'name',
    });

    const result = features.filter();

    expect(result).toBe(features);
    expect(query.find).toHaveBeenCalledWith({
      priority: 'high',
      deadline: { $gte: '2026-01-01' },
    });
  });

  it('uses requested sorting and the default sort when none is supplied', () => {
    const customQuery = createQuery();
    new APIFeatures(customQuery, { sort: 'priority,-createdAt' }).sort();
    expect(customQuery.sort).toHaveBeenCalledWith('priority -createdAt');

    const defaultQuery = createQuery();
    new APIFeatures(defaultQuery, {}).sort();
    expect(defaultQuery.sort).toHaveBeenCalledWith('-createdAt name');
  });

  it('selects requested fields or hides the mongoose version field by default', () => {
    const selectedQuery = createQuery();
    new APIFeatures(selectedQuery, { fields: 'title,priority' }).limit();
    expect(selectedQuery.select).toHaveBeenCalledWith('title priority');

    const defaultQuery = createQuery();
    new APIFeatures(defaultQuery, {}).limit();
    expect(defaultQuery.select).toHaveBeenCalledWith('-__v');
  });

  it('applies pagination with defaults and explicit page/limit values', () => {
    const pagedQuery = createQuery();
    new APIFeatures(pagedQuery, { page: '3', limit: '20' }).pagination();
    expect(pagedQuery.skip).toHaveBeenCalledWith(40);
    expect(pagedQuery.limit).toHaveBeenCalledWith(20);

    const defaultQuery = createQuery();
    new APIFeatures(defaultQuery, {}).pagination();
    expect(defaultQuery.skip).toHaveBeenCalledWith(0);
    expect(defaultQuery.limit).toHaveBeenCalledWith(100);
  });
});

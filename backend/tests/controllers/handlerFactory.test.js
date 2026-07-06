const factory = require('../../controllers/handlerFactory');
const { createResponse } = require('../helpers/http');

describe('handlerFactory unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a document and sends a 201 response', async () => {
    const Model = { create: jest.fn().mockResolvedValue({ _id: 'doc-1', name: 'Task' }) };
    const res = createResponse();

    await factory.createOne(Model)({ body: { name: 'Task' } }, res, jest.fn());

    expect(Model.create).toHaveBeenCalledWith({ name: 'Task' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { newDoc: { _id: 'doc-1', name: 'Task' } },
    });
  });

  it('updates an existing document with validation enabled', async () => {
    const updated = { _id: 'doc-1', name: 'Renamed task' };
    const Model = { findByIdAndUpdate: jest.fn().mockResolvedValue(updated) };
    const res = createResponse();

    await factory.updateOne(Model)(
      { params: { id: 'doc-1' }, body: { name: 'Renamed task' } },
      res,
      jest.fn(),
    );

    expect(Model.findByIdAndUpdate).toHaveBeenCalledWith(
      'doc-1',
      { name: 'Renamed task' },
      { new: true, runValidators: true },
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { doc: updated } });
  });

  it('passes a 404 AppError to next when update target is absent', async () => {
    const Model = { findByIdAndUpdate: jest.fn().mockResolvedValue(null) };
    const next = jest.fn();

    await factory.updateOne(Model)({ params: { id: 'missing' }, body: {} }, createResponse(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, message: 'No document found for the ID missing' }),
    );
  });

  it('deletes an existing document', async () => {
    const Model = { findByIdAndDelete: jest.fn().mockResolvedValue({ _id: 'doc-1' }) };
    const res = createResponse();

    await factory.deleteOne(Model)({ params: { id: 'doc-1' } }, res, jest.fn());

    expect(Model.findByIdAndDelete).toHaveBeenCalledWith('doc-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: 'Document removed successfully',
    });
  });

  it('gets and populates one document', async () => {
    const data = { _id: 'doc-1', members: [] };
    const query = { populate: jest.fn().mockResolvedValue(data) };
    const Model = { findById: jest.fn().mockReturnValue(query) };
    const res = createResponse();

    await factory.getOne(Model, 'members')({ params: { id: 'doc-1' } }, res, jest.fn());

    expect(Model.findById).toHaveBeenCalledWith('doc-1');
    expect(query.populate).toHaveBeenCalledWith('members');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data });
  });

});

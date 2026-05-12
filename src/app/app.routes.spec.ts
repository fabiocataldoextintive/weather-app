import { routes } from './app.routes';

describe('app routes', () => {
  it('exports an empty route table for the shell app', () => {
    expect(routes).toEqual([]);
  });
});

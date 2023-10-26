import { HttpExceptionsFilter } from './http-exceptions.filter';

describe('ExceptionsFilter', () => {
  it('should be defined', () => {
    expect(new HttpExceptionsFilter()).toBeDefined();
  });
});

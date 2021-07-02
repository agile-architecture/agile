import { EventJob } from '../../src';
import { LogMock } from '../../../core/tests/helper/logMock';

describe('EventJob Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    LogMock.mockLogs();
  });

  it('should create EventJob (without keys)', () => {
    const eventJob = new EventJob('myPayload');

    expect(eventJob.payload).toBe('myPayload');
    expect(eventJob.creationTimestamp).toBeCloseTo(
      new Date().getTime(),
      calculatePrecision(100)
    );
    expect(eventJob.keys).toBeUndefined();
  });

  it('should create EventJob (with keys)', () => {
    const eventJob = new EventJob('myPayload', ['dummyKey1', 'dummyKey2']);

    expect(eventJob.payload).toBe('myPayload');
    expect(eventJob.creationTimestamp).toBeCloseTo(
      new Date().getTime(),
      calculatePrecision(100)
    );
    expect(eventJob.keys).toStrictEqual(['dummyKey1', 'dummyKey2']);
  });
});

// https://github.com/facebook/jest/issues/5218
function calculatePrecision(deviation) {
  return -Math.log10(2 * deviation);
}

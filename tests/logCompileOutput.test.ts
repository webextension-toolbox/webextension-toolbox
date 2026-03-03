import { describe, it, expect, vi } from 'vitest';
import { default as logCompileOutput } from '../dist/common/utils/logCompileOutput.js';
import type { CompileOptions } from '../dist/common/interfaces.js';

describe('logCompileOutput', () => {
  it('should log error when error is provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');
    const options: CompileOptions = { vendor: 'test', src: 'test', target: 'chrome' };

    logCompileOutput(options, error, undefined);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });

  it('should log stats when stats are provided', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const mockStats = {
      toString: vi.fn().mockReturnValue('Compilation output'),
    };
    const options: CompileOptions = { vendor: 'test', src: 'test', target: 'chrome' };

    logCompileOutput(options, null, mockStats as any);

    expect(consoleSpy).toHaveBeenCalledWith('Compilation output');
    consoleSpy.mockRestore();
  });

  it('should log verbose message when verbose is true', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const options: CompileOptions = { 
      vendor: 'test', 
      src: 'test', 
      target: 'chrome',
      verbose: true 
    };

    logCompileOutput(options, null, undefined);

    expect(consoleSpy).toHaveBeenCalledWith('\nCompilation finished\n');
    consoleSpy.mockRestore();
  });

  it('should not log verbose message when verbose is false', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const options: CompileOptions = { 
      vendor: 'test', 
      src: 'test', 
      target: 'chrome',
      verbose: false 
    };

    logCompileOutput(options, null, undefined);

    // Should not have been called with the verbose message
    expect(consoleSpy).not.toHaveBeenCalledWith('\nCompilation finished\n');
    consoleSpy.mockRestore();
  });

  it('should not log when no error or stats', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const options: CompileOptions = { vendor: 'test', src: 'test', target: 'chrome' };

    logCompileOutput(options, null, undefined);

    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});

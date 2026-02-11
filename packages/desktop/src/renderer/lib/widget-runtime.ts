import * as Babel from '@babel/standalone';
import * as React from 'react';
import * as WigifyApi from '@wigify/api';

export type RuntimeWidgetComponent = React.ComponentType<Record<string, never>>;

interface RuntimeCompileResult {
  component: RuntimeWidgetComponent | null;
  error: string | null;
}

export function compileWidgetSource(sourceCode: string): RuntimeCompileResult {
  try {
    const transpiledCode = Babel.transform(sourceCode, {
      presets: ['react', 'env'],
      plugins: ['transform-modules-commonjs'],
      filename: 'widget.jsx',
    }).code;

    if (!transpiledCode) {
      return {
        component: null,
        error: 'Transpilation failed',
      };
    }

    const moduleExports: { default?: RuntimeWidgetComponent } = {};
    const module = { exports: moduleExports };

    const requireFn = (moduleName: string) => {
      if (moduleName === 'react') {
        return React;
      }

      if (moduleName === '@wigify/api') {
        return WigifyApi;
      }

      throw new Error(`Module not found: ${moduleName}`);
    };

    const executeCode = new Function(
      'exports',
      'module',
      'require',
      'React',
      'useState',
      'useEffect',
      'useCallback',
      'useMemo',
      'useRef',
      transpiledCode,
    );

    executeCode(
      moduleExports,
      module,
      requireFn,
      React,
      React.useState,
      React.useEffect,
      React.useCallback,
      React.useMemo,
      React.useRef,
    );

    const exportedComponent = module.exports.default || moduleExports.default;

    if (typeof exportedComponent !== 'function') {
      return {
        component: null,
        error: 'No default export found. Export a component as default.',
      };
    }

    return {
      component: exportedComponent,
      error: null,
    };
  } catch (err) {
    return {
      component: null,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

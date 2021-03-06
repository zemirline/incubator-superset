/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import { shallow } from 'enzyme';
import createLoadableRenderer from 'src/visualizations/core/components/createLoadableRenderer';

describe('createLoadableRenderer', () => {
  function TestComponent() {
    return (
      <div className="test-component">test</div>
    );
  }
  let loadChartSuccess;
  let render;
  let loading;
  let LoadableRenderer;

  beforeEach(() => {
    loadChartSuccess = jest.fn(() => Promise.resolve(TestComponent));
    render = jest.fn((loaded) => {
      const { Chart } = loaded;
      return (<Chart />);
    });
    loading = jest.fn(() => (<div>Loading</div>));
    LoadableRenderer = createLoadableRenderer({
      loader: {
        Chart: loadChartSuccess,
      },
      loading,
      render,
    });
  });

  describe('returns a LoadableRenderer class', () => {
    it('LoadableRenderer.preload() preloads the lazy-load components', () => {
      expect(LoadableRenderer.preload).toBeInstanceOf(Function);
      LoadableRenderer.preload();
      expect(loadChartSuccess).toHaveBeenCalledTimes(1);
    });

    it('calls onRenderSuccess when succeeds', (done) => {
      const onRenderSuccess = jest.fn();
      const onRenderFailure = jest.fn();
      shallow(
        <LoadableRenderer
          onRenderSuccess={onRenderSuccess}
          onRenderFailure={onRenderFailure}
        />,
      );
      expect(loadChartSuccess).toHaveBeenCalled();
      setTimeout(() => {
        expect(render).toHaveBeenCalledTimes(1);
        expect(onRenderSuccess).toHaveBeenCalledTimes(1);
        expect(onRenderFailure).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    it('calls onRenderFailure when fails', (done) => {
      const loadChartFailure = jest.fn(() => Promise.reject('Invalid chart'));
      const FailedRenderer = createLoadableRenderer({
        loader: {
          Chart: loadChartFailure,
        },
        loading,
        render,
      });
      const onRenderSuccess = jest.fn();
      const onRenderFailure = jest.fn();
      shallow(
        <FailedRenderer
          onRenderSuccess={onRenderSuccess}
          onRenderFailure={onRenderFailure}
        />,
      );
      expect(loadChartFailure).toHaveBeenCalledTimes(1);
      setTimeout(() => {
        expect(render).not.toHaveBeenCalled();
        expect(onRenderSuccess).not.toHaveBeenCalled();
        expect(onRenderFailure).toHaveBeenCalledTimes(1);
        done();
      }, 10);
    });

    it('renders the lazy-load components', (done) => {
      const wrapper = shallow(<LoadableRenderer />);
      // lazy-loaded component not rendered immediately
      expect(wrapper.find(TestComponent)).toHaveLength(0);
      setTimeout(() => {
        // but rendered after the component is loaded.
        expect(wrapper.find(TestComponent)).toHaveLength(1);
        done();
      }, 10);
    });
  });
});

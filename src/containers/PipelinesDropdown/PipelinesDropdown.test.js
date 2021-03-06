/*
Copyright 2019 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import { fireEvent, getNodeText, render } from 'react-testing-library';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PipelinesDropdown from './PipelinesDropdown';
import * as API from '../../api';

const props = {
  id: 'pipelines-dropdown',
  'data-testid': 'pipelines-dropdown-testid'
};

const pipelinesByNamespace = {
  blue: {
    'pipeline-1': 'id-pipeline-1',
    'pipeline-2': 'id-pipeline-2'
  },
  green: {
    'pipeline-3': 'id-pipeline-3'
  }
};

const pipelinesById = {
  'id-pipeline-1': {
    metadata: {
      name: 'pipeline-1',
      namespace: 'blue',
      uid: 'id-pipeline-1'
    }
  },
  'id-pipeline-2': {
    metadata: {
      name: 'pipeline-2',
      namespace: 'blue',
      uid: 'id-pipeline-2'
    }
  },
  'id-pipeline-3': {
    metadata: {
      name: 'pipeline-3',
      namespace: 'green',
      uid: 'id-pipeline-3'
    }
  }
};

const pipelinesStoreDefault = {
  pipelines: {
    byId: pipelinesById,
    byNamespace: pipelinesByNamespace,
    isFetching: false
  }
};

const pipelinesStoreFetching = {
  pipelines: {
    byId: pipelinesById,
    byNamespace: pipelinesByNamespace,
    isFetching: true
  }
};

const namespacesByName = {
  blue: '',
  green: ''
};

const namespacesStoreBlue = {
  namespaces: {
    byName: namespacesByName,
    selected: 'blue'
  }
};

const namespacesStoreGreen = {
  namespaces: {
    byName: namespacesByName,
    selected: 'green'
  }
};

const initialTextRegExp = new RegExp('select pipeline', 'i');

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = new RegExp('pipeline-', 'i')
}) => {
  Object.keys(testDict).forEach(item => {
    expect(queryByText(new RegExp(item, 'i'))).toBeTruthy();
  });
  getAllByText(itemPrefixRegExp).forEach(node => {
    expect(getNodeText(node) in testDict).toBeTruthy();
  });
};

const middleware = [thunk];
const mockStore = configureStore(middleware);

beforeEach(() => {
  jest.spyOn(API, 'getPipelines').mockImplementation(() => pipelinesById);
});

it('PipelinesDropdown renders items based on Redux state', () => {
  const store = mockStore({
    ...pipelinesStoreDefault,
    ...namespacesStoreBlue
  });
  const { getByText, getAllByText, queryByText } = render(
    <Provider store={store}>
      <PipelinesDropdown {...props} />
    </Provider>
  );
  // View items
  fireEvent.click(getByText(initialTextRegExp));
  checkDropdownItems({
    getAllByText,
    queryByText,
    testDict: pipelinesByNamespace.blue
  });
});

it('PipelinesDropdown renders items based on Redux state when namespace changes', () => {
  const blueStore = mockStore({
    ...pipelinesStoreDefault,
    ...namespacesStoreBlue
  });
  const { container, getByText, getAllByText, queryByText } = render(
    <Provider store={blueStore}>
      <PipelinesDropdown {...props} />
    </Provider>
  );
  // View items
  fireEvent.click(getByText(initialTextRegExp));
  checkDropdownItems({
    getAllByText,
    queryByText,
    testDict: pipelinesByNamespace.blue
  });
  fireEvent.click(getByText(initialTextRegExp));

  // Change selected namespace from 'blue' to 'green'
  const greenStore = mockStore({
    ...pipelinesStoreDefault,
    ...namespacesStoreGreen
  });
  render(
    <Provider store={greenStore}>
      <PipelinesDropdown {...props} />
    </Provider>,
    { container }
  );
  // View items
  fireEvent.click(getByText(initialTextRegExp));
  checkDropdownItems({
    getAllByText,
    queryByText,
    testDict: pipelinesByNamespace.green
  });
});

it('PipelinesDropdown renders controlled selection', () => {
  const store = mockStore({
    ...pipelinesStoreDefault,
    ...namespacesStoreBlue
  });
  // Select item 'pipeline-1'
  const { container, queryByText } = render(
    <Provider store={store}>
      <PipelinesDropdown {...props} selectedItem={{ text: 'pipeline-1' }} />
    </Provider>
  );
  expect(queryByText(/pipeline-1/i)).toBeTruthy();
  // Select item 'pipeline-2'
  render(
    <Provider store={store}>
      <PipelinesDropdown {...props} selectedItem={{ text: 'pipeline-2' }} />
    </Provider>,
    { container }
  );
  expect(queryByText(/pipeline-2/i)).toBeTruthy();
  // No selected item (select item '')
  render(
    <Provider store={store}>
      <PipelinesDropdown {...props} selectedItem="" />
    </Provider>,
    { container }
  );
  expect(queryByText(initialTextRegExp)).toBeTruthy();
});

it('PipelinesDropdown renders controlled namespace', () => {
  const store = mockStore({
    ...pipelinesStoreDefault,
    ...namespacesStoreBlue
  });
  // Select namespace 'green'
  const { queryByText, getByText, getAllByText } = render(
    <Provider store={store}>
      <PipelinesDropdown {...props} namespace="green" />
    </Provider>
  );
  fireEvent.click(getByText(initialTextRegExp));
  checkDropdownItems({
    getAllByText,
    queryByText,
    testDict: pipelinesByNamespace.green
  });
});

it('PipelinesDropdown renders empty', () => {
  const store = mockStore({
    pipelines: {
      byId: {},
      byNamespace: {},
      isFetching: false
    },
    ...namespacesStoreBlue
  });
  const { queryByText } = render(
    <Provider store={store}>
      <PipelinesDropdown {...props} />
    </Provider>
  );
  expect(
    queryByText(/no pipelines found in the 'blue' namespace/i)
  ).toBeTruthy();
  expect(queryByText(initialTextRegExp)).toBeFalsy();
});

it('PipelinesDropdown renders loading skeleton based on Redux state', () => {
  const store = mockStore({
    ...pipelinesStoreFetching,
    ...namespacesStoreBlue
  });
  const { queryByText } = render(
    <Provider store={store}>
      <PipelinesDropdown {...props} />
    </Provider>
  );
  expect(queryByText(initialTextRegExp)).toBeFalsy();
});

it('PipelinesDropdown handles onChange event', () => {
  const store = mockStore({
    ...pipelinesStoreDefault,
    ...namespacesStoreBlue
  });
  const onChange = jest.fn();
  const { getByText } = render(
    <Provider store={store}>
      <PipelinesDropdown {...props} onChange={onChange} />
    </Provider>
  );
  fireEvent.click(getByText(initialTextRegExp));
  fireEvent.click(getByText(/pipeline-1/i));
  expect(onChange).toHaveBeenCalledTimes(1);
});

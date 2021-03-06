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

import snakeCase from 'lodash.snakecase';
import { getPodLog } from '../api';

export function sortRunsByStartTime(runs) {
  runs.sort((a, b) => {
    const aTime = a.status.startTime;
    const bTime = b.status.startTime;
    if (!aTime) {
      return -1;
    }
    if (!bTime) {
      return 1;
    }
    return -1 * aTime.localeCompare(bTime);
  });
}

export function typeToPlural(type) {
  return `${snakeCase(type).toUpperCase()}S`;
}

export async function fetchLogs(stepName, stepStatus, taskRun) {
  const { pod, namespace } = taskRun;
  let logs;
  if (pod) {
    const { container = `step-${stepName}` } = stepStatus;
    logs = getPodLog({
      container,
      name: pod,
      namespace
    });
  }
  return logs;
}

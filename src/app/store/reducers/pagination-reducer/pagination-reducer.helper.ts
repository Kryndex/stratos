import { Action, Store } from '@ngrx/store';
import { denormalize, Schema } from 'normalizr';
import { Observable } from 'rxjs/Rx';

import { AddParams, SetParams } from '../../actions/pagination.actions';
import { AppState } from '../../app-state';
import { getAPIRequestDataState } from '../../selectors/api.selectors';
import { selectPaginationState } from '../../selectors/pagination.selectors';
import { PaginatedAction, PaginationEntityState, PaginationParam, QParam } from '../../types/pagination.types';

export function qParamsToString(params: QParam[]) {
  return params.map(joinQParam);
}

function joinQParam(q: QParam) {
  return `${q.key}${q.joiner}${(q.value as string[]).join ? (q.value as string[]).join(',') : q.value}`;
}

export function getUniqueQParams(action: AddParams | SetParams, state) {
  let qStatePrams: QParam[] = [].concat(state.params.q || []);
  const qActionPrams: QParam[] = [].concat(action.params.q || []);

  // Update existing q params
  for (const actionParam of qActionPrams) {
    const existingParam = qStatePrams.findIndex((stateParam: QParam) => stateParam.key === actionParam.key);
    if (existingParam >= 0) {
      qStatePrams[existingParam] = { ...actionParam };
    } else {
      qStatePrams.push(actionParam);
    }
  }

  //  Ensure q params are unique
  if (action.params.q) {
    qStatePrams = qStatePrams.concat(qActionPrams)
      .filter((q, index, self) => self.findIndex(
        (qs) => {
          return qs.key === q.key;
        }
      ) === index)
      .filter((q: QParam) => {
        // Filter out empties
        return !!q.value;
      });
  }
  return qStatePrams;
}

export function removeEmptyParams(params: PaginationParam) {
  const newObject = {};
  Object.keys(params).forEach(key => {
    if (params[key]) {
      newObject[key] = params[key];
    }
  });
  return newObject;
}

export function getActionType(action) {
  return action.type;
}

export function getAction(action): PaginatedAction {
  if (!action) {
    return null;
  }
  return action.apiAction ? action.apiAction : action;
}

export function getActionKey(action) {
  const apiAction = getAction(action);
  return apiAction.entityKey || null;
}

export function getPaginationKey(action) {
  const apiAction = getAction(action);
  return apiAction.paginationKey;
}

export const getPaginationObservables = (function () {
  const mem = {};
  return function (
    { store, action, schema }: { store: Store<AppState>, action: PaginatedAction, schema: Schema },
    uid?: string
  ): {
      entities$: Observable<any[]>,
      pagination$: Observable<PaginationEntityState>
    } {
    const _key = action.entityKey + action.paginationKey + (uid || '');
    if (mem[_key]) {
      return mem[_key];
    }
    const { entityKey, paginationKey } = action;

    if (action.initialParams) {
      store.dispatch(new SetParams(entityKey, paginationKey, action.initialParams));
    }

    const obs = getObservables(
      store,
      entityKey,
      paginationKey,
      action,
      schema
    );

    mem[_key] = obs;
    return obs;
  };
})();

function getObservables(store: Store<AppState>, entityKey: string, paginationKey: string, action: Action, schema: Schema) {
  const paginationSelect$ = store.select(selectPaginationState(entityKey, paginationKey));

  const pagination$: Observable<PaginationEntityState> = paginationSelect$
    .filter(pagination => !!pagination);

  const entities$: Observable<any[]> = paginationSelect$
    .do(pagination => {
      if (!hasError(pagination) && !hasValidOrGettingPage(pagination)) {
        store.dispatch(action);
      }
    })
    .filter(pagination => {
      return isPageReady(pagination);
    })
    .withLatestFrom(store.select(getAPIRequestDataState))
    .map(([paginationEntity, entities]) => {
      const page = paginationEntity.ids[paginationEntity.currentPage];
      return page ? denormalize(page, schema, entities) : null;
    });

    return  {
      pagination$,
      entities$
    };
}

export function isPageReady(pagination: PaginationEntityState) {
  return !!pagination && !!pagination.ids[pagination.currentPage];
}

export function hasValidOrGettingPage(pagination: PaginationEntityState) {
  if (pagination && Object.keys(pagination).length) {
    const hasPage = !!pagination.ids[pagination.currentPage];

    return pagination.fetching || hasPage;
  } else {
    return false;
  }
}

export function hasError(pagination: PaginationEntityState) {
  return pagination && pagination.error;
}

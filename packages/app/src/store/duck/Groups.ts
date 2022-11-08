/* eslint-disable max-lines */
import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { LensGenerator, LensS } from '@typed-f/lens';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { concat } from 'rxjs';
import { ajax, AjaxError } from 'rxjs/ajax';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';
import _ from 'lodash-es';

import { FinishProps } from '../Utils';
import { defaultGroup } from '^/constants/defaultContent';
import { currentProjectSelector } from '^/hooks/useCurrentProject';
import { lastSelectedScreenSelector } from '^/hooks/useLastSelectedScreen';
import * as T from '^/types';
import { AuthHeader, getRequestErrorType, jsonContentHeader, makeAuthHeader, makeV2APIURL } from './API';
import {
  AddContent, APIToContent,
  PostContent, PostContentBody,
  FinishPostContent, RemoveContent, ChangeContents, UpdateContents, PatchContent,
} from './Contents';
import { CtxSortEvent } from '^/utilities/ctxsort';
import {
  GROUP_NUMBER_GAP, GROUP_TITLE_PREFIX,
  NO_GROUP_NUMBER_ATTACHED, START_GROUP_NUMBER, groupName,
} from '^/constants/group';
import { ChangeEditingContent } from './Pages';
import { typeGuardESSContent, typeGuardGroup } from '^/hooks';
import { CreateESSGroupContent, CopyESSGroupContent, PatchESSContent } from './ESSContents';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { isContentPinned } from '^/utilities/content-util';

export const CategoryToTabMapper: Record<T.ContentCategory, T.ContentPageTabType> = {
  [T.ContentCategory.MEASUREMENT]: T.ContentPageTabType.MEASUREMENT,
  [T.ContentCategory.OVERLAY]: T.ContentPageTabType.OVERLAY,
  [T.ContentCategory.ESS]: T.ContentPageTabType.ESS,
  [T.ContentCategory.METADATA]: T.ContentPageTabType.MAP,
  [T.ContentCategory.MAP]: T.ContentPageTabType.MAP,
};

export const TabToCategoryMapper: Record<T.ContentPageTabType, T.ContentCategory> = {
  [T.ContentPageTabType.MEASUREMENT]: T.ContentCategory.MEASUREMENT,
  [T.ContentPageTabType.OVERLAY]: T.ContentCategory.OVERLAY,
  [T.ContentPageTabType.ESS]: T.ContentCategory.ESS,
  [T.ContentPageTabType.MAP]: T.ContentCategory.METADATA,
  [T.ContentPageTabType.PHOTO]: T.ContentCategory.MAP,
};

const addIdWhenInexist: (array: number[], id: number, index: number) => number[] = (
  array, id, index,
) => {
  if (array.includes(id)) {
    return array;
  }

  return array
    .slice(0, index)
    .concat([id])
    .concat(array.slice(index, array.length));
};

const getNewGroupTitle: (
  titles: string[], lang: T.Language,
) => T.GroupContent['title'] = (
  titles, lang,
) => {
  const currentGroupNumbers: Array<number> = titles
    .filter((title) => title.includes(groupName[lang]))
    .map((title) => {
      const parsedNum: number = Number(title.replace(groupName[lang], ''));

      return parsedNum === NO_GROUP_NUMBER_ATTACHED ? START_GROUP_NUMBER : parsedNum;
    })
    .filter((num) => !isNaN(num))
    .sort((a, b) => a - b);

  const nextGroupNum: number = currentGroupNumbers.length
    ? currentGroupNumbers[currentGroupNumbers.length - 1] + GROUP_NUMBER_GAP
    : START_GROUP_NUMBER;

  return `${groupName[lang]}${
    nextGroupNum === START_GROUP_NUMBER
      ? ''
      : `${GROUP_TITLE_PREFIX}${nextGroupNum}`
  }`;
};

const getCopiedGroupTitle: (
  existingGroupTitles: Array<T.GroupContent['title']>, selectedGroupTitle: T.GroupContent['title'], lang: T.Language,
) => T.GroupContent['title'] = (
  existingGroupTitles, selectedGroupTitle,
) => {
  const postfixOfExistingGroups: Array<number> = existingGroupTitles
    .filter((title) => title.includes(selectedGroupTitle) && title.indexOf(selectedGroupTitle) === 0)
    .map((title) => {
      const postfix = title.replace(selectedGroupTitle, '');
      return Number(postfix.match(/\(([^)]+)\)/)?.pop()) ?? START_GROUP_NUMBER;
    })
    .filter((num) => !isNaN(num))
    .sort((a, b) => a - b);

  const postfixOfNextGroup: number = postfixOfExistingGroups.length
    ? postfixOfExistingGroups[postfixOfExistingGroups.length - 1] + GROUP_NUMBER_GAP
    : START_GROUP_NUMBER + GROUP_NUMBER_GAP;

  return `${selectedGroupTitle}${GROUP_TITLE_PREFIX}(${postfixOfNextGroup})`;
};

export const createInitialContentsTree: () => T.GroupsState['tree'] = () => ({
  idsByGroup: {},
  rootIdsByCategory: {
    [T.ContentCategory.OVERLAY]: { pinned: [], unpinned: {} },
    [T.ContentCategory.MEASUREMENT]: { pinned: [], unpinned: {} },
    [T.ContentCategory.ESS]: { pinned: [], unpinned: {} },
    [T.ContentCategory.MAP]: { pinned: [], unpinned: {} },
    [T.ContentCategory.METADATA]: { pinned: [], unpinned: {} },
  },
});

type Movable = Pick<T.Content, 'id' | 'groupId' | 'screenId' | 'category'>;

interface MovableParams {
  readonly current: Movable;
  readonly target: Movable;
  readonly targetList: number[];
  readonly shouldInsertToNext: boolean;
}

/**
 * The item movement parameters that BE needs
 * in order to move a content in a list.
 */
interface TreeInfoParams {
  /**
   * The screen id of the target.
   * User might bee moving from pinned to unpinned list.
   */
  readonly screenId: number | undefined;
  /**
   * The content id to target to.
   */
  readonly posContentId: number | null;
  /**
   * Determines whether content should be at the bottom of the list or not.
   */
  readonly appendMode: boolean;
}

/**
 * Returns the tree info params that BE needs.
 * See TreeInfoParams for more details.
 */
const getTreeInfoParams: (params: MovableParams) => TreeInfoParams = ({
  current,
  targetList,
  shouldInsertToNext,
  target,
}) => {
  // This error technically won't happen right now, since the UI won't allow it.
  // If in the future, remove this block if the UI/feature supports it.
  if (current.groupId === undefined && target.groupId !== undefined) {
    throw new Error(
      `Not allowed to move a root-level item inside another group for now. Current: ${current.id}, target: ${target.id}`
    );
  }

  // This happens when a content is drag-and-dropped on a group.
  // It should immediately go to the bottom of the group.
  if (current.groupId !== undefined && target.groupId === undefined) {
    return {
      appendMode: true,
      posContentId: target.id,
      screenId: target.screenId,
    };
  }

  const targetIndex = targetList.indexOf(target.id);
  const isTargetLast = targetIndex === targetList.length - 1 && shouldInsertToNext;
  const posContentId = isTargetLast
    // The only time posContentId is null is when
    // it's moving root-level content (groupId === undefined) and it's in append mode.
    ? target.groupId ?? null
    : targetList[targetIndex + Number(shouldInsertToNext)] ?? null;

  return {
    appendMode: isTargetLast,
    posContentId,
    screenId: target.screenId,
  };
};

/**
 * Returns the index from a list depending on the move option.
 */
const getIndexFromList: (list: number[], moveOption: T.MoveOption, id?: number) => number = (
  list, moveOption, id,
) => {
  switch (moveOption) {
    case T.MoveOption.FIRST: {
      return 0;
    }
    case T.MoveOption.PREVIOUS:
    case T.MoveOption.NEXT: {
      if (id === undefined) {
        // eslint-disable-next-line no-console
        console.warn('Target id not supplied to get the index of the move target.');

        return NaN;
      }

      return list.indexOf(id) + (moveOption === T.MoveOption.NEXT ? 1 : 0);
    }
    case T.MoveOption.LAST: {
      return list.length;
    }
    default: {
      exhaustiveCheck(moveOption);
    }
  }
};

/**
 * Gets the list of either the root-level contentids in a category
 * (pinned or by screenid) or all contentids inside a group
 * for non-root-level content.
 */
const getContentListFromTree: (
  content: Movable,
  category: T.ContentCategory,
  tree: T.GroupsState['tree']
) => Array<T.Content['id']> = (
  content,
  category,
  tree,
) => {
  const rootIdsByCategory = tree.rootIdsByCategory[category];

  if (content.groupId === undefined) {
    return content.screenId === undefined
      ? rootIdsByCategory.pinned
      : rootIdsByCategory.unpinned[content.screenId] ?? [];
  }

  return tree.idsByGroup[content.groupId] ?? [];
};


export const AddNewGroup = makeAction(
  'ddm/groups/ADD_NEW_GROUP',
  props<{ isPinned: boolean; skipTriggerRename?: boolean; customTitle?: string }>(),
);

export const CopySelectedGroup = makeAction(
  'ddm/groups/COPY_SELECTED_GROUP',
  props<{ isPinned: boolean; skipTriggerRename?: boolean; customTitle?: string; selectedGroupId?: number }>(),
);

export const MoveContent = makeAction(
  'ddm/group/MOVE_CONTENT',
  props<{ e: CtxSortEvent }>(),
);

export const FinishMoveContent = makeAction(
  'ddm/group/FINISH_MOVE_CONTENT',
  props<FinishProps>(),
);

export const ChangeSelectedGroupId = makeAction(
  'ddm/group/CHANGE_SELECTED_GROUP_ID',
  props<{ selectedGroupId?: T.Content['groupId']; tab: T.ContentPageTabType }>(),
);

export const ChangeIsCreatingNewGroup = makeAction(
  'ddm/group/CHANGE_IS_CREATING_NEW_GROUP',
  props<{ isCreatingNewGroup: T.GroupsState['isCreatingNewGroup'] }>(),
);

export const ChangeIsGroupAlreadyDeleted = makeAction(
  'ddm/group/CHANGE_IS_GROUP_ALREADY_DELETED',
  props<{ isGroupAlreadyDeleted: T.GroupsState['isGroupAlreadyDeleted'] }>(),
);

export const ChangeIsCreatingContentOnDeletedGroup = makeAction(
  'ddm/group/CHANGE_IS_CREATING_CONTENT_ON_DELETED_GROUP',
  props<{ isCreatingContentOnDeletedGroup: T.GroupsState['isCreatingContentOnDeletedGroup'] }>(),
);

export const RemoveGroupChildren = makeAction(
  'ddm/group/REMOVE_GROUP_CHILDREN',
  props<{ id: T.GroupContent['id'] }>(),
);

export const CheckAndRemoveGroup = makeAction(
  'ddm/group/CHECK_AND_REMOVE_GROUP',
  props<{ id: T.Content['id'] }>(),
);

export const RebuildTree = makeAction(
  'ddm/group/REBUILD_TREE',
  props<{ tree: T.GroupsState['tree'] }>(),
);

export const AddContentToTree = makeAction(
  'ddm/group/ADD_CONTENT_TO_TREE',
  props<{ content: Movable; target?: Movable; moveOption: T.MoveOption }>(),
);

export const AddContentToGroupTree = makeAction(
  'ddm/group/ADD_CONTENT_TO_GROUP_TREE',
  props<{ content: Movable; target?: Movable; moveOption: T.MoveOption }>(),
);

export const AddContentToCategoryTree = makeAction(
  'ddm/group/ADD_CONTENT_TO_CATEGORY_TREE',
  props<{ content: Movable; target?: Movable; moveOption: T.MoveOption }>(),
);

export const RemoveContentFromTree = makeAction(
  'ddm/group/REMOVE_CONTENT_FROM_TREE',
  props<{ content: Movable }>(),
);

export const RemoveContentFromGroupTree = makeAction(
  'ddm/group/REMOVE_CONTENT_FROM_GROUP_TREE',
  props<{ content: Movable }>(),
);

export const RemoveContentFromCategoryTree = makeAction(
  'ddm/group/REMOVE_CONTENT_FROM_CATEGORY_TREE',
  props<{ content: Movable }>(),
);

const Action = union([
  AddNewGroup,
  CopySelectedGroup,

  MoveContent,
  FinishMoveContent,

  ChangeSelectedGroupId,
  ChangeIsCreatingNewGroup,
  ChangeIsGroupAlreadyDeleted,
  ChangeIsCreatingContentOnDeletedGroup,
  RemoveGroupChildren,
  CheckAndRemoveGroup,
  RebuildTree,

  AddContentToTree,
  AddContentToGroupTree,
  AddContentToCategoryTree,
  RemoveContentFromTree,
  RemoveContentFromGroupTree,
  RemoveContentFromCategoryTree,

  // Out-duck actions
  PostContent,
  AddContent,
  PatchContent,
  FinishPostContent,
  RemoveContent,
  ChangeEditingContent,
  ChangeContents,
  UpdateContents,
  CreateESSGroupContent,
  CopyESSGroupContent,
  PatchESSContent,
]);
export type Action = typeof Action;

// Redux-Observable Epics
const addNewGroupEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(AddNewGroup),
  mergeMap(({ isPinned, skipTriggerRename, customTitle }) => {
    const s: T.State = state$.value;

    const lang = s.Pages.Common.language;
    const sidebarTab = s.Pages.Contents.sidebarTab;
    const currentProject = currentProjectSelector(s);
    const currentScreen = lastSelectedScreenSelector(s);

    if (currentProject === undefined || currentScreen === undefined) return [];

    const category: T.ContentCategory = TabToCategoryMapper[sidebarTab];
    const { pinned, unpinned } = s.Groups.tree.rootIdsByCategory[category];
    const ids = isPinned ? pinned : unpinned[currentScreen.id] ?? [];

    const titles = ids
      .filter((id) => s.Contents.contents.byId[id]?.type === T.ContentType.GROUP)
      .map((id) => s.Contents.contents.byId[id]?.title);
    const title = customTitle ?? getNewGroupTitle(titles, lang);

    const group = defaultGroup({ title });
    const content: PostContentBody = {
      ...group,
      category,
      screenId: isPinned ? null : currentScreen.id,
      color: group.color.toString(),
    };

    // User should be able to immediately rename after creating a group
    // since the title is a placeholder. However, there are cases
    // where it doesn't need to be, since it's just to create dummy group.
    const actions: Action[] = skipTriggerRename
      ? []
      : [ChangeIsCreatingNewGroup({ isCreatingNewGroup: true })];

    if (category === T.ContentCategory.ESS) {
      return actions.concat([
        CreateESSGroupContent({ group: content }),
      ]);
    }

    return actions.concat([
      PostContent({
        projectId: currentProject.id,
        content,
      }),
    ]);
  }),
);

const copySelectedGroupEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(CopySelectedGroup),
  mergeMap(({ isPinned, skipTriggerRename, customTitle, selectedGroupId }) => {
    const s: T.State = state$.value;

    const lang = s.Pages.Common.language;
    const sidebarTab = s.Pages.Contents.sidebarTab;
    const currentProject = currentProjectSelector(s);
    const currentScreen = lastSelectedScreenSelector(s);

    if (currentProject === undefined || currentScreen === undefined) return [];

    const category: T.ContentCategory = TabToCategoryMapper[sidebarTab];
    const { pinned, unpinned } = s.Groups.tree.rootIdsByCategory[category];
    const ids = isPinned ? pinned : unpinned[currentScreen.id] ?? [];

    const titles = ids
      .filter((id) => s.Contents.contents.byId[id]?.type === T.ContentType.GROUP)
      .map((id) => s.Contents.contents.byId[id]?.title);

    const selectedGroupTitle = selectedGroupId ? s.Contents.contents.byId[selectedGroupId]?.title : '';

    const copiedGroupTitle = customTitle ?? getCopiedGroupTitle(titles, selectedGroupTitle, lang);

    const group = defaultGroup({ title: copiedGroupTitle });
    const newGroup: PostContentBody = {
      ...group,
      category,
      screenId: isPinned ? null : currentScreen.id,
      color: group.color.toString(),
    };

    const childrenIds = selectedGroupId ? s.Groups.tree.idsByGroup[selectedGroupId] : [];

    const ESSContentfGroup: T.ESSContent[] = [];

    childrenIds.forEach((contentId) => {
      const content = s.Contents.contents.byId[contentId];
      const ESSContent = typeGuardESSContent(content);
      if (ESSContent !== undefined) ESSContentfGroup.push(ESSContent);
    });

    // User should be able to immediately rename after creating a group
    // since the title is a placeholder. However, there are cases
    // where it doesn't need to be, since it's just to create dummy group.
    const actions: Action[] = skipTriggerRename
      ? []
      : [ChangeIsCreatingNewGroup({ isCreatingNewGroup: true })];

    if (category === T.ContentCategory.ESS) {
      return actions.concat([
        CopyESSGroupContent({ group: newGroup, ESSContent: ESSContentfGroup }),
      ]);
    }

    return actions.concat([
      PostContent({
        projectId: currentProject.id,
        content: newGroup,
      }),
    ]);
  }),
);


const moveContentEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(MoveContent),
  mergeMap(({ e }) => {
    const byId = state$.value.Contents.contents.byId;
    const tree = state$.value.Groups.tree;
    const id: T.Content['id'] = parseInt(e.key, 10);
    const content: T.Content | undefined = byId[id];
    const category = content.category;
    if (content === undefined) {
      return [];
    }

    const URL: string = makeV2APIURL(
      content.category === T.ContentCategory.ESS ? 'ess_contents' : 'contents',
      id,
      'move',
    );
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const lastSelectedScreen: T.Screen | undefined = lastSelectedScreenSelector(state$.value);

    if (lastSelectedScreen?.id === undefined) return [];

    const target: Movable | undefined = (() => {
      const nearestId = parseInt(e.nearestKey ?? '', 10);
      const nearestContent = byId[nearestId];
      if (nearestContent !== undefined) {
        // There's one exception case where user drops the content
        // on a group. If the group isn't empty, it should be at
        // the very top of the list, so the target is the first item of the group.
        // If it's an empty group, just simply pass the group and appendMode (last position).
        if (nearestContent.groupId === undefined && content.groupId !== undefined) {
          const children = tree.idsByGroup[nearestContent.id] ?? [];
          if (children[0] !== undefined) {
            return byId[children[0]];
          }
        }

        return nearestContent;
      }

      // Normally, nearestId should always exist.
      // There are three cases when it doesnt:

      // 1. Invalid target, e.g. moving a content into its own or somewhere else in the UI.
      // In this case, do nothing since the content should not move.
      if (e.isInvalidTarget) {
        return undefined;
      }

      // 2. Moving a content to the top of a list.
      // In this case, the first item after the header is
      // the first content on the list.
      const firstContentIdInList = parseInt(e.nextSiblingKey?? '', 10);
      if (!isNaN(firstContentIdInList)) {
        return byId[firstContentIdInList];
      }


      // 3. Moving a content to the top of an empty list.
      // In this case, the next element on the list is not a content (i.e. empty).
      // Make up an empty target with an inexisting id.
      // The screen should be the opposite of the moving content, because
      // the only way to move to an empty list right now is when there are
      // at least two lists (pinned & unpinned) and one of them is empty.
      return {
        id: NaN,
        groupId: undefined,
        screenId: content.screenId === undefined ? lastSelectedScreen.id : undefined,
        category,
      };
    })();

    if (target === undefined) {
      // eslint-disable-next-line no-console
      console.warn('Unable to find target to move the content.', e);

      return [];
    }

    const targetList = getContentListFromTree(target, category, tree);

    let params: TreeInfoParams | null = null;
    try {
      params = getTreeInfoParams({
        current: content,
        target,
        targetList,
        shouldInsertToNext: e.shouldInsertToNext,
      });

      // Do not proceed if the content does not move at all (target and content is the same).
      if (params.posContentId === content.id && params.screenId === content.screenId) {
        return [];
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);

      return [];
    }

    return concat(
      ajax.put(URL, params, {
        ...header,
        ...jsonContentHeader,
      }).pipe(
        map(({ response }) => response.data.map((rawContent: T.APIContent) => ({
          // In some cases, BE doesn't return us the category.
          // Use whatever category the content currently has.
          ...APIToContent(rawContent),
          category,

          // Since this endpoint does not change config,
          // always use config from store, because some config can be inconsistent (like ESS).
          config: byId[rawContent.id].config,
        }))),
        mergeMap((movedContents: T.Content[]) => {
          const movedCurrent = movedContents.find((movedContent) => movedContent.id === content.id);
          if (movedCurrent === undefined) {
            return [];
          }

          // BE will update groupId and/or screenId whenever it changes,
          // so update it to the store.
          const actions: Action[] = [
            FinishMoveContent({}),
            UpdateContents({ contents: movedContents }),
          ];

          const moveOption = (() => {
            // Following the current UX,
            // dropping a non-root content to a root content (group)
            // should be placed at the top of the list.
            if (content.type !== T.ContentType.GROUP && target.groupId === undefined) {
              return T.MoveOption.FIRST;
            }

            return e.shouldInsertToNext
              ? T.MoveOption.NEXT
              : T.MoveOption.PREVIOUS;
          })();

          // Since the movement happens within a group,
          // there is no need to update the tree.idsByGroup.
          if (content.groupId === undefined && target.groupId === undefined) {
            const contentsList = getContentListFromTree(content, category, tree);
            const movingActions: Action[] = [
              RemoveContentFromCategoryTree({ content }),
            ];

            // Depending on what type of root level content it is (group/not),
            // add to the appropriate tree.
            if (content.type === T.ContentType.GROUP) {
              movingActions.push(AddContentToCategoryTree({
                content: movedCurrent,
                target,
                moveOption,
              }));
            } else {
              movingActions.push(AddContentToGroupTree({
                content: movedCurrent,
                target,
                moveOption,
              }));
            }

            // The UI/UX currently always assume that there's at least one folder
            // on the list. To keep the behavior consistent, add one folder if it's the last one moved.
            if (content.type === T.ContentType.GROUP && contentsList.length === 1) {
              return actions
                .concat(movingActions)
                // Do not trigger rename since this is just a placeholder empty group.
                .concat(AddNewGroup({ isPinned: isContentPinned(content), skipTriggerRename: true }));
            }

            return actions.concat(movingActions);
          }

          // Automatically open/expand a group when a content is moved into,
          // so that users can immediately see the content in the group (otherwise it's collapsed).
          const openGroupAction: Action[] = (() => {
            const targetGroup = typeGuardGroup(byId[target.groupId ?? target.id]);
            if (targetGroup === undefined || targetGroup.info.isOpened) {
              return [];
            }

            return [
              category === T.ContentCategory.ESS
                ? PatchESSContent({ content: { id: targetGroup.id, info: { isOpened: true } } })
                : PatchContent({ content: { id: targetGroup.id, info: { isOpened: true } } }),
            ];
          })();

          return actions
            .concat([
              RemoveContentFromTree({ content }),
              AddContentToTree({ content: movedCurrent, target, moveOption }),
            ])
            .concat(openGroupAction);
        }),
        catchError((err: AjaxError) => {
          // eslint-disable-next-line no-console
          console.error(err);

          const httpError = getRequestErrorType(err);
          if (httpError === T.HTTPError.CLIENT_NOT_FOUND_ERROR) {
            return [
              FinishMoveContent({ error: httpError }),
              CheckAndRemoveGroup({ id }),
              CheckAndRemoveGroup({ id: target.id }),
              RemoveContent({ contentId: id }),
              RemoveContentFromTree({ content }),
            ];
          }

          return [];
        }),
      ),
    );
  }),
);

const removeGroupChildrenEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(RemoveGroupChildren),
  mergeMap(({ id }) => {
    const { allIds, byId } = state$.value.Contents.contents;
    const childrenIds: Array<T.Content['id']> = allIds
      .reduce<T.Content['id'][]>((acc, cid) => {
        const child: T.Content | undefined = byId[cid];
        if (child?.groupId === id) {
          return acc.concat(cid);
        }

        return acc;
      }, []);

    return childrenIds.map((cid) => RemoveContent({ contentId: cid }));
  }),
);

const checkAndRemoveGroupEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(CheckAndRemoveGroup),
  mergeMap(({ id }) => {
    const { byId } = state$.value.Contents.contents;
    const content: T.Content | undefined = byId[id];
    if (content === undefined) {
      return [];
    }

    const groupId = content.type === T.ContentType.GROUP ? content.id : content.groupId;
    if (groupId === undefined) {
      return [];
    }

    const selectedGroupId = state$.value.Groups.selectedGroupIdByTab[CategoryToTabMapper[content.category]];

    // Always clear editing content because
    // there's a great chance user is currently selecting a deleted content.
    const baseActions: Action[] = [ChangeEditingContent({})];

    // If it happens to be the currently selected group, deselect them.
    const actions: Action[] = selectedGroupId === content.id
      ? baseActions.concat([ChangeSelectedGroupId({ tab: CategoryToTabMapper[content.category] })])
      : baseActions;

    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const URL: string = `${makeV2APIURL('projects', content.projectId, 'contents')}?contentIds=[${groupId}]`;

    return concat<Action>(
      ajax.get(URL, header).pipe(
        map(({ response }) => response.data),
        mergeMap((groups: T.GroupContent[]) => {
          // This means the group is already gone in DB,
          // possibly by another user. Remove them in the client.
          if (groups.length === 0) {
            return actions.concat([
              RemoveContent({ contentId: groupId }),
              RemoveGroupChildren({ id: groupId }),
              RemoveContentFromGroupTree({ content }),
            ]);
          }

          return [];
        }),
        catchError((err) => {
          // eslint-disable-next-line no-console
          console.error(err);

          return [];
        })
      ),
    );
  }),
);

const rebuildTreeEpic: Epic<Action, Action, T.State> = (
  action$,
) => action$.pipe(
  ofType(ChangeContents),
  mergeMap(({ contents }) => {
    const tree = createInitialContentsTree();

    contents.forEach((content) => {
      const groupId = content.groupId ?? (content.type === T.ContentType.GROUP ? content.id : undefined);
      if (groupId && tree.idsByGroup[groupId] === undefined) {
        tree.idsByGroup[groupId] = [];
      }

      // Only root-level content should be in the rootIdsByCategory,
      // otherwise it should at least belong to a group in idsByGroup.
      if (content.groupId === undefined) {
        const contentCategory = tree.rootIdsByCategory[content.category];

        // Sort the content by its screen.
        if (content.screenId === undefined) {
          contentCategory.pinned.push(content.id);
        } else {
          if (contentCategory.unpinned[content.screenId] === undefined) {
            contentCategory.unpinned[content.screenId] = [];
          }

          contentCategory.unpinned[content.screenId].push(content.id);
        }
      } else {
        tree.idsByGroup[content.groupId].push(content.id);
      }
    });

    return [RebuildTree({ tree })];
  }),
);

const addContentToTreeEpic: Epic<Action, Action, T.State> = (
  action$,
) => action$.pipe(
  ofType(AddContentToTree),
  mergeMap(({ content, target, moveOption }) => [
    AddContentToGroupTree({ content, target, moveOption }),
    AddContentToCategoryTree({ content, target, moveOption }),
  ]),
);

const removeContentFromTreeEpic: Epic<Action, Action, T.State> = (
  action$,
) => action$.pipe(
  ofType(RemoveContentFromTree),
  mergeMap(({ content }) => [
    RemoveContentFromGroupTree({ content }),
    RemoveContentFromCategoryTree({ content }),
  ]),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  addNewGroupEpic,
  copySelectedGroupEpic,
  moveContentEpic,
  removeGroupChildrenEpic,
  checkAndRemoveGroupEpic,
  rebuildTreeEpic,
  addContentToTreeEpic,
  removeContentFromTreeEpic,
);

const groupsStateLens: LensS<T.GroupsState, T.GroupsState> = new LensGenerator<T.GroupsState>().fromKeys();
const treeLens = groupsStateLens.focusTo('tree');
const idsByGroupLens = treeLens.focusTo('idsByGroup');
const rootIdsByCategoryLens = treeLens.focusTo('rootIdsByCategory');

// Redux reducer
const initialState: T.GroupsState = {
  selectedGroupIdByTab: {
    [T.ContentPageTabType.OVERLAY]: undefined,
    [T.ContentPageTabType.MEASUREMENT]: undefined,
    [T.ContentPageTabType.ESS]: undefined,
    [T.ContentPageTabType.MAP]: undefined,
    [T.ContentPageTabType.PHOTO]: undefined,
  },
  isCreatingNewGroup: false,
  isGroupAlreadyDeleted: false,
  isCreatingContentOnDeletedGroup: false,
  tree: createInitialContentsTree(),
  moveContentStatus: T.APIStatus.IDLE,
};

const reducer: Reducer<T.GroupsState> = (
  state = initialState, action: Action,
) => {
  switch (action.type) {
    case MoveContent.type: {
      return {
        ...state,
        moveContentStatus: T.APIStatus.PROGRESS,
      };
    }
    case FinishMoveContent.type: {
      return {
        ...state,
        moveContentStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        moveContentError: action.error,
      };
    }
    case ChangeSelectedGroupId.type: {
      return {
        ...state,
        selectedGroupIdByTab: {
          ...state.selectedGroupIdByTab,
          [action.tab]: action.selectedGroupId,
        },
      };
    }
    case ChangeIsCreatingNewGroup.type: {
      return {
        ...state,
        isCreatingNewGroup: action.isCreatingNewGroup,
      };
    }
    case ChangeIsGroupAlreadyDeleted.type: {
      return {
        ...state,
        isGroupAlreadyDeleted: action.isGroupAlreadyDeleted,
      };
    }
    case ChangeIsCreatingContentOnDeletedGroup.type: {
      return {
        ...state,
        isCreatingContentOnDeletedGroup: action.isCreatingContentOnDeletedGroup,
      };
    }
    case RebuildTree.type: {
      return {
        ...state,
        tree: action.tree,
      };
    }
    case AddContentToGroupTree.type: {
      const { content, target, moveOption } = action;

      return idsByGroupLens.map()(state)((idsByGroup) => {
        if (content.groupId === undefined) {
          if (!idsByGroup[content.id]) {
            return _.set(idsByGroup, content.id, []);
          }

          // It's not possible to add a group content if it's already there.
          // Possibly a UI bug.
          // eslint-disable-next-line no-console
          console.warn('Unable to add group that already exists', content);

          return idsByGroup;
        }

        const currentGroup = idsByGroup[content.groupId];
        if (currentGroup !== undefined) {
          const index = getIndexFromList(currentGroup, moveOption, target?.id);

          return _.set(
            idsByGroup,
            content.groupId,
            addIdWhenInexist(currentGroup, content.id, index)
          );
        }

        // It is impossible for a children to have a groupId
        // without a group in the tree. Possibly a UI bug.
        // eslint-disable-next-line no-console
        console.warn('Unable to add: No group id found in the groups tree for', content);

        return idsByGroup;
      });
    }
    case AddContentToCategoryTree.type: {
      const { content, target, moveOption } = action;

      // Category tree only consists of root-level items.
      if (content.groupId !== undefined) {
        return state;
      }

      return rootIdsByCategoryLens
        .focusTo(content.category)
        .map()(state)(({ pinned, unpinned }) => {
          const list = content.screenId === undefined
            ? pinned
            : unpinned[content.screenId] ?? [];

          const index = getIndexFromList(list, moveOption, target?.id);

          if (content.screenId === undefined) {
            return {
              pinned: addIdWhenInexist(pinned, content.id, index),
              unpinned,
            };
          }

          if (unpinned[content.screenId] === undefined) {
            return {
              pinned,
              unpinned: _.set(
                unpinned,
                content.screenId,
                [content.id]
              ),
            };
          }

          return {
            pinned,
            unpinned: _.set(
              unpinned,
              content.screenId,
              addIdWhenInexist(unpinned[content.screenId], content.id, index)
            ),
          };
        });
    }
    case RemoveContentFromGroupTree.type: {
      const { content } = action;

      return idsByGroupLens.map()(state)((idsByGroup) => {
        if (content.groupId === undefined) {
          if (idsByGroup[content.id]) {
            return _.omit(idsByGroup, content.id);
          }

          // It's not possible to remove a group if it's not there.
          // Possibly a UI bug.
          // eslint-disable-next-line no-console
          console.warn('Unable to remove group that does not exist', content);

          return idsByGroup;
        }

        const currentGroup = idsByGroup[content.groupId];
        if (currentGroup !== undefined) {
          const removedList = _.without(currentGroup, content.id);

          // There's a chance that somehow the item is not even in the group.
          // If that happens, the removal failed and it has to retry
          // using the fallback method below.
          if (removedList.length < currentGroup.length) {
            return _.set(idsByGroup, content.groupId, removedList);
          }
        }

        // It is impossible to remove a child that does not belong in a group.
        // Possibly a UI bug.
        // eslint-disable-next-line no-console
        console.warn('Unable to remove: No group id found in the groups tree for', content);

        // Regardless of the group id, remove whatever group it belongs to.
        const fallbackGroupId = Object.keys(idsByGroup).find((groupId) => idsByGroup[parseInt(groupId, 10)].includes(content.id));

        // If there still isn't, for some reason this content
        // is there but not in any group and the group id does not exist.
        // It should not be in the tree, so it shouldn't be seen by user.
        if (fallbackGroupId === undefined) {
          // eslint-disable-next-line no-console
          console.warn('Unable to remove: group id in the content is not a group', content.groupId);

          return idsByGroup;
        }

        return _.set(
          idsByGroup,
          fallbackGroupId,
          _.without(idsByGroup[parseInt(fallbackGroupId, 10)], content.id),
        );
      });
    }
    case RemoveContentFromCategoryTree.type: {
      const { content } = action;

      // Category tree only consists of root-level items.
      if (content.groupId !== undefined) {
        return state;
      }

      return rootIdsByCategoryLens
        .focusTo(content.category)
        .map()(state)(({ pinned, unpinned }) => {
          if (content.screenId === undefined) {
            const removedPinnedList = _.without(pinned, content.id);

            if (removedPinnedList.length < pinned.length) {
              return {
                pinned: removedPinnedList,
                unpinned,
              };
            }
          }

          const unpinnedList = unpinned[content.screenId ?? NaN] ?? [];
          const removedUnpinnedList = _.without(unpinnedList, content.id);

          if (content.screenId !== undefined && removedUnpinnedList.length < unpinnedList.length) {
            return {
              pinned,
              unpinned: _.set(
                unpinned,
                content.screenId,
                _.without(unpinned[content.screenId], content.id)
              ),
            };
          }

          // Changes are, the content is not in either pinned or unpinned.
          // If so, clear out both pinned and unpinned regardless as a fallback.
          const fallbackSceenId = Object.keys(unpinned)
            .find((screenId) => unpinned[parseInt(screenId, 10)].includes(content.id));

          return {
            pinned: _.without(pinned, content.id),
            unpinned: fallbackSceenId === undefined
              ? unpinned
              : _.set(
                unpinned,
                fallbackSceenId,
                _.without(unpinned[parseInt(fallbackSceenId, 10)], content.id)
              ),
          };
        });
    }
    default:
      return state;
  }
};

export default reducer;

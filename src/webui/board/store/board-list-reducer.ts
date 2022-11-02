import type { BoardList, UniqueId } from 'core/entities';

type ReducerState = { boardList: BoardList; activeBoardId: UniqueId | null };
type ReducerAction =
  | { type: 'SET_LIST'; list: ReducerState['boardList'] }
  | {
      type: 'SET_ACTIVE_ID';
      id: ReducerState['activeBoardId'];
    };

export function boardListReducer(state: ReducerState, action: ReducerAction) {
  switch (action.type) {
    case 'SET_LIST':
      return {
        boardList: action.list,
        activeBoardId: resetActiveBoardId(action.list, state.activeBoardId),
      };
    case 'SET_ACTIVE_ID':
      return { ...state, activeBoardId: action.id };
    default:
      return state;
  }
}

function resetActiveBoardId(list: BoardList, activeId: UniqueId | null) {
  if (list.find((board) => board.id === activeId)) {
    return activeId;
  } else {
    return list.length > 0 ? list[0].id : null;
  }
}

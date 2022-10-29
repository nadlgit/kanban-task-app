import type { BoardList, UniqueId } from 'core/entities';

type ReducerState = UniqueId | null;
type ReducerAction =
  | { type: 'SET'; payload: ReducerState }
  | {
      type: 'RESET';
      payload: BoardList;
    };

export function activeBoardIdReducer(state: ReducerState, action: ReducerAction) {
  switch (action.type) {
    case 'SET':
      return action.payload;
    case 'RESET':
      if (!action.payload.find((board) => board.id === state)) {
        return action.payload.length > 0 ? action.payload[0].id : null;
      }
      return state;
    default:
      return state;
  }
}

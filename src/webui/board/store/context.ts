import { createContext } from 'react';

import type { BoardList, UniqueId } from 'core/entities';

export const BoardContext = createContext<
  | {
      loading: boolean;
      boardList: BoardList;
      activeBoardId: UniqueId | null;
      setActiveBoardId: (id: UniqueId | null) => void;
    }
  | undefined
>(undefined);

import type { ColumnEntity } from './column';
import type { UniqueId } from 'core/entities';

export type BoardEntity = {
  id: UniqueId;
  name: string;
  columns: ColumnEntity[];
};

export type BoardList = Pick<BoardEntity, 'id' | 'name'>[];

import { Button, Menu } from 'webui/shared';

type BoardActionsProps = { isMobile: boolean };
export const BoardActions = ({ isMobile }: BoardActionsProps) => {
  return (
    <div>
      <Button variant="primary-s">{isMobile ? '+' : '+ Add New Task'}</Button>
      <Menu items={['Edit Board', 'Delete Board']} alignment="right" />
    </div>
  );
};

import { BoardListNav } from './board-list-nav';
import { ExitDemo } from '../board-demo';
import { Logout } from 'webui/auth';
import { useIsDemo } from 'webui/board';
import { ThemeSwitch } from 'webui/theme';

export const BoardMenuDetails = () => {
  const isDemo = useIsDemo();
  return (
    <>
      <BoardListNav />
      <ThemeSwitch />
      {isDemo ? <ExitDemo /> : <Logout />}
    </>
  );
};
